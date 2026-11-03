import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "../../services/firebase";
import { TIPOS_ITEM, brl } from "../../lib/orcamentos";

const VAZIO = { nome: "", tipo: "Mão de Obra", unidade: "un", preco: "" };
const CAMPO = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export default function TabelaPrecos() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      const snap = await getDocs(collection(db, "tabela_precos"));
      setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
    } catch (e) {
      setErro("Não foi possível carregar a tabela. Confira se as novas regras do banco foram publicadas.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { carregar(); }, []);

  async function salvar(e) {
    e.preventDefault();
    if (!form.nome.trim() || form.preco === "") return;
    setSalvando(true);
    setErro("");
    const dados = { ...form, nome: form.nome.trim(), preco: Number(form.preco) };
    try {
      if (editandoId) await updateDoc(doc(db, "tabela_precos", editandoId), dados);
      else await addDoc(collection(db, "tabela_precos"), { ...dados, criadoEm: serverTimestamp() });
      setForm(VAZIO);
      setEditandoId(null);
      await carregar();
    } catch (e2) {
      setErro("Não foi possível salvar: " + e2.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(item) {
    if (!window.confirm(`Excluir "${item.nome}" da tabela? Orçamentos já criados não mudam.`)) return;
    try {
      await deleteDoc(doc(db, "tabela_precos", item.id));
      await carregar();
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <h1 className="text-2xl font-extrabold text-rbs-navy">Tabela de Preços</h1>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
      <form onSubmit={salvar} className="grid gap-2 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_130px_80px_110px_auto]">
        <input aria-label="Serviço ou material" required placeholder="Serviço ou material" className={CAMPO} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <select aria-label="Tipo" className={CAMPO} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
          {TIPOS_ITEM.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input aria-label="Unidade" placeholder="Un." className={CAMPO} value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} />
        <input aria-label="Preço" required type="number" min="0" step="0.01" placeholder="R$" className={CAMPO} value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
        <button disabled={salvando} className="inline-flex items-center justify-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <Plus size={16} /> {editandoId ? "Salvar" : "Adicionar"}
        </button>
      </form>
      <div className="space-y-2">
        {carregando ? <p className="text-sm text-gray-500">Carregando...</p> : itens.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhum item cadastrado.</p>
        ) : itens.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-rbs-navy">{i.nome}</p>
              <p className="text-xs text-slate-500">{i.tipo} • {i.unidade}</p>
            </div>
            <p className="font-extrabold text-green-700">{brl(i.preco)}</p>
            <button aria-label={`Editar ${i.nome}`} className="p-1 text-slate-500" onClick={() => { setForm({ nome: i.nome, tipo: i.tipo, unidade: i.unidade, preco: i.preco }); setEditandoId(i.id); }}><Pencil size={16} /></button>
            <button aria-label={`Excluir ${i.nome}`} className="p-1 text-red-600" onClick={() => excluir(i)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
