import { NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, Home, LayoutGrid, Plus, Wrench } from "lucide-react";

// Barra inferior estilo app (só no celular): atalhos do dia a dia
// e botão central para criar orçamento/OS.
function Aba({ to, icone: Icone, rotulo, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 pt-2 text-[11px] font-semibold ${isActive ? "text-rbs" : "text-slate-500"}`}>
      <Icone size={22} />
      {rotulo}
    </NavLink>
  );
}

export default function BottomNav({ aoAbrirMenu }) {
  const navigate = useNavigate();
  return (
    <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur md:hidden">
      <Aba to="/" end icone={Home} rotulo="Início" />
      <Aba to="/cronograma" icone={CalendarDays} rotulo="Agenda" />
      <div className="flex flex-1 justify-center">
        <button aria-label="Novo orçamento ou OS" onClick={() => navigate("/orcamentos/novo")} className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-rbs-dark text-white shadow-lg ring-4 ring-white">
          <Plus size={28} />
        </button>
      </div>
      <Aba to="/ordens-servico" icone={Wrench} rotulo="OS" />
      <button onClick={aoAbrirMenu} className="flex flex-1 flex-col items-center gap-0.5 pt-2 text-[11px] font-semibold text-slate-500">
        <LayoutGrid size={22} />
        Menu
      </button>
    </nav>
  );
}
