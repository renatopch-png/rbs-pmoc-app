import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { Bell, CheckSquare, Pin, PinOff, Plus, Square, StickyNote, Trash2 } from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { modulo } from "../../data/menu";
import { dataBR, diasAte } from "../../lib/modulos";
import { paraData } from "../../lib/agenda";
import { BOTAO, BOTAO_SEC, Busca, CAMPO, Cabecalho, Campo, Erro, Filtros, Painel, Vazio } from "../../components/ui";

const MOD = modulo("/anotacoes");
const TIPOS = ["Nota", "Tarefa", "Lembrete"];
const CORES = {
  branco: "bg-white border-slate-200",
  amarelo: "bg-amber-50 border-amber-200",
  azul: "bg-sky-50 border-sky-200",
  verde: "bg-emerald-50 border-emerald-200",
  rosa: "bg-rose-50 border-rose-200",
};
const VAZIO = { titulo: "", texto: "", tipo: "Tarefa", lembreteEm: "", cor: "amarelo", fixada: false, concluida: false };

export default function Anotacoes() {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState("abertas");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      const snap = await getDocs(query(collection(db, "anotacoes"), where("criadoPor", "==", uid)));
      setLista(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setErro("Não foi possível carregar. Confira se as regras do banco (anotacoes) foram publicadas.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { if (uid) carregar(); }, [uid]);

  const ordenadas = useMemo(() => [...lista].sort((a, b) =>
    (b.fixada === true) - (a.fixada === true)
    || (a.concluida === true) - (b.concluida === true)
    || (paraData(b.criadoEm) || 0) - (paraData(a.criadoEm) || 0)), [lista]);

  const termo = busca.trim().toLowerCase();
  const grupos = {
    abertas: (n) => !n.concluida,
    lembretes: (n) => !n.concluida && n.lembreteEm,
    concluidas: (n) => n.concluida,
    todas: () => true,
  };
  const visiveis = ordenadas.filter((n) => grupos[filtro](n) && (!termo || `${n.titulo} ${n.texto}`.toLowerCase().includes(termo)));
  const qtd = (g) => lista.filter(grupos[g]).length;

  async function gravar(id, dados) {
    setErro("");
    try {
      if (id) await updateDoc(doc(db, "anotacoes", id), dados);
      else await addDoc(collection(db, "anotacoes"), { ...dados, criadoPor: uid, criadoEm: serverTimestamp() });
      await carregar();
      return true;
    } catch (e) {
      setErro("Não foi possível salvar: " + e.message);
      return false;
    }
  }

  async function salvar(e) {
    e.preventDefault();
    if (!form.titulo.trim() && !form.texto.trim()) return;
    const { id, criadoEm, criadoPor, ...dados } = form;
    if (await gravar(editandoId, dados)) setForm(null);
  }

  async function excluir(n) {
    if (!window.confirm("Excluir esta anotação?")) return;
    try {
      await deleteDoc(doc(db, "anotacoes", n.id));
      setForm(null);
      await carregar();
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  function abrir(n) {
    setEditandoId(n?.id || null);
    setForm(n ? { ...VAZIO, ...n } : { ...VAZIO });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <Cabecalho modulo={MOD} subtitulo="Suas notas, tarefas e lembretes (visíveis só para você)">
        <button onClick={() => abrir(null)} className={BOTAO}><Plus size={16} /> Nova</button>
      </Cabecalho>

      <Erro>{!form && erro}</Erro>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar anotações..." />
        <Filtros valor={filtro} aoMudar={setFiltro} opcoes={[
          { valor: "abertas", rotulo: "Abertas", qtd: qtd("abertas") },
          { valor: "lembretes", rotulo: "Lembretes", qtd: qtd("lembretes") },
          { valor: "concluidas", rotulo: "Concluídas", qtd: qtd("concluidas") },
          { valor: "todas", rotulo: "Todas" },
        ]} />
      </div>

      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : visiveis.length === 0 ? (
        <Vazio>Nada por aqui. Toque em <b>Nova</b> para criar uma anotação.</Vazio>
      ) : (
        <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3 [&>li]:mb-3">
          {visiveis.map((n) => {
            const dias = diasAte(n.lembreteEm);
            return (
              <li key={n.id} className={`break-inside-avoid rounded-2xl border p-4 shadow-sm ${CORES[n.cor] || CORES.branco} ${n.concluida ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-2">
                  {n.tipo === "Tarefa" ? (
                    <button aria-label={n.concluida ? "Reabrir tarefa" : "Concluir tarefa"} onClick={() => gravar(n.id, { concluida: !n.concluida })} className="mt-0.5 text-rbs">
                      {n.concluida ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  ) : n.tipo === "Lembrete" ? <Bell size={18} className="mt-0.5 shrink-0 text-amber-600" /> : <StickyNote size={18} className="mt-0.5 shrink-0 text-slate-500" />}
                  <button onClick={() => abrir(n)} className="min-w-0 flex-1 text-left">
                    {n.titulo && <p className={`font-bold text-rbs-navy ${n.concluida ? "line-through" : ""}`}>{n.titulo}</p>}
                    {n.texto && <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{n.texto}</p>}
                  </button>
                  <button aria-label={n.fixada ? "Desafixar" : "Fixar"} onClick={() => gravar(n.id, { fixada: !n.fixada })} className={n.fixada ? "text-rbs" : "text-slate-300 hover:text-slate-500"}>
                    {n.fixada ? <Pin size={16} /> : <PinOff size={16} />}
                  </button>
                </div>
                {n.lembreteEm && (
                  <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${!n.concluida && dias !== null && dias <= 0 ? "bg-red-100 text-red-700" : "bg-white/70 text-slate-600"}`}>
                    <Bell size={11} /> {dataBR(n.lembreteEm)}{!n.concluida && dias === 0 ? " • hoje" : !n.concluida && dias < 0 ? " • atrasado" : ""}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {form && (
        <Painel titulo={editandoId ? "Editar anotação" : "Nova anotação"} aoFechar={() => setForm(null)}>
          <form onSubmit={salvar} className="space-y-3">
            <Erro>{erro}</Erro>
            <div className="flex gap-2">
              {TIPOS.map((t) => (
                <button type="button" key={t} onClick={() => setForm({ ...form, tipo: t })} className={`flex-1 rounded-xl py-2 text-sm font-bold ${form.tipo === t ? "bg-rbs-navy text-white" : "bg-slate-100 text-slate-600"}`}>{t}</button>
              ))}
            </div>
            <input aria-label="Título" autoFocus className={CAMPO} placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            <textarea aria-label="Texto" rows={5} className={CAMPO} placeholder="Ex.: comprar 2 capacitores 35+5 µF para o cliente X" value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Lembrar em">
                <input type="date" className={CAMPO} value={form.lembreteEm} onChange={(e) => setForm({ ...form, lembreteEm: e.target.value })} />
              </Campo>
              <Campo rotulo="Cor">
                <div className="flex gap-1.5 pt-1.5">
                  {Object.entries(CORES).map(([nome, cls]) => (
                    <button type="button" key={nome} aria-label={nome} onClick={() => setForm({ ...form, cor: nome })} className={`h-7 w-7 rounded-full border-2 ${cls} ${form.cor === nome ? "ring-2 ring-rbs ring-offset-1" : ""}`} />
                  ))}
                </div>
              </Campo>
            </div>
            <div className="flex gap-2">
              <button className={BOTAO}>Salvar</button>
              <button type="button" onClick={() => setForm(null)} className={BOTAO_SEC}>Cancelar</button>
              {editandoId && <button type="button" onClick={() => excluir(form)} className="ml-auto inline-flex items-center gap-1 rounded-xl px-3 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 size={16} /> Excluir</button>}
            </div>
          </form>
        </Painel>
      )}
    </div>
  );
}
