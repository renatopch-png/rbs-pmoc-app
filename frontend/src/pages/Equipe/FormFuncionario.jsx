import { useState } from "react";
import { X } from "lucide-react";
import { salvarFuncionario } from "../../services/equipeService";

const CAMPO = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal";

export default function FormFuncionario({ inicial, aoFechar, aoSalvar }) {
  const [f, setF] = useState({
    nome: inicial?.nome || "", email: inicial?.email || "", telefone: inicial?.telefone || "",
    funcao: inicial?.funcao || "Técnico", comissaoPercentual: inicial?.comissaoPercentual ?? 10,
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const mudar = (c, v) => setF((a) => ({ ...a, [c]: v }));

  async function salvar(e) {
    e.preventDefault();
    const pct = Number(f.comissaoPercentual);
    if (!(pct >= 0 && pct <= 100)) return setErro("A comissão deve ficar entre 0% e 100%.");
    setSalvando(true);
    try {
      await salvarFuncionario(inicial?.id, { ...f, emailAnterior: inicial?.email || "", ...(inicial?.id ? { ativo: inicial.ativo !== false } : {}) });
      aoSalvar();
    } catch (e2) {
      setErro("Não foi possível salvar: " + e2.message);
      setSalvando(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Funcionário" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <form onSubmit={salvar} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-rbs-navy">{inicial?.id ? "Editar funcionário" : "Vincular funcionário"}</h2>
          <button type="button" aria-label="Fechar" onClick={aoFechar} className="p-1 text-slate-500"><X size={20} /></button>
        </div>
        <label className="block text-xs font-semibold text-slate-600">Nome<input required className={CAMPO} value={f.nome} onChange={(e) => mudar("nome", e.target.value)} /></label>
        <label className="block text-xs font-semibold text-slate-600">E-mail Google<input required type="email" className={CAMPO} value={f.email} onChange={(e) => mudar("email", e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-semibold text-slate-600">Telefone<input className={CAMPO} value={f.telefone} onChange={(e) => mudar("telefone", e.target.value)} /></label>
          <label className="block text-xs font-semibold text-slate-600">Função<input className={CAMPO} value={f.funcao} onChange={(e) => mudar("funcao", e.target.value)} /></label>
        </div>
        <label className="block text-xs font-semibold text-slate-600">Comissão padrão (%)<input type="number" min="0" max="100" step="0.1" className={CAMPO} value={f.comissaoPercentual} onChange={(e) => mudar("comissaoPercentual", e.target.value)} /></label>
        <p className="rounded-lg bg-blue-50 p-2 text-xs text-blue-900">O funcionário ganha acesso ao entrar no app com este e-mail Google.</p>
        {erro && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-800">{erro}</p>}
        <button disabled={salvando} className="w-full rounded-lg bg-rbs py-2 text-sm font-semibold text-white disabled:opacity-50">{salvando ? "Salvando..." : "Salvar"}</button>
      </form>
    </div>
  );
}
