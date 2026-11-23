import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where,
} from "firebase/firestore";
import { CalendarPlus, CheckCircle2, Download, Sparkles } from "lucide-react";
import { auth, db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { brl, calcularTotais, numeroFmt, proximoNumero } from "../../lib/orcamentos";
import { linkGoogleAgenda } from "../../lib/googleAgenda";

// Lançamento por link: o Claude monta um link /importar#d=<dados> e o Renato
// confirma aqui. Os dados ficam só no "#" do link (não passam por servidor)
// e são gravados com o login dele. Repetir o mesmo link não duplica nada.

const CHAVE = "rbs_importacao";
const normalizar = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

function decodificar(codigo) {
  const b64 = codigo.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function lerPacote() {
  let codigo = window.location.hash.startsWith("#d=") ? window.location.hash.slice(3) : "";
  try { codigo = codigo || sessionStorage.getItem(CHAVE) || ""; } catch { /* opcional */ }
  if (!codigo) return { erro: "Nenhum lançamento neste link." };
  try {
    const p = decodificar(codigo);
    if (!p.id || !p.cliente?.nome) return { erro: "Link incompleto." };
    return { pacote: p };
  } catch {
    return { erro: "Link inválido ou cortado. Peça ao Claude para gerar de novo." };
  }
}

function limparPendente() {
  try { sessionStorage.removeItem(CHAVE); } catch { /* opcional */ }
  if (window.location.hash) window.history.replaceState(null, "", "/importar");
}

// Uma unidade por equipamento: "Split Hi-Wall 12.000 BTU/h" x3 vira #1, #2, #3.
function expandirEquipamentos(lista = []) {
  return lista.flatMap((e) => {
    const qtd = Math.max(1, Number(e.quantidade) || 1);
    return Array.from({ length: qtd }, (_, i) => ({ ...e, nome: qtd > 1 ? `${e.nome} #${i + 1}` : e.nome }));
  });
}

async function lancar(p) {
  const resultado = { novos: [], existentes: [] };

  // 1) Cliente: reaproveita se já houver um com o mesmo nome.
  const cliSnap = await getDocs(collection(db, "clientes"));
  const cliExistente = cliSnap.docs.find((d) => normalizar(d.data().nome) === normalizar(p.cliente.nome));
  let clienteId;
  const dadosCliente = {
    nome: p.cliente.nome.trim(), edificio: p.cliente.edificio || "", endereco: p.cliente.endereco || "",
    contato: p.cliente.contato || "", telefone: p.cliente.telefone || "",
  };
  if (cliExistente) {
    clienteId = cliExistente.id;
    resultado.existentes.push(`Cliente ${dadosCliente.nome}`);
  } else {
    clienteId = (await addDoc(collection(db, "clientes"), { ...dadosCliente, criadoEm: serverTimestamp(), origem: "claude" })).id;
    resultado.novos.push(`Cliente ${dadosCliente.nome}`);
  }

  // 2) Equipamentos do cliente (não repete nome já cadastrado).
  const eqSnap = await getDocs(query(collection(db, "equipamentos"), where("clienteId", "==", clienteId)));
  const jaTem = new Map(eqSnap.docs.map((d) => [normalizar(d.data().nome), { id: d.id, ...d.data() }]));
  const equipamentos = [];
  for (const e of expandirEquipamentos(p.equipamentos)) {
    const existente = jaTem.get(normalizar(e.nome));
    if (existente) { equipamentos.push(existente); continue; }
    const dados = {
      nome: e.nome, tipo: e.tipo || "Split Hi-Wall", marca: e.marca || "", modelo: e.modelo || "",
      capacidade: e.capacidade || "", local: e.local || "", numeroSerie: "", clienteId,
      periodicidade: e.periodicidade || "Mensal", ocupanteFixo: "", ocupanteFlutuante: "", areaClimatizada: "",
      categoriaSistema: e.categoriaSistema || "", tipoGas: e.tipoGas || "",
    };
    const ref = await addDoc(collection(db, "equipamentos"), { ...dados, criadoEm: serverTimestamp(), origem: "claude" });
    equipamentos.push({ id: ref.id, ...dados });
  }
  if (equipamentos.length) resultado.novos.push(`${equipamentos.length} equipamento(s)`);

  // 3) Orçamento (um por link: o id do lançamento evita duplicar).
  let orcamentoId = null;
  let numero = null;
  if (p.orcamento) {
    const orcSnap = await getDocs(query(collection(db, "orcamentos"), where("importacaoId", "==", p.id)));
    if (!orcSnap.empty) {
      orcamentoId = orcSnap.docs[0].id;
      numero = orcSnap.docs[0].data().numero;
      resultado.existentes.push(`Orçamento #${numeroFmt(numero)}`);
    } else {
      const o = p.orcamento;
      // Item "por equipamento": distribui as unidades nos equipamentos criados.
      const itens = (o.porEquipamento && equipamentos.length
        ? equipamentos.map((e) => ({ descricao: `${o.itens[0].descricao} — ${e.nome}`, tipo: o.itens[0].tipo || "Mão de Obra", qtd: 1, unidade: "un", valorUnit: Number(o.itens[0].valorUnit) || 0, equipamentoId: e.id, equipamentoNome: e.nome }))
        : o.itens.map((i) => ({ descricao: i.descricao, tipo: i.tipo || "Mão de Obra", qtd: Number(i.qtd) || 1, unidade: i.unidade || "un", valorUnit: Number(i.valorUnit) || 0, equipamentoId: "", equipamentoNome: "" })));
      numero = await proximoNumero();
      const ref = await addDoc(collection(db, "orcamentos"), {
        clienteId, objeto: o.objeto || "", escopo: o.escopo || "", descricaoDetalhada: o.descricaoDetalhada || "",
        status: o.status || "Rascunho", itens, frete: 0, desconto: 0, ...calcularTotais(itens, 0, 0),
        validadeDias: Number(o.validadeDias) || 15, prazoExecucao: o.prazoExecucao || "", condicoesPagamento: o.condicoesPagamento || "",
        garantia: o.garantia || "90 dias para os serviços executados; equipamentos conforme garantia do fabricante.",
        naoInclusos: o.naoInclusos || "", observacoes: o.observacoes || "", requerArt: !!o.requerArt, malhaAterramento: false,
        complexidadeAlvenaria: "", distanciaCabeamento: "",
        clienteNome: dadosCliente.nome, clienteEndereco: dadosCliente.endereco, clienteTelefone: dadosCliente.telefone,
        clienteContato: dadosCliente.contato, clienteEdificio: dadosCliente.edificio,
        qtdServicos: itens.length, equipamentoIds: [...new Set(itens.map((i) => i.equipamentoId).filter(Boolean))],
        numero, importacaoId: p.id, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(), criadoPor: auth.currentUser?.uid || null,
      });
      orcamentoId = ref.id;
      resultado.novos.push(`Orçamento #${numeroFmt(numero)}`);
    }
  }

  // 4) Agendamento: id fixo, então repetir o link só atualiza.
  let servico = null;
  if (p.agendamento?.data) {
    const a = p.agendamento;
    const ref = doc(db, "servicos_equipe", `imp_${p.id}`);
    const existia = (await getDoc(ref)).exists();
    servico = {
      titulo: a.titulo, funcionarioId: "", funcionarioNome: auth.currentUser?.displayName || "Responsável técnico",
      clienteId, clienteNome: dadosCliente.nome, data: a.data, hora: a.hora || "08:00", horaFim: a.horaFim || "",
      status: "Pendente", valor: Number(a.valor) || 0, comissaoPercentual: 0, comissaoValor: 0, comissaoPaga: false,
      descricao: a.descricao || "", local: dadosCliente.endereco, telefone: dadosCliente.telefone,
      orcamentoId: orcamentoId || "", importacaoId: p.id, atualizadoEm: serverTimestamp(),
    };
    await setDoc(ref, existia ? servico : { ...servico, criadoEm: serverTimestamp() }, { merge: true });
    (existia ? resultado.existentes : resultado.novos).push(`Agendamento ${a.data.split("-").reverse().join("/")}`);
  }
  return { ...resultado, orcamentoId, numero, servico };
}

export default function Importar() {
  const { isAdmin } = useAuth();
  const [{ pacote, erro: erroLink }] = useState(lerPacote);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState(null);

  useEffect(() => {
    // Mantém o pacote só até concluir: recarregar a página não perde o link.
    if (pacote && window.location.hash.startsWith("#d=")) {
      try { sessionStorage.setItem(CHAVE, window.location.hash.slice(3)); } catch { /* opcional */ }
    }
  }, [pacote]);

  async function confirmar() {
    setSalvando(true);
    setErro("");
    try {
      setFeito(await lancar(pacote));
      limparPendente();
    } catch (e) {
      setErro("Não foi possível lançar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!isAdmin) return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Somente o administrador pode lançar por link.</p>;
  if (erroLink && !feito) return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">{erroLink}</p>;

  const p = pacote;
  const equipamentos = expandirEquipamentos(p.equipamentos);
  const itensPrevia = p.orcamento
    ? (p.orcamento.porEquipamento && equipamentos.length
      ? equipamentos.map(() => ({ ...p.orcamento.itens[0], qtd: 1 }))
      : p.orcamento.itens)
    : [];
  const total = calcularTotais(itensPrevia.map((i) => ({ ...i, tipo: i.tipo || "Mão de Obra" })), 0, 0).valorTotal;
  const a = p.agendamento;
  const linkGoogle = a?.data && !a.jaNoGoogle ? linkGoogleAgenda({
    titulo: `${a.titulo} – ${p.cliente.nome}`, data: a.data, hora: a.hora, horaFim: a.horaFim, local: p.cliente.endereco,
    descricao: [`Cliente: ${p.cliente.nome}`, p.cliente.telefone && `Contato: ${p.cliente.telefone}`, a.descricao, total && `Valor: ${brl(total)}`].filter(Boolean).join("\n"),
  }) : "";

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-rbs-navy"><Sparkles size={22} /> Lançamento do Claude</h1>

      {!feito && (
        <>
          <section className="space-y-1 rounded-2xl bg-white p-4 text-sm shadow-sm">
            <h2 className="font-bold text-rbs-navy">👤 Cliente</h2>
            <p className="font-semibold">{p.cliente.nome}</p>
            {p.cliente.endereco && <p className="text-slate-600">📍 {p.cliente.endereco}</p>}
            {p.cliente.telefone && <p className="text-slate-600">📞 {p.cliente.telefone}{p.cliente.contato ? ` • ${p.cliente.contato}` : ""}</p>}
          </section>
          {equipamentos.length > 0 && (
            <section className="rounded-2xl bg-white p-4 text-sm shadow-sm">
              <h2 className="font-bold text-rbs-navy">❄️ Equipamentos ({equipamentos.length})</h2>
              {equipamentos.map((e) => <p key={e.nome}>• {e.nome}{e.capacidade ? ` — ${e.capacidade}` : ""}</p>)}
            </section>
          )}
          {p.orcamento && (
            <section className="rounded-2xl bg-white p-4 text-sm shadow-sm">
              <h2 className="font-bold text-rbs-navy">📄 Orçamento</h2>
              <p className="font-semibold">{p.orcamento.objeto}</p>
              {itensPrevia.map((i, n) => <p key={n} className="text-slate-600">• {i.qtd}× {i.descricao} — {brl(i.valorUnit)}</p>)}
              <p className="mt-1 text-base font-extrabold text-rbs-navy">Total: {brl(total)}</p>
            </section>
          )}
          {a?.data && (
            <section className="rounded-2xl bg-white p-4 text-sm shadow-sm">
              <h2 className="font-bold text-rbs-navy">📅 Agendamento</h2>
              <p><b>{a.data.split("-").reverse().join("/")}</b> {a.hora}{a.horaFim ? `–${a.horaFim}` : ""} • {a.titulo}</p>
            </section>
          )}
          {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
          <button disabled={salvando} onClick={confirmar} className="w-full rounded-xl bg-rbs px-6 py-3 text-base font-bold text-white disabled:opacity-50">
            {salvando ? "Lançando..." : "✅ Lançar no PMOC"}
          </button>
          <p className="text-center text-xs text-slate-500">Se algo já estiver cadastrado, o app reaproveita e não duplica.</p>
        </>
      )}

      {feito && (
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-lg font-extrabold text-green-700"><CheckCircle2 size={22} /> Lançado no PMOC</p>
          {feito.novos.length > 0 && <p className="text-sm">Criado: {feito.novos.join(", ")}.</p>}
          {feito.existentes.length > 0 && <p className="text-sm text-slate-600">Já existia (reaproveitado): {feito.existentes.join(", ")}.</p>}
          <div className="flex flex-wrap gap-2">
            {feito.orcamentoId && <Link to={`/orcamentos/${feito.orcamentoId}/pdf`} className="inline-flex items-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white"><Download size={16} /> PDF do orçamento</Link>}
            {feito.servico && <Link to="/cronograma" className="rounded-lg border border-rbs px-4 py-2 text-sm font-semibold text-rbs">Ver na Agenda</Link>}
            {linkGoogle && <a href={linkGoogle} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-rbs px-4 py-2 text-sm font-semibold text-rbs"><CalendarPlus size={16} /> Google Agenda</a>}
          </div>
        </section>
      )}
    </div>
  );
}
