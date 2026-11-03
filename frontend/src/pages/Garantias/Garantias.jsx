import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CalendarCheck, FileText, MessageCircle, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { modulo } from "../../data/menu";
import { numeroFmt } from "../../lib/orcamentos";
import { dataBR, fimGarantia, lerColecao, linkWhatsApp, paraInput, statusGarantia } from "../../lib/modulos";
import { BOTAO, BOTAO_SEC, Badge, Busca, CAMPO, Cabecalho, Campo, Erro, Filtros, Painel, Vazio } from "../../components/ui";

const MOD = modulo("/garantias");
const TIPOS = ["Serviço", "Equipamento", "Peça / Componente", "Instalação"];
const PRAZOS = [3, 6, 12, 24, 36, 60];
const VAZIO = {
  clienteId: "", clienteNome: "", clienteTelefone: "", equipamentoId: "", equipamentoNome: "",
  tipo: "Serviço", descricao: "", dataInicio: paraInput(new Date()), prazoMeses: 3,
  referencia: "", fabricante: "", numeroSerie: "", observacoes: "",
};

export default function Garantias() {
  const { isAdmin } = useAuth();
  const [lista, setLista] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [form, setForm] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState("Ativa");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    const [g, c, e, o] = await Promise.all([lerColecao("garantias"), lerColecao("clientes"), lerColecao("equipamentos"), lerColecao("orcamentos")]);
    // Garantias emitidas pelo botão "Garantia" do orçamento entram na mesma lista.
    const doOrcamento = o.filter((x) => x.garantiaValidaAte).map((x) => ({
      id: `orc-${x.id}`, orcamentoId: x.id, origem: "orcamento", tipo: "Serviço",
      clienteNome: x.clienteNome, clienteTelefone: x.clienteTelefone,
      descricao: x.objeto || `Serviços do orçamento #${numeroFmt(x.numero)}`,
      dataInicio: x.garantiaInicio, dataFim: x.garantiaValidaAte, referencia: `Orçamento #${numeroFmt(x.numero)}`,
    }));
    setLista([...g, ...doOrcamento]);
    setClientes(c.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")));
    setEquipamentos(e);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  const comStatus = useMemo(() => lista
    .map((g) => ({ ...g, st: statusGarantia(g), fim: fimGarantia(g) }))
    .sort((a, b) => (a.fim || 0) - (b.fim || 0)), [lista]);

  const contagem = (r) => comStatus.filter((g) => g.st.rotulo === r).length;
  const termo = busca.trim().toLowerCase();
  const visiveis = comStatus.filter((g) =>
    (filtro === "Todas" || g.st.rotulo === filtro || (filtro === "Ativa" && g.st.rotulo === "Vencendo"))
    && (!termo || [g.clienteNome, g.descricao, g.equipamentoNome, g.referencia].some((t) => (t || "").toLowerCase().includes(termo))));

  function mudar(campo, valor) {
    setForm((f) => {
      const novo = { ...f, [campo]: valor };
      if (campo === "clienteId") {
        const c = clientes.find((x) => x.id === valor);
        novo.clienteNome = c?.nome || "";
        novo.clienteTelefone = c?.telefone || "";
        novo.equipamentoId = "";
        novo.equipamentoNome = "";
      }
      if (campo === "equipamentoId") {
        const e = equipamentos.find((x) => x.id === valor);
        novo.equipamentoNome = e ? [e.nome || e.tipo, e.local].filter(Boolean).join(" — ") : "";
        if (e && !f.fabricante) novo.fabricante = e.marca || "";
        if (e && !f.numeroSerie) novo.numeroSerie = e.numeroSerie || "";
      }
      return novo;
    });
  }

  function abrir(g) {
    setErro("");
    setEditandoId(g?.id || null);
    setForm(g ? { ...VAZIO, ...g, st: undefined, fim: undefined } : { ...VAZIO });
  }

  async function salvar(e) {
    e.preventDefault();
    if (!form.clienteNome.trim() || !form.descricao.trim() || !form.dataInicio) return;
    setSalvando(true);
    const { st, fim, id, ...resto } = form;
    const dados = { ...resto, prazoMeses: Number(form.prazoMeses) || 0, dataFim: paraInput(fimGarantia(form)) };
    try {
      if (editandoId) await updateDoc(doc(db, "garantias", editandoId), dados);
      else await addDoc(collection(db, "garantias"), { ...dados, criadoEm: serverTimestamp() });
      setForm(null);
      await carregar();
    } catch (e2) {
      setErro("Não foi possível salvar. Confira se as regras do banco (garantias) foram publicadas. " + e2.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(g) {
    if (!window.confirm(`Excluir a garantia de "${g.clienteNome}"?`)) return;
    try {
      await deleteDoc(doc(db, "garantias", g.id));
      await carregar();
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  const equipDoCliente = equipamentos.filter((e) => !form?.clienteId || e.clienteId === form.clienteId);

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <Cabecalho modulo={MOD} subtitulo="Controle de garantias de serviços, equipamentos e peças">
        <button onClick={() => abrir(null)} className={BOTAO}><Plus size={16} /> Nova garantia</button>
      </Cabecalho>

      <div className="grid grid-cols-3 gap-2">
        {[["Ativas", contagem("Ativa") + contagem("Vencendo"), "text-emerald-700"], ["Vencendo (30d)", contagem("Vencendo"), "text-amber-600"], ["Vencidas", contagem("Vencida"), "text-red-600"]].map(([r, n, c]) => (
          <div key={r} className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <p className={`text-2xl font-extrabold ${c}`}>{n}</p>
            <p className="text-xs font-semibold text-slate-500">{r}</p>
          </div>
        ))}
      </div>

      <Erro>{!form && erro}</Erro>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar cliente, serviço, equipamento..." />
        <Filtros valor={filtro} aoMudar={setFiltro} opcoes={[
          { valor: "Ativa", rotulo: "Ativas" }, { valor: "Vencendo", rotulo: "Vencendo" },
          { valor: "Vencida", rotulo: "Vencidas" }, { valor: "Todas", rotulo: "Todas", qtd: comStatus.length },
        ]} />
      </div>

      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : visiveis.length === 0 ? (
        <Vazio>Nenhuma garantia {filtro !== "Todas" && `com status "${filtro}"`} encontrada.</Vazio>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {visiveis.map((g) => (
            <li key={g.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${g.st.rotulo === "Vencida" ? "bg-red-50 text-red-600" : g.st.rotulo === "Vencendo" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                  <ShieldCheck size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-rbs-navy">{g.clienteNome}</p>
                    <Badge cor={g.st.cor}>{g.st.rotulo}</Badge>
                  </div>
                  <p className="text-sm text-slate-700">{g.descricao}</p>
                  <p className="mt-1 text-xs text-slate-500">{g.tipo}{g.equipamentoNome && ` • ${g.equipamentoNome}`}{g.referencia && ` • ${g.referencia}`}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <CalendarCheck size={13} /> {dataBR(g.dataInicio)} → {dataBR(g.fim)}
                    {g.st.dias !== null && g.st.dias >= 0 && <span className="text-slate-400">({g.st.dias} dias restantes)</span>}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-1 border-t border-slate-100 pt-2">
                {g.clienteTelefone && (
                  <a target="_blank" rel="noreferrer" href={linkWhatsApp(g.clienteTelefone, `Olá! A RBS informa que a garantia de "${g.descricao}" ${g.st.dias < 0 ? "venceu" : "vence"} em ${dataBR(g.fim)}. Que tal agendar uma revisão preventiva?`)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-50">
                    <MessageCircle size={14} /> Avisar cliente
                  </a>
                )}
                {g.origem === "orcamento" ? (
                  <Link to={`/orcamentos/${g.orcamentoId}/garantia`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rbs hover:bg-blue-50"><FileText size={14} /> Certificado</Link>
                ) : <button onClick={() => abrir(g)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rbs hover:bg-blue-50"><Pencil size={14} /> Editar</button>}
                {isAdmin && g.origem !== "orcamento" && <button onClick={() => excluir(g)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14} /> Excluir</button>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <Painel titulo={editandoId ? "Editar garantia" : "Nova garantia"} aoFechar={() => setForm(null)}>
          <form onSubmit={salvar} className="grid gap-3 sm:grid-cols-2">
            <Erro>{erro}</Erro>
            {!editandoId && <p className="text-xs text-slate-500 sm:col-span-2">Para serviços de um orçamento, emita a garantia pelo botão <b>Garantia</b> do próprio orçamento — ela aparece aqui automaticamente.</p>}
            <Campo rotulo="Cliente *">
              <select className={CAMPO} value={form.clienteId} onChange={(e) => mudar("clienteId", e.target.value)}>
                <option value="">{form.clienteNome && !form.clienteId ? form.clienteNome : "Selecione..."}</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Equipamento">
              <select className={CAMPO} value={form.equipamentoId} onChange={(e) => mudar("equipamentoId", e.target.value)}>
                <option value="">Nenhum / não cadastrado</option>
                {equipDoCliente.map((e) => <option key={e.id} value={e.id}>{[e.nome || e.tipo, e.local].filter(Boolean).join(" — ")}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Descrição do que está coberto *" className="sm:col-span-2">
              <input required className={CAMPO} placeholder="Ex.: Instalação de split 12.000 BTU/h" value={form.descricao} onChange={(e) => mudar("descricao", e.target.value)} />
            </Campo>
            <Campo rotulo="Tipo">
              <select className={CAMPO} value={form.tipo} onChange={(e) => mudar("tipo", e.target.value)}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
            </Campo>
            <Campo rotulo="Referência (OS, orçamento, NF)">
              <input className={CAMPO} value={form.referencia} onChange={(e) => mudar("referencia", e.target.value)} />
            </Campo>
            <Campo rotulo="Início *">
              <input required type="date" className={CAMPO} value={form.dataInicio} onChange={(e) => mudar("dataInicio", e.target.value)} />
            </Campo>
            <Campo rotulo={`Prazo (meses) — vence em ${dataBR(fimGarantia({ ...form, dataFim: "" }))}`}>
              <div className="flex gap-1">
                <input type="number" min="0" className={CAMPO} value={form.prazoMeses} onChange={(e) => mudar("prazoMeses", e.target.value)} />
                <select aria-label="Prazos comuns" className={`${CAMPO} w-24`} value="" onChange={(e) => e.target.value && mudar("prazoMeses", Number(e.target.value))}>
                  <option value="">Atalho</option>
                  {PRAZOS.map((p) => <option key={p} value={p}>{p} m</option>)}
                </select>
              </div>
            </Campo>
            <Campo rotulo="Fabricante / marca"><input className={CAMPO} value={form.fabricante} onChange={(e) => mudar("fabricante", e.target.value)} /></Campo>
            <Campo rotulo="Nº de série"><input className={CAMPO} value={form.numeroSerie} onChange={(e) => mudar("numeroSerie", e.target.value)} /></Campo>
            <Campo rotulo="Observações / condições" className="sm:col-span-2">
              <textarea rows={2} className={CAMPO} placeholder="Ex.: garantia condicionada à manutenção preventiva semestral" value={form.observacoes} onChange={(e) => mudar("observacoes", e.target.value)} />
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
