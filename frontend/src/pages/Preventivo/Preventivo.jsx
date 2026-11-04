import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CheckCircle2, FileText, HandCoins, ReceiptText, Undo2, MessageCircle, Pause, Pencil, Play, Plus, Repeat, Trash2, Wrench } from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { modulo } from "../../data/menu";
import { cobrancaOrfaDoCliente, garantirCobrancasDoMes, gerarCobranca, idCobranca, nomeMes, statusCobranca } from "../../lib/cobrancas";
import ReceberCobranca from "../../components/ReceberCobranca";
import { mesReferencia } from "../../lib/financeiro";
import { brl, numeroFmt } from "../../lib/orcamentos";
import { PERIODICIDADES, dataBR, lerColecao, linkWhatsApp, paraInput, somarPeriodo, statusPreventivo } from "../../lib/modulos";
import { BOTAO, BOTAO_SEC, Badge, Busca, CAMPO, Cabecalho, Campo, Erro, Filtros, Painel, Vazio } from "../../components/ui";

const MOD = modulo("/preventivo");
const SERVICOS = [
  "Limpeza e higienização de split",
  "Limpeza de filtros e serpentinas",
  "Manutenção preventiva PMOC",
  "Verificação de carga de gás e pressões",
  "Limpeza de dreno e bandeja",
  "Inspeção elétrica do quadro de comando",
  "Limpeza de módulos fotovoltaicos",
  "Inspeção de string box / inversor",
];
const VAZIO = {
  clienteId: "", clienteNome: "", clienteTelefone: "", equipamentoIds: [],
  servico: SERVICOS[0], periodicidade: "Trimestral", proximaData: paraInput(new Date()),
  horario: "", responsavel: "", valor: "", observacoes: "", ativo: true,
  cobrancaMensal: false, diaVencimento: 10, orcamentoId: "", orcamentoNumero: null,
};

