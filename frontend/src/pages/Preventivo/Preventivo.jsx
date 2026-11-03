import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CheckCircle2, MessageCircle, Pause, Pencil, Play, Plus, Repeat, Trash2, Wrench } from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { modulo } from "../../data/menu";
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
};

export default function Preventivo() {
  const { isAdmin } = useAuth();
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
    setLista(p);
    setClientes(c.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")));
    setEquipamentos(e);
    setFuncionarios(f);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

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
    const dados = { ...resto, equipamentoNomes: nomesEquip, valor: resto.valor === "" ? "" : Number(resto.valor) };
    try {
      if (editandoId) await updateDoc(doc(db, "preventivos", editandoId), dados);
      else await addDoc(collection(db, "preventivos"), { ...dados, historico: [], criadoEm: serverTimestamp() });
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
    const proxima = paraInput(somarPeriodo(p.proximaData, p.periodicidade));
    if (!window.confirm(`Marcar "${p.servico}" de ${p.clienteNome} como realizado hoje?\nPróxima visita: ${dataBR(proxima)}`)) return;
    try {
      const historico = [...(p.historico || []), { prevista: p.proximaData, realizada: paraInput(new Date()) }].slice(-24);
      await updateDoc(doc(db, "preventivos", p.id), { proximaData: proxima, ultimaExecucao: paraInput(new Date()), historico });
      await carregar();
    } catch (e) {
      setErro("Não foi possível atualizar: " + e.message);
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
                <button onClick={() => abrir(p)} aria-label="Editar" className="rounded-lg px-2 py-1 text-rbs hover:bg-blue-50"><Pencil size={14} /></button>
                <button onClick={() => alternarAtivo(p)} aria-label={p.ativo === false ? "Reativar" : "Pausar"} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">{p.ativo === false ? <Play size={14} /> : <Pause size={14} />}</button>
                {isAdmin && <button onClick={() => excluir(p)} aria-label="Excluir" className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <Painel titulo={editandoId ? "Editar preventivo" : "Novo preventivo"} aoFechar={() => setForm(null)}>
          <form onSubmit={salvar} className="grid gap-3 sm:grid-cols-2">
            <Erro>{erro}</Erro>
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
              <Campo rotulo="Valor por visita (R$)">
                <input type="number" min="0" step="0.01" className={CAMPO} value={form.valor} onChange={(e) => mudar("valor", e.target.value)} />
              </Campo>
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
