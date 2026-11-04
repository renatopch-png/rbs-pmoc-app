import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { BookOpen, FileDown, Plus, Snowflake, Trash2 } from "lucide-react";
import CatalogoServicos from "../../components/CatalogoServicos";
import { auth, db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { STATUS, TIPOS_ITEM, brl, calcularTotais, numeroFmt, proximoNumero, totalItem } from "../../lib/orcamentos";

const CAMPO = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const NOVO_ITEM = { descricao: "", tipo: "Mão de Obra", qtd: 1, unidade: "un", valorUnit: "", equipamentoId: "", equipamentoNome: "" };
// Rótulo do equipamento usado no item e no PDF (ex.: "Split Hi-Wall • 12.000 BTU/h • Sala 2").
const nomeEquipamento = (e) => [e.nome || e.tipo, e.capacidade, e.local].filter(Boolean).join(" • ");
const INICIAL = {
  clienteId: "", objeto: "", escopo: "", descricaoDetalhada: "", status: "Rascunho",
  itens: [{ ...NOVO_ITEM }], frete: "", desconto: "",
  validadeDias: 15, prazoExecucao: "", condicoesPagamento: "",
  garantia: "90 dias para os serviços executados; equipamentos conforme garantia do fabricante.",
  naoInclusos: "", observacoes: "", requerArt: false, malhaAterramento: false,
  complexidadeAlvenaria: "", distanciaCabeamento: "",
};

function Bloco({ titulo, children }) {
  return <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm"><h2 className="font-bold text-rbs-navy">{titulo}</h2>{children}</section>;
}
function Campo({ rotulo, children }) {
  return <label className="block text-xs font-semibold text-slate-600">{rotulo}<div className="mt-1 font-normal">{children}</div></label>;
}

// Orçamento/proposta do contrato PMOC, montado a partir do Cadastro Preventivo:
// um item por equipamento (valor mensal dividido) e condições do contrato.
function orcamentoDoContrato(p) {
  const ids = p.equipamentoIds || [];
  const nomes = p.equipamentoNomes || [];
  const total = Number(p.valor) || 0;
  const n = Math.max(ids.length, 1);
  const parte = Math.floor((total / n) * 100) / 100;
  const itens = ids.length
    ? ids.map((eid, i) => ({
      ...NOVO_ITEM, descricao: `${p.servico} — ${nomes[i] || "equipamento"}`, equipamentoId: eid, equipamentoNome: nomes[i] || "",
      valorUnit: i === n - 1 ? Math.round((total - parte * (n - 1)) * 100) / 100 : parte,
    }))
    : [{ ...NOVO_ITEM, descricao: p.servico, valorUnit: total }];
  return {
    ...INICIAL,
    clienteId: p.clienteId || "",
    objeto: `Contrato de manutenção preventiva ${String(p.periodicidade || "mensal").toLowerCase()} — PMOC`,
    escopo: `${p.servico}, com periodicidade ${String(p.periodicidade || "mensal").toLowerCase()}, em ${ids.length || "todos os"} equipamento(s), conforme Plano de Manutenção, Operação e Controle (PMOC) — Lei 13.589/2018 e Portaria MS 3.523/98. Inclui checklist, registro fotográfico e relatório PMOC por visita.`,
    descricaoDetalhada: nomes.length ? `Equipamentos atendidos:\n${nomes.map((x) => `• ${x}`).join("\n")}` : "",
    itens,
    prazoExecucao: `Visitas conforme cronograma do PMOC (periodicidade ${String(p.periodicidade || "mensal").toLowerCase()})`,
    condicoesPagamento: `Mensal, com vencimento todo dia ${p.diaVencimento || 10}, via Pix ou transferência`,
    preventivoId: p.id,
  };
}

export default function FormOrcamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(INICIAL);
  const [numero, setNumero] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [precos, setPrecos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [catalogoAberto, setCatalogoAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const snapCli = await getDocs(collection(db, "clientes"));
        setClientes(snapCli.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")));
        const snapEq = await getDocs(collection(db, "equipamentos"));
        setEquipamentos(snapEq.docs.map((d) => ({ id: d.id, ...d.data() })));
        const snapPrecos = await getDocs(collection(db, "tabela_precos"));
        setPrecos(snapPrecos.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
        if (id) {
          const snap = await getDoc(doc(db, "orcamentos", id));
          if (!snap.exists()) { setErro("Orçamento não encontrado."); return; }
          const dados = snap.data();
          setNumero(dados.numero);
          setForm({ ...INICIAL, ...dados });
        } else if (state?.dePreventivo) {
          setForm(orcamentoDoContrato(state.dePreventivo));
        }
      } catch (e) {
        setErro("Não foi possível carregar. Confira se as novas regras do banco foram publicadas.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  const totais = useMemo(() => calcularTotais(form.itens, form.desconto, form.frete), [form.itens, form.desconto, form.frete]);
  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const equipDoCliente = useMemo(
    () => equipamentos.filter((e) => e.clienteId === form.clienteId).sort((a, b) => nomeEquipamento(a).localeCompare(nomeEquipamento(b), "pt-BR")),
    [equipamentos, form.clienteId],
  );
  // Trocar de cliente desfaz o vínculo dos itens com equipamentos do cliente anterior.
  const mudarCliente = (clienteId) => setForm((f) => ({
    ...f, clienteId, itens: f.itens.map((it) => ({ ...it, equipamentoId: "", equipamentoNome: "" })),
  }));
  function vincularEquipamento(i, equipamentoId) {
    const e = equipamentos.find((x) => x.id === equipamentoId);
    setForm((f) => ({ ...f, itens: f.itens.map((it, n) => (n === i ? { ...it, equipamentoId: e?.id || "", equipamentoNome: e ? nomeEquipamento(e) : "" } : it)) }));
  }
  // Atalho para contratos de manutenção: um item por equipamento do cliente.
  function itemPorEquipamento() {
    if (!equipDoCliente.length) return;
    const servico = window.prompt("Serviço para cada equipamento:", "Manutenção preventiva mensal (PMOC)");
    if (!servico) return;
    setForm((f) => {
      const semVazio = f.itens.filter((it) => it.descricao.trim() || it.valorUnit !== "");
      const jaTem = new Set(semVazio.map((it) => it.equipamentoId).filter(Boolean));
      const novos = equipDoCliente.filter((e) => !jaTem.has(e.id)).map((e) => ({
        ...NOVO_ITEM, descricao: `${servico} — ${nomeEquipamento(e)}`, equipamentoId: e.id, equipamentoNome: nomeEquipamento(e),
      }));
      return { ...f, itens: [...semVazio, ...novos] };
    });
  }
  const mudarItem = (i, campo, valor) => setForm((f) => ({ ...f, itens: f.itens.map((it, n) => (n === i ? { ...it, [campo]: valor } : it)) }));
  const removerItem = (i) => setForm((f) => ({ ...f, itens: f.itens.filter((_, n) => n !== i) }));
  const adicionarItem = (item = NOVO_ITEM) => setForm((f) => {
    const semVazio = f.itens.filter((it) => it.descricao.trim() || it.valorUnit !== "");
    return { ...f, itens: [...semVazio, { ...item }] };
  });
  function usarPreco(precoId) {
    const p = precos.find((x) => x.id === precoId);
    if (p) adicionarItem({ descricao: p.nome, tipo: p.tipo, qtd: 1, unidade: p.unidade, valorUnit: p.preco });
  }

  async function salvar(e) {
    e.preventDefault();
    const itens = form.itens.filter((i) => i.descricao.trim());
    const cliente = clientes.find((c) => c.id === form.clienteId);
    if (!cliente) return setErro("Selecione o cliente.");
    if (itens.length === 0) return setErro("Adicione ao menos um item com descrição.");
    if (totais.valorTotal < 0) return setErro("O desconto é maior que o total.");
    setSalvando(true);
    setErro("");
    const normalizados = itens.map((i) => ({
      ...i, descricao: i.descricao.trim(), qtd: Number(i.qtd) || 0, valorUnit: Number(i.valorUnit) || 0,
      equipamentoId: i.equipamentoId || "", equipamentoNome: i.equipamentoNome || "",
    }));
    const dados = {
      ...form,
      itens: normalizados,
      ...calcularTotais(normalizados, form.desconto, form.frete),
      frete: Number(form.frete) || 0,
      desconto: Number(form.desconto) || 0,
      clienteNome: cliente.nome || "",
      clienteEndereco: cliente.endereco || "",
      clienteTelefone: cliente.telefone || "",
      qtdServicos: normalizados.length,
      equipamentoIds: [...new Set(normalizados.map((i) => i.equipamentoId).filter(Boolean))],
      atualizadoEm: serverTimestamp(),
    };
    try {
      if (id) {
        await updateDoc(doc(db, "orcamentos", id), dados);
        navigate(`/orcamentos/${id}/pdf`);
      } else {
        const novoNumero = await proximoNumero();
        const ref = await addDoc(collection(db, "orcamentos"), {
          ...dados, numero: novoNumero, criadoEm: serverTimestamp(), criadoPor: auth.currentUser?.uid || null,
        });
        navigate(`/orcamentos/${ref.id}/pdf`);
      }
    } catch (e2) {
      setErro("Não foi possível salvar: " + e2.message);
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!window.confirm(`Excluir o orçamento #${numeroFmt(numero)}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteDoc(doc(db, "orcamentos", id));
      navigate("/orcamentos");
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  if (carregando) return <p className="p-4 text-sm text-gray-500">Carregando...</p>;

  return (
    <form onSubmit={salvar} className="mx-auto max-w-4xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-rbs-navy">{id ? `Orçamento #${numeroFmt(numero)}` : "Novo orçamento"}</h1>
        {id && <Link to={`/orcamentos/${id}/pdf`} className="inline-flex items-center gap-1 rounded-lg border border-rbs px-3 py-2 text-sm font-semibold text-rbs"><FileDown size={16} /> Ver PDF</Link>}
      </div>

      <Bloco titulo="Identificação">
        <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
          <Campo rotulo="Cliente">
            <select required className={CAMPO} value={form.clienteId} onChange={(e) => mudarCliente(e.target.value)}>
              <option value="">Selecione</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Status">
            <select className={CAMPO} value={form.status} onChange={(e) => mudar("status", e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
          </Campo>
        </div>
        <Campo rotulo="Objeto"><input className={CAMPO} value={form.objeto} onChange={(e) => mudar("objeto", e.target.value)} placeholder="Ex.: manutenção corretiva de sistema VRF" /></Campo>
        <Campo rotulo="Escopo do serviço"><textarea rows={2} className={CAMPO} value={form.escopo} onChange={(e) => mudar("escopo", e.target.value)} /></Campo>
        <Campo rotulo="Descrição detalhada e especificações técnicas"><textarea rows={3} className={CAMPO} value={form.descricaoDetalhada} onChange={(e) => mudar("descricaoDetalhada", e.target.value)} /></Campo>
      </Bloco>

      <Bloco titulo="Itens">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => setCatalogoAberto(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm">
            <BookOpen size={16} /> Catálogo de serviços e materiais
          </button>
          {precos.length > 0 && (
            <select aria-label="Adicionar da tabela de preços" className={CAMPO} value="" onChange={(e) => usarPreco(e.target.value)}>
              <option value="">+ Adicionar da minha Tabela de Preços</option>
              {precos.map((p) => <option key={p.id} value={p.id}>{p.nome} ({brl(p.preco)})</option>)}
            </select>
          )}
        </div>
        {catalogoAberto && <CatalogoServicos precos={precos} aoAdicionar={(item) => adicionarItem({ ...NOVO_ITEM, ...item })} aoFechar={() => setCatalogoAberto(false)} />}
        {form.itens.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-xl border border-slate-200 p-2 sm:grid-cols-[1fr_145px_70px_60px_100px_100px_auto] sm:items-center">
            <input aria-label="Descrição" placeholder="Descrição" className={`${CAMPO} col-span-3 sm:col-span-1`} value={item.descricao} onChange={(e) => mudarItem(i, "descricao", e.target.value)} />
            <select aria-label="Tipo" className={`${CAMPO} col-span-3 sm:col-span-1`} value={item.tipo} onChange={(e) => mudarItem(i, "tipo", e.target.value)}>{TIPOS_ITEM.map((t) => <option key={t}>{t}</option>)}</select>
            <input aria-label="Quantidade" type="number" min="0" step="0.01" className={CAMPO} value={item.qtd} onChange={(e) => mudarItem(i, "qtd", e.target.value)} />
            <input aria-label="Unidade" className={CAMPO} value={item.unidade} onChange={(e) => mudarItem(i, "unidade", e.target.value)} />
            <input aria-label="Valor unitário" type="number" min="0" step="0.01" placeholder="R$" className={`${CAMPO} col-span-2 sm:col-span-1`} value={item.valorUnit} onChange={(e) => mudarItem(i, "valorUnit", e.target.value)} />
            <p className="self-center text-right text-sm font-bold text-green-700">{brl(totalItem(item))}</p>
            <button type="button" aria-label="Remover item" className="justify-self-end p-1 text-red-600" onClick={() => removerItem(i)}><Trash2 size={16} /></button>
            {form.clienteId && (
              <label className="col-span-3 flex items-center gap-2 sm:col-span-7">
                <Snowflake size={16} className={`shrink-0 ${item.equipamentoId ? "text-cyan-600" : "text-slate-300"}`} />
                <select aria-label="Equipamento do item" className={`${CAMPO} ${item.equipamentoId ? "border-cyan-300 bg-cyan-50/50" : "text-slate-500"}`} value={item.equipamentoId || ""} onChange={(e) => vincularEquipamento(i, e.target.value)}>
                  <option value="">{equipDoCliente.length ? "Sem vínculo com equipamento" : "Cliente sem equipamentos cadastrados"}</option>
                  {equipDoCliente.map((e) => <option key={e.id} value={e.id}>{nomeEquipamento(e)}</option>)}
                  {item.equipamentoId && !equipDoCliente.some((e) => e.id === item.equipamentoId) && <option value={item.equipamentoId}>{item.equipamentoNome}</option>}
                </select>
              </label>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <button type="button" onClick={() => adicionarItem()} className="inline-flex items-center gap-1 text-sm font-bold text-blue-700"><Plus size={16} /> Adicionar item</button>
          {equipDoCliente.length > 0 && (
            <button type="button" onClick={itemPorEquipamento} className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700"><Snowflake size={16} /> Um item por equipamento ({equipDoCliente.length})</button>
          )}
        </div>
      </Bloco>

      <Bloco titulo="Investimento">
        <div className="grid grid-cols-2 gap-2">
          <Campo rotulo="Frete regional (R$)"><input type="number" min="0" step="0.01" className={CAMPO} value={form.frete} onChange={(e) => mudar("frete", e.target.value)} /></Campo>
          <Campo rotulo="Desconto (R$)"><input type="number" min="0" step="0.01" className={CAMPO} value={form.desconto} onChange={(e) => mudar("desconto", e.target.value)} /></Campo>
        </div>
        <dl className="space-y-1 rounded-xl bg-rbs-light p-3 text-sm">
          <div className="flex justify-between"><dt>Mão de Obra</dt><dd className="font-semibold">{brl(totais.subtotalMaoObra)}</dd></div>
          <div className="flex justify-between"><dt>Materiais</dt><dd className="font-semibold">{brl(totais.subtotalMateriais)}</dd></div>
          <div className="flex justify-between border-t border-blue-200 pt-1 text-base font-extrabold text-rbs-navy"><dt>Total</dt><dd>{brl(totais.valorTotal)}</dd></div>
        </dl>
      </Bloco>

      <Bloco titulo="Condições e variáveis técnicas">
        <div className="grid gap-2 sm:grid-cols-2">
          <Campo rotulo="Validade (dias)"><input type="number" min="1" className={CAMPO} value={form.validadeDias} onChange={(e) => mudar("validadeDias", e.target.value)} /></Campo>
          <Campo rotulo="Prazo de execução / entrega"><input className={CAMPO} value={form.prazoExecucao} onChange={(e) => mudar("prazoExecucao", e.target.value)} /></Campo>
          <Campo rotulo="Complexidade da alvenaria"><input className={CAMPO} value={form.complexidadeAlvenaria} onChange={(e) => mudar("complexidadeAlvenaria", e.target.value)} /></Campo>
          <Campo rotulo="Distância de cabeamento (m)"><input className={CAMPO} value={form.distanciaCabeamento} onChange={(e) => mudar("distanciaCabeamento", e.target.value)} /></Campo>
        </div>
        <Campo rotulo="Forma de pagamento"><input className={CAMPO} value={form.condicoesPagamento} onChange={(e) => mudar("condicoesPagamento", e.target.value)} /></Campo>
        <Campo rotulo="Garantia"><input className={CAMPO} value={form.garantia} onChange={(e) => mudar("garantia", e.target.value)} /></Campo>
        <Campo rotulo="Itens não inclusos"><input className={CAMPO} value={form.naoInclusos} onChange={(e) => mudar("naoInclusos", e.target.value)} /></Campo>
        <Campo rotulo="Observações"><textarea rows={2} className={CAMPO} value={form.observacoes} onChange={(e) => mudar("observacoes", e.target.value)} /></Campo>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.requerArt} onChange={(e) => mudar("requerArt", e.target.checked)} /> Requer ART/TRT</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.malhaAterramento} onChange={(e) => mudar("malhaAterramento", e.target.checked)} /> Inclui malha de aterramento</label>
        </div>
      </Bloco>

      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
      <div className="flex flex-wrap justify-between gap-2 pb-6">
        {id && isAdmin ? <button type="button" onClick={excluir} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Excluir</button> : <span />}
        <button disabled={salvando} className="rounded-lg bg-rbs px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">{salvando ? "Salvando..." : "Salvar e ver PDF"}</button>
      </div>
    </form>
  );
}