export default function Preventivo() {
  const { isAdmin } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState("");
  const [cobrancas, setCobrancas] = useState([]);
  const [pagando, setPagando] = useState(null);
  const [lista, setLista] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [form, setForm] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState("pendentes");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    const [p, c, e, f] = await Promise.all([
      lerColecao("preventivos"), lerColecao("clientes"), lerColecao("equipamentos"),
      isAdmin ? lerColecao("funcionarios") : Promise.resolve([]),
    ]);
    if (isAdmin) {
      // Cobrança do mês de cada contrato (gera as que faltam).
      const [cob0, ordens] = await Promise.all([lerColecao("cobrancas"), lerColecao("ordens_servico")]);
      const geradas = await garantirCobrancasDoMes(p, cob0, ordens).catch(() => 0);
      setCobrancas(geradas ? await lerColecao("cobrancas") : cob0);
    }
    setLista(p);
    setClientes(c.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")));
    setEquipamentos(e);
    setFuncionarios(f);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  // Vindo do orçamento ("Agendar"/"Agendado"): abre o formulário já preenchido
  // ou o agendamento existente. O estado da navegação é limpo para não reabrir.
  useEffect(() => {
    if (carregando || !state) return;
    const { deOrcamento: o, abrirId } = state;
    navigate(".", { replace: true, state: null });
    const existente = lista.find((p) => p.id === abrirId || (o && p.orcamentoId === o.id));
    if (existente) { setFiltro("todos"); abrir(existente); return; }
    if (!o) return;
    const c = clientes.find((x) => x.id === o.clienteId);
    const equipIds = o.equipamentoIds?.length ? o.equipamentoIds : [...new Set((o.itens || []).map((i) => i.equipamentoId).filter(Boolean))];
    setErro("");
    setEditandoId(null);
    setAviso(`Agendamento do orçamento #${numeroFmt(o.numero)}. Confira a data da primeira visita.`);
    setForm({
      ...VAZIO,
      clienteId: o.clienteId || "", clienteNome: o.clienteNome || c?.nome || "", clienteTelefone: o.clienteTelefone || c?.telefone || "",
      equipamentoIds: equipIds, servico: o.objeto || "Manutenção preventiva mensal (PMOC)", periodicidade: "Mensal",
      valor: o.valorTotal ?? "", cobrancaMensal: isAdmin && Number(o.valorTotal) > 0,
      orcamentoId: o.id, orcamentoNumero: o.numero ?? null,
      observacoes: `Gerado a partir do orçamento #${numeroFmt(o.numero)}.`,
    });
  }, [carregando]); // eslint-disable-line

  const comStatus = useMemo(() => lista
    .map((p) => ({ ...p, st: statusPreventivo(p) }))
    .sort((a, b) => (a.st.dias ?? 99999) - (b.st.dias ?? 99999)), [lista]);

  const termo = busca.trim().toLowerCase();
  const grupos = {
    pendentes: (p) => p.ativo !== false && p.st.dias !== null && p.st.dias <= 7,
    atrasados: (p) => p.ativo !== false && p.st.dias !== null && p.st.dias < 0,
    todos: (p) => p.ativo !== false,
    pausados: (p) => p.ativo === false,
  };
  const visiveis = comStatus.filter((p) => grupos[filtro](p)
    && (!termo || [p.clienteNome, p.servico, p.responsavel].some((t) => (t || "").toLowerCase().includes(termo))));
  const qtd = (g) => comStatus.filter(grupos[g]).length;

  function mudar(campo, valor) {
    setForm((f) => {
      const novo = { ...f, [campo]: valor };
      if (campo === "clienteId") {
        const c = clientes.find((x) => x.id === valor);
        novo.clienteNome = c?.nome || "";
        novo.clienteTelefone = c?.telefone || "";
        novo.equipamentoIds = [];
      }
      return novo;
    });
  }

  function alternarEquip(id) {
    setForm((f) => ({ ...f, equipamentoIds: f.equipamentoIds.includes(id) ? f.equipamentoIds.filter((x) => x !== id) : [...f.equipamentoIds, id] }));
  }

  function abrir(p) {
    setErro("");
    setEditandoId(p?.id || null);
    setForm(p ? { ...VAZIO, ...p, st: undefined } : { ...VAZIO });
  }

  async function salvar(e) {
    e.preventDefault();
    if (!form.clienteNome || !form.servico.trim() || !form.proximaData) return;
    setSalvando(true);
    const { st, id, ...resto } = form;
    const nomesEquip = equipamentos.filter((x) => resto.equipamentoIds.includes(x.id)).map((x) => [x.nome || x.tipo, x.local].filter(Boolean).join(" — "));
    const dados = { ...resto, equipamentoNomes: nomesEquip, valor: resto.valor === "" ? "" : Number(resto.valor), diaVencimento: Number(resto.diaVencimento) || 10 };
    if (dados.cobrancaMensal && !(dados.valor > 0)) { setErro("Informe o valor mensal do contrato para gerar a cobrança."); setSalvando(false); return; }
    try {
      if (editandoId) await updateDoc(doc(db, "preventivos", editandoId), dados);
      else {
        const novo = await addDoc(collection(db, "preventivos"), { ...dados, historico: [], criadoEm: serverTimestamp() });
        // Marca o orçamento como agendado (botão vira "Agendado").
        if (dados.orcamentoId) await updateDoc(doc(db, "orcamentos", dados.orcamentoId), { preventivoId: novo.id }).catch(() => {});
      }
      setAviso("");
      setForm(null);
      await carregar();
    } catch (e2) {
      setErro("Não foi possível salvar. Confira se as regras do banco (preventivos) foram publicadas. " + e2.message);
    } finally {
      setSalvando(false);
    }
  }

  // Registra a execução e já agenda a próxima a partir da data prevista
  // (mantém o calendário fixo mesmo quando a visita atrasa alguns dias).
  async function concluir(p) {
    if (p.ultimaExecucao === paraInput(new Date())) {
      window.alert(`Este contrato já foi marcado como realizado hoje (próxima visita: ${dataBR(p.proximaData)}).\nSe marcou por engano, use "Desfazer".`);
      return;
    }
    const proxima = paraInput(somarPeriodo(p.proximaData, p.periodicidade));
    if (!window.confirm(`Marcar "${p.servico}" de ${p.clienteNome} como realizado hoje?\nPróxima visita: ${dataBR(proxima)}`)) return;
    try {
      const historico = [...(p.historico || []), { prevista: p.proximaData, realizada: paraInput(new Date()) }].slice(-24);
      await updateDoc(doc(db, "preventivos", p.id), { proximaData: proxima, ultimaExecucao: paraInput(new Date()), historico });
      // Contrato com cobrança mensal: a execução já gera a cobrança do mês no Financeiro.
      if (isAdmin && p.cobrancaMensal && Number(p.valor) > 0) {
        const mes = mesReferencia();
        const visitas = historico.filter((h) => h.realizada.startsWith(mes)).length;
        const nova = await gerarCobranca({ ...p, historico }, mes, { total: visitas });
        if (nova) window.alert(`Cobrança de ${brl(p.valor)} gerada em Financeiro › Cobranças PMOC.`);
      }
      await carregar();
    } catch (e) {
      setErro("Não foi possível atualizar: " + e.message);
    }
  }

  // Ativa a cobrança mensal direto no cartão do contrato.
  async function ativarCobranca(e, p) {
    e.preventDefault();
    const valor = Number(e.currentTarget.valor.value);
    const dia = Number(e.currentTarget.dia.value) || 10;
    if (!(valor > 0)) return;
    try {
      await updateDoc(doc(db, "preventivos", p.id), { cobrancaMensal: true, valor, diaVencimento: dia });
      await carregar();
    } catch (e2) {
      setErro("Não foi possível ativar a cobrança: " + e2.message);
    }
  }

  // Volta a última marcação de "Realizado" (ou avanço por OS): restaura a data prevista.
  async function desfazer(p) {
    const hist = [...(p.historico || [])];
    const ultimo = hist.pop();
    if (!ultimo?.prevista) return;
    if (!window.confirm(`Desfazer a última execução (${dataBR(ultimo.realizada)})?\nA próxima visita volta para ${dataBR(ultimo.prevista)}.`)) return;
    try {
      await updateDoc(doc(db, "preventivos", p.id), {
        proximaData: ultimo.prevista, historico: hist, ultimaExecucao: hist.length ? hist[hist.length - 1].realizada : "",
      });
      await carregar();
    } catch (e) {
      setErro("Não foi possível desfazer: " + e.message);
    }
  }

  async function alternarAtivo(p) {
    try {
      await updateDoc(doc(db, "preventivos", p.id), { ativo: p.ativo === false });
      await carregar();
    } catch (e) {
      setErro("Não foi possível atualizar: " + e.message);
    }
  }

  async function excluir(p) {
    if (!window.confirm(`Excluir o preventivo "${p.servico}" de ${p.clienteNome}?`)) return;
    try {
      await deleteDoc(doc(db, "preventivos", p.id));
      await carregar();
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  const equipDoCliente = equipamentos.filter((e) => form && e.clienteId === form.clienteId);

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <Cabecalho modulo={MOD} subtitulo="Contratos e manutenções recorrentes por cliente">
        <button onClick={() => abrir(null)} className={BOTAO}><Plus size={16} /> Novo preventivo</button>
      </Cabecalho>

      <Erro>{!form && erro}</Erro>
      {aviso && !form && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{aviso}</p>}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar cliente, serviço, responsável..." />
        <Filtros valor={filtro} aoMudar={setFiltro} opcoes={[
          { valor: "pendentes", rotulo: "Próximos 7 dias", qtd: qtd("pendentes") },
          { valor: "atrasados", rotulo: "Atrasados", qtd: qtd("atrasados") },
          { valor: "todos", rotulo: "Todos", qtd: qtd("todos") },
          { valor: "pausados", rotulo: "Pausados", qtd: qtd("pausados") },
        ]} />
      </div>

      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : visiveis.length === 0 ? (
        <Vazio>{filtro === "pendentes" ? "Nenhuma manutenção prevista para os próximos 7 dias. 👍" : "Nenhum preventivo encontrado."}</Vazio>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {visiveis.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`flex w-14 shrink-0 flex-col items-center rounded-xl py-1.5 ${p.st.dias !== null && p.st.dias < 0 ? "bg-red-50 text-red-700" : "bg-blue-50 text-rbs"}`}>
                  <span className="text-lg font-extrabold leading-none">{p.proximaData ? p.proximaData.slice(8, 10) : "--"}</span>
                  <span className="text-[10px] font-bold uppercase">{p.proximaData ? new Date(`${p.proximaData}T12:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : ""}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-rbs-navy">{p.clienteNome}</p>
                    <Badge cor={p.st.cor}>{p.st.rotulo}</Badge>
                  </div>
                  <p className="text-sm text-slate-700">{p.servico}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Repeat size={12} /> {p.periodicidade}</span>
                    {p.horario && <span>• {p.horario}</span>}
                    {p.responsavel && <span>• {p.responsavel}</span>}
                    {p.equipamentoNomes?.length > 0 && <span>• {p.equipamentoNomes.length} equip.</span>}
                  </p>
                  {p.ultimaExecucao && <p className="text-xs text-slate-400">Última: {dataBR(p.ultimaExecucao)}</p>}
                  {isAdmin && (p.cobrancaMensal && Number(p.valor) > 0 ? (() => {
                    const mes = mesReferencia();
                    const cob = cobrancas.find((x) => x.id === idCobranca(p.id, mes))
                      || cobrancaOrfaDoCliente(cobrancas, new Set(lista.map((x) => x.id)), p.clienteId, mes);
                    const st = statusCobranca(cob);
                    return (
                      <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-2">
                        <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-emerald-800">
                          <HandCoins size={12} /> {brl(p.valor)}/mês • vence dia {p.diaVencimento || 10}
                          <span className="text-slate-500">• {nomeMes(mes)}:</span>
                          <Badge cor={st.cor}>{st.rotulo}</Badge>
                        </p>
                        {cob && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {cob.status !== "Pago"
                              ? <button onClick={() => setPagando(cob)} className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">Marcar como pago</button>
                              : <Link to={`/financeiro/cobrancas/${cob.id}/recibo`} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white"><ReceiptText size={12} /> Recibo</Link>}
                            <Link to={`/financeiro/cobrancas/${cob.id}`} className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-blue-700"><FileText size={12} /> Demonstrativo</Link>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <form onSubmit={(e) => ativarCobranca(e, p)} className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2 text-[11px] font-bold text-amber-900">
                      <HandCoins size={12} /> Cobrança mensal não configurada:
                      <input name="valor" required type="number" min="1" step="0.01" defaultValue={p.valor || ""} placeholder="R$/mês" className="w-24 rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-normal" />
                      dia <input name="dia" type="number" min="1" max="31" defaultValue={p.diaVencimento || 10} className="w-14 rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-normal" />
                      <button className="rounded-lg bg-amber-600 px-2 py-1 text-white">Ativar cobrança</button>
                    </form>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-1 border-t border-slate-100 pt-2">
                {p.ativo !== false && <button onClick={() => concluir(p)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><CheckCircle2 size={14} /> Realizado</button>}
                {p.equipamentoIds?.length === 1 && (
                  <Link to={`/ordens-servico/executar/${p.equipamentoIds[0]}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-orange-700 hover:bg-orange-50"><Wrench size={14} /> Abrir OS</Link>
                )}
                {p.clienteTelefone && (
                  <a target="_blank" rel="noreferrer" href={linkWhatsApp(p.clienteTelefone, `Olá! A RBS confirma a manutenção preventiva (${p.servico}) prevista para ${dataBR(p.proximaData)}${p.horario ? ` às ${p.horario}` : ""}. Podemos confirmar?`)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-50">
                    <MessageCircle size={14} /> Confirmar
                  </a>
                )}
                <button onClick={() => navigate("/orcamentos/novo", { state: { dePreventivo: p } })} title="Gerar orçamento/proposta deste contrato" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50"><FileText size={14} /> Orçamento</button>
                {p.historico?.length > 0 && <button onClick={() => desfazer(p)} title="Desfazer a última execução" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"><Undo2 size={14} /> Desfazer</button>}
                <button onClick={() => abrir(p)} aria-label="Editar" className="rounded-lg px-2 py-1 text-rbs hover:bg-blue-50"><Pencil size={14} /></button>
                <button onClick={() => alternarAtivo(p)} aria-label={p.ativo === false ? "Reativar" : "Pausar"} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">{p.ativo === false ? <Play size={14} /> : <Pause size={14} />}</button>
                {isAdmin && <button onClick={() => excluir(p)} aria-label="Excluir" className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagando && <ReceberCobranca cobranca={pagando} aoFechar={() => setPagando(null)} aoConcluir={() => { setPagando(null); carregar(); }} />}

      {form && (
        <Painel titulo={editandoId ? "Editar preventivo" : "Novo preventivo"} aoFechar={() => setForm(null)}>
          <form onSubmit={salvar} className="grid gap-3 sm:grid-cols-2">
            <Erro>{erro}</Erro>
            {form.orcamentoId && (
              <p className="rounded-xl bg-orange-50 p-2 text-xs font-semibold text-orange-800 sm:col-span-2">
                🔁 Vinculado ao orçamento #{numeroFmt(form.orcamentoNumero)}. A data da próxima visita avança sozinha quando a OS de um equipamento do contrato é executada ou quando você marca “Realizado”.
              </p>
            )}
            <Campo rotulo="Cliente *" className="sm:col-span-2">
              <select required className={CAMPO} value={form.clienteId} onChange={(e) => mudar("clienteId", e.target.value)}>
                <option value="">Selecione...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.edificio ? ` — ${c.edificio}` : ""}</option>)}
              </select>
            </Campo>
            {equipDoCliente.length > 0 && (
              <fieldset className="sm:col-span-2">
                <legend className="mb-1 text-xs font-bold text-slate-600">Equipamentos incluídos</legend>
                <div className="grid max-h-36 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-2">
                  {equipDoCliente.map((e) => (
                    <label key={e.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.equipamentoIds.includes(e.id)} onChange={() => alternarEquip(e.id)} />
                      <span className="truncate">{[e.nome || e.tipo, e.local].filter(Boolean).join(" — ")}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <Campo rotulo="Serviço *" className="sm:col-span-2">
              <input required list="servicos-preventivos" className={CAMPO} value={form.servico} onChange={(e) => mudar("servico", e.target.value)} />
              <datalist id="servicos-preventivos">{SERVICOS.map((s) => <option key={s} value={s} />)}</datalist>
            </Campo>
            <Campo rotulo="Periodicidade">
              <select className={CAMPO} value={form.periodicidade} onChange={(e) => mudar("periodicidade", e.target.value)}>
                {Object.keys(PERIODICIDADES).map((p) => <option key={p}>{p}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Próxima visita *">
              <input required type="date" className={CAMPO} value={form.proximaData} onChange={(e) => mudar("proximaData", e.target.value)} />
            </Campo>
            <Campo rotulo="Horário">
              <input type="time" className={CAMPO} value={form.horario} onChange={(e) => mudar("horario", e.target.value)} />
            </Campo>
            <Campo rotulo="Responsável">
              <input list="responsaveis" className={CAMPO} value={form.responsavel} onChange={(e) => mudar("responsavel", e.target.value)} />
              <datalist id="responsaveis">{funcionarios.map((f) => <option key={f.id} value={f.nome} />)}</datalist>
            </Campo>
            {isAdmin && (
              <fieldset className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <input type="checkbox" checked={!!form.cobrancaMensal} onChange={(e) => mudar("cobrancaMensal", e.target.checked)} />
                  Gerar cobrança mensal no Financeiro (contrato PMOC)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Campo rotulo={form.cobrancaMensal ? "Valor mensal do contrato (R$) *" : "Valor do contrato (R$/mês)"}>
                    <input type="number" min="0" step="0.01" className={CAMPO} value={form.valor} onChange={(e) => mudar("valor", e.target.value)} />
                  </Campo>
                  <Campo rotulo="Dia do vencimento">
                    <input type="number" min="1" max="31" className={CAMPO} value={form.diaVencimento} onChange={(e) => mudar("diaVencimento", e.target.value)} />
                  </Campo>
                </div>
                {form.cobrancaMensal && <p className="text-xs text-emerald-800">A cada mês com serviço executado (OS ou “Realizado”), a cobrança aparece em <b>Financeiro › Cobranças PMOC</b>. Ao receber, a entrada é lançada automaticamente.</p>}
              </fieldset>
            )}
            <Campo rotulo="Observações" className="sm:col-span-2">
              <textarea rows={2} className={CAMPO} value={form.observacoes} onChange={(e) => mudar("observacoes", e.target.value)} />
            </Campo>
            <div className="flex gap-2 sm:col-span-2">
              <button disabled={salvando} className={BOTAO}>{salvando ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setForm(null)} className={BOTAO_SEC}>Cancelar</button>
            </div>
          </form>
        </Painel>
      )}
    </div>
  );
}
