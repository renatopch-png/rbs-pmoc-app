import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { logout } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { MENU, CONFIGURACOES, PAINEL } from "../../data/menu";

function Item({ item, aoNavegar }) {
  const Icone = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/" || item.to === "/orcamentos"}
      onClick={aoNavegar}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          isActive ? "bg-white text-rbs-navy shadow" : "text-blue-50/90 hover:bg-white/10"
        }`
      }
    >
      <Icone size={18} strokeWidth={2} className="shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.novo && <span title="Em breve" className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />}
    </NavLink>
  );
}

export default function Sidebar({ aberto, aoFechar }) {
  const { isAdmin } = useAuth();
  return (
    <>
      {aberto && <button aria-label="Fechar menu" onClick={aoFechar} className="fixed inset-0 z-30 bg-black/40 md:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-rbs-navy text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between px-5 pb-3 pt-5">
          <div>
            <h1 className="text-lg font-extrabold leading-tight">RBS <span className="text-sky-300">PMOC</span></h1>
            <p className="text-[11px] text-blue-100/80">Refrigeração • Energia Solar</p>
          </div>
          <button aria-label="Fechar menu" onClick={aoFechar} className="p-1 md:hidden"><X size={20} /></button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          <Item item={PAINEL} aoNavegar={aoFechar} />
          <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-blue-100/60">Funções</p>
          {MENU.filter((m) => isAdmin || !m.admin).map((m) => <Item key={m.to} item={m} aoNavegar={aoFechar} />)}
        </nav>
        <div className="space-y-0.5 border-t border-white/15 p-3">
          {isAdmin && <Item item={CONFIGURACOES} aoNavegar={aoFechar} />}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-blue-50/90 hover:bg-white/10">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}
