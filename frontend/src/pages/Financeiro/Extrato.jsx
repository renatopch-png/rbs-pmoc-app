import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { brl } from "../../lib/orcamentos";
import { dataDoLancamento, deInputData, gerarCsv, resumir } from "../../lib/financeiro";
import LancamentoForm from "./LancamentoForm";
import { useFinanceiro } from "./useFinanceiro";

export default function Extrato() {
  const { isAdmin } = useAuth();
  const [params] = useSearchParams();
  const { lancamentos, carregando, erro, recarregar } = useFinanceiro();
  const [tipo, setTipo] = useState(params.get("tipo") || "");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(null);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const inicio = de ? deInputData(de) : null;
    const fim = ate ? deInputData(ate) : null;
    if (inicio) inicio.setHours(0, 0, 0, 0);
    if (fim) fim.setHours(23, 59, 59, 999);
    return lancamentos.filter((l) => {
      const d = dataDoLancamento(l);
      return (!tipo || l.tipo === tipo) && (!inicio || d >= inicio) && (!fim || d <= fim)
        && (!termo || `${l.descricao} ${l.categoria}`.toLowerCase().includes(termo));
    });
  }, [lancamentos, tipo, de, ate, busca]);
  const total = resumir(lista);

  function exportar() {
    const blob = new Blob([gerarCsv(lista)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "extrato-rbs.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!isAdmin) return <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm">O Financeiro é restrito ao administrador.</div>;
  const campo = "rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Link to="/financeiro" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600"><ArrowLeft size={16} /> Voltar</Link>
        <h1 className="text-xl font-extrabold text-rbs-navy">Extrato</h1>
        <button onClick={exportar} disabled={lista.length === 0} className="inline-flex items-center gap-1 rounded-lg border border-rbs px-3 py-1.5 text-sm font-semibold text-rbs disabled:opacity-40"><Download size={14} /> CSV</button>
      </div>
      <div className="grid gap-2 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-4">
        <select aria-label="Tipo" className={campo} value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Entradas e saídas</option><option value="entrada">Entradas</option><option value="saida">Saídas</option>
        </select>
        <input aria-label="De" type="date" className={campo} value={de} onChange={(e) => setDe(e.target.value)} />
        <input aria-label="Até" type="date" className={campo} value={ate} onChange={(e) => setAte(e.target.value)} />
        <input aria-label="Buscar" placeholder="Buscar" className={campo} value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-white p-2 shadow-sm"><dt className="text-xs text-slate-500">Entradas</dt><dd className="font-extrabold text-green-700">{brl(total.receitas)}</dd></div>
        <div className="rounded-xl bg-white p-2 shadow-sm"><dt className="text-xs text-slate-500">Saídas</dt><dd className="font-extrabold text-red-600">{brl(total.despesas)}</dd></div>
        <div className="rounded-xl bg-white p-2 shadow-sm"><dt className="text-xs text-slate-500">Resultado</dt><dd className="font-extrabold text-rbs-navy">{brl(total.resultado)}</dd></div>
      </dl>
      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhum lançamento encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {lista.map((l) => (
            <li key={l.id}>
              <button onClick={() => setForm(l)} className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-rbs-navy">{l.descricao}</span>
                  <span className="text-xs text-slate-500">{dataDoLancamento(l)?.toLocaleDateString("pt-BR")} • {l.categoria} • {l.formaPagamento}</span>
                </span>
                <span className={`font-extrabold ${l.tipo === "entrada" ? "text-green-700" : "text-red-600"}`}>{l.tipo === "entrada" ? "+" : "-"} {brl(l.valor)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {form && <LancamentoForm inicial={form} aoFechar={() => setForm(null)} aoSalvar={() => { setForm(null); recarregar(); }} />}
    </div>
  );
}
