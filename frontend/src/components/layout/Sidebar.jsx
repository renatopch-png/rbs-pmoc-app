import { NavLink } from "react-router-dom";
import { logout } from "../../services/authService";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/clientes", label: "Clientes e Edifícios" },
  { to: "/equipamentos", label: "Equipamentos" },
  { to: "/cronograma", label: "Cronograma / Plano" },
  { to: "/ordens-servico", label: "Ordens de Serviço" },
  { to: "/relatorios", label: "Relatórios" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-rbs-dark text-white flex flex-col">
      <div className="p-5 border-b border-white/20">
        <h1 className="font-bold text-lg leading-tight">RBS PMOC</h1>
        <p className="text-xs text-blue-100">
          Refrigeração Elétrica • Energia Solar • Engenharia Térmica
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-sm transition ${
                isActive ? "bg-rbs-light text-rbs-dark font-semibold" : "hover:bg-white/10"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="m-3 rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
      >
        Sair
      </button>
    </aside>
  );
}
