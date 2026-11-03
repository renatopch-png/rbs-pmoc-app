import { useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { auth, db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { brl } from "../../lib/orcamentos";
import { CATEGORIAS, idPagamentoFixa, mesReferencia } from "../../lib/financeiro";
import { useFinanceiro } from "./useFinanceiro";

const VAZIO = { nome: "", categoria: "Aluguel", valor: "", diaVencimento: 10 };
const CAMPO = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export default function ContasFixas() {
  const { isAdmin } = useAuth();
  const { lancamentos, contas, carregando, erro, recarregar } = useFinanceiro();
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [aviso, setAviso] = useState("");
  const mes = mesReferencia();
  const pagas = new Set(lancamentos.map((l) => l.id));
  const totalMensal = contas.filter((c) => c.ativa !== false).reduce((t, c) => t + Math.round(c.valor * 100), 0) / 100;

  async function salvar(e) {
    e.preventDefault();
    const dados = { ...form, nome: form.nome.trim(), valor: Number(form.valor), diaVencimento: Number(form.diaVencimento) };
    if (!dados.nome || !(dados.valor > 0)) return setAviso("Informe nome e valor.");
    if (!(dados.diaVencimento >= 1 && dados.diaVencimento <= 31)) return setAviso("O vencimento deve ser um dia de 1 a 31.");
    try {
      if (editandoId) await updateDoc(doc(db, "contas_fixas", editandoId), dados);
      else await addDoc(collection(db, "contas_fixas"), { ...dados, ativa: true, criadoEm: serverTimestamp() });
      setForm(VAZIO); setEditandoId(null); setAviso("");
      await recarregar();
    } catch (e2) {
      setAviso("Não foi possível salvar: " + e2.message);
    }
  }

  async function pagar(c) {
    if (!window.confirm(`Registrar o pagamento de "${c.nome}" (${brl(c.valor)}) em ${mes}?`)) return;
    try {
      await setDoc(doc(db, "lancamentos", idPagamentoFixa(c.id, mes)), {
        tipo: "saida", descricao: c.nome, categoria: c.categoria || "Outros", valor: c.valor, data: new Date(), formaPagamento: "Pix",
        contaFixaId: c.id, mesReferencia: mes, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(), criadoPor: auth.currentUser?.uid || null,
      });
      await recarregar();
    } catch (e) {
      setAviso("Não foi possível registrar: " + e.message);
    }
  }

  async function excluir(c) {
    if (!window.confirm(`Excluir a conta "${c.nome}"? Pagamentos já registrados continuam no extrato.`)) return;
    try {
      await deleteDoc(doc(db, "contas_fixas", c.id));
      await recarregar();
    } catch (e) {
      setAviso("Não foi possível excluir: " + e.message);
    }
  }

  if (!isAdmin) return <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm">O Financeiro é restrito ao administrador.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Link to="/financeiro" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600"><ArrowLeft size={16} /> Voltar</Link>
        <h1 className="text-xl font-extrabold text-rbs-navy">Contas Fixas</h1>
        <p className="text-sm font-bold text-red-600">{brl(totalMensal)}/mês</p>
      </div>
      {(erro || aviso) && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro || aviso}</p>}
      <form onSubmit={salvar} className="grid gap-2 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_150px_100px_90px_auto]">
        <input aria-label="Nome da conta" required placeholder="Nome da conta" className={CAMPO} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <select aria-label="Categoria" className={CAMPO} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
          {CATEGORIAS.saida.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input aria-label="Valor" required type="number" min="0.01" step="0.01" placeholder="R$" className={CAMPO} value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
        <input aria-label="Dia do vencimento" required type="number" min="1" max="31" className={CAMPO} value={form.diaVencimento} onChange={(e) => setForm({ ...form, diaVencimento: e.target.value })} />
        <button className="rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white">{editandoId ? "Salvar" : "Adicionar"}</button>
      </form>
      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : contas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhuma conta fixa cadastrada.</p>
      ) : (
        <ul className="space-y-2">
          {contas.map((c) => {
            const paga = pagas.has(idPagamentoFixa(c.id, mes));
            return (
              <li key={c.id} className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-rbs-navy">{c.nome}</p>
                  <p className="text-xs text-slate-500">{c.categoria} • vence dia {c.diaVencimento} • {brl(c.valor)}</p>
                </div>
                {paga ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Paga</span>
                  : <button onClick={() => pagar(c)} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Pagar</button>}
                <button aria-label={`Editar ${c.nome}`} className="p-1 text-slate-500" onClick={() => { setForm({ nome: c.nome, categoria: c.categoria, valor: c.valor, diaVencimento: c.diaVencimento }); setEditandoId(c.id); }}><Pencil size={16} /></button>
                <button aria-label={`Excluir ${c.nome}`} className="p-1 text-red-600" onClick={() => excluir(c)}><Trash2 size={16} /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
