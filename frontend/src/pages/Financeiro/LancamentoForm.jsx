import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { X } from "lucide-react";
import { auth, db } from "../../services/firebase";
import { CATEGORIAS, FORMAS_PAGAMENTO, dataDoLancamento, deInputData, paraInputData } from "../../lib/financeiro";

const CAMPO = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export default function LancamentoForm({ inicial, aoFechar, aoSalvar }) {
  const editando = !!inicial?.id;
  const [form, setForm] = useState({
    tipo: inicial?.tipo || "entrada",
    descricao: inicial?.descricao || "",
    categoria: inicial?.categoria || "",
    valor: inicial?.valor ?? "",
    data: paraInputData(editando ? dataDoLancamento(inicial) || new Date() : new Date()),
    formaPagamento: inicial?.formaPagamento || "Pix",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const categorias = CATEGORIAS[form.tipo];

  async function salvar(e) {
    e.preventDefault();
    if (!(Number(form.valor) > 0)) return setErro("Informe um valor maior que zero.");
    setSalvando(true);
    setErro("");
    const dados = {
      ...form,
      descricao: form.descricao.trim(),
      categoria: categorias.includes(form.categoria) ? form.categoria : "Outros",
      valor: Number(form.valor),
      data: deInputData(form.data),
      atualizadoEm: serverTimestamp(),
    };
    try {
      if (editando) {
        await updateDoc(doc(db, "lancamentos", inicial.id), dados);
      } else {
        await addDoc(collection(db, "lancamentos"), {
          ...dados,
          orcamentoId: inicial?.orcamentoId || null,
          criadoEm: serverTimestamp(),
          criadoPor: auth.currentUser?.uid || null,
        });
      }
      aoSalvar();
    } catch (e2) {
      setErro("Não foi possível salvar: " + e2.message);
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!window.confirm("Excluir este lançamento? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteDoc(doc(db, "lancamentos", inicial.id));
      aoSalvar();
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Lançamento" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <form onSubmit={salvar} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-rbs-navy">{editando ? "Editar lançamento" : "Fazer lançamento"}</h2>
          <button type="button" aria-label="Fechar" onClick={aoFechar} className="p-1 text-slate-500"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[["entrada", "Entrada"], ["saida", "Saída"]].map(([v, r]) => (
            <button key={v} type="button" aria-pressed={form.tipo === v} onClick={() => mudar("tipo", v)}
              className={`rounded-lg py-2 text-sm font-bold ${form.tipo === v ? "bg-rbs text-white" : "bg-slate-100 text-slate-700"}`}>{r}</button>
          ))}
        </div>
        <label className="block text-xs font-semibold text-slate-600">Descrição
          <input required className={`${CAMPO} mt-1 font-normal`} value={form.descricao} onChange={(e) => mudar("descricao", e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-semibold text-slate-600">Valor (R$)
            <input required type="number" min="0.01" step="0.01" className={`${CAMPO} mt-1 font-normal`} value={form.valor} onChange={(e) => mudar("valor", e.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-slate-600">Data
            <input required type="date" className={`${CAMPO} mt-1 font-normal`} value={form.data} onChange={(e) => mudar("data", e.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-slate-600">Categoria
            <select className={`${CAMPO} mt-1 font-normal`} value={categorias.includes(form.categoria) ? form.categoria : ""} onChange={(e) => mudar("categoria", e.target.value)}>
              <option value="">Selecione</option>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">Pagamento
            <select className={`${CAMPO} mt-1 font-normal`} value={form.formaPagamento} onChange={(e) => mudar("formaPagamento", e.target.value)}>
              {FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
        </div>
        {erro && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-800">{erro}</p>}
        <div className="flex justify-between gap-2">
          {editando ? <button type="button" onClick={excluir} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Excluir</button> : <span />}
          <button disabled={salvando} className="rounded-lg bg-rbs px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">{salvando ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}
