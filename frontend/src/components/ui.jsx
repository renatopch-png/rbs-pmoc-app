import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

export const CAMPO = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";
export const BOTAO = "inline-flex items-center justify-center gap-1.5 rounded-xl bg-rbs px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rbs-dark disabled:opacity-50";
export const BOTAO_SEC = "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

export function Selo({ icone: Icone, cor, tamanho = "md" }) {
  const t = tamanho === "lg" ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-xl";
  return (
    <span className={`flex shrink-0 items-center justify-center bg-gradient-to-br text-white shadow ${t} ${cor}`}>
      <Icone size={tamanho === "lg" ? 24 : 20} />
    </span>
  );
}

// Cabeçalho padrão dos módulos (ícone colorido + título + ação principal).
export function Cabecalho({ modulo, titulo, subtitulo, voltar, children }) {
  return (
    <header className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      {voltar && (
        <Link to={voltar} aria-label="Voltar" className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"><ArrowLeft size={20} /></Link>
      )}
      {modulo && <Selo icone={modulo.icon} cor={modulo.cor} tamanho="lg" />}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-extrabold leading-tight text-rbs-navy">{titulo || modulo?.label}</h1>
        {(subtitulo || modulo?.desc) && <p className="text-sm text-slate-500">{subtitulo || modulo?.desc}</p>}
      </div>
      {children && <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">{children}</div>}
    </header>
  );
}

export function Campo({ rotulo, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold text-slate-600">{rotulo}</span>
      {children}
    </label>
  );
}

export function Badge({ cor, children }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${cor}`}>{children}</span>;
}

export function Vazio({ children }) {
  return <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">{children}</p>;
}

export function Erro({ children }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{children}</p>;
}

export function Busca({ valor, aoMudar, placeholder = "Buscar..." }) {
  return (
    <div className="relative flex-1">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input aria-label={placeholder} className={`${CAMPO} pl-9`} placeholder={placeholder} value={valor} onChange={(e) => aoMudar(e.target.value)} />
    </div>
  );
}

// Abas/filtros em "pílulas", com contador.
export function Filtros({ opcoes, valor, aoMudar }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {opcoes.map((o) => (
        <button
          type="button"
          key={o.valor}
          onClick={() => aoMudar(o.valor)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${valor === o.valor ? "bg-rbs-navy text-white shadow" : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}
        >
          {o.rotulo}{o.qtd !== undefined && <span className="ml-1 opacity-70">({o.qtd})</span>}
        </button>
      ))}
    </div>
  );
}

// Painel de formulário que abre como "folha" no celular e cartão no desktop.
export function Painel({ titulo, aoFechar, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={aoFechar}>
      <div
        role="dialog"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-rbs-navy">{titulo}</h2>
          <button type="button" onClick={aoFechar} className="rounded-full px-2 text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Fechar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
