import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Snowflake } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppLayout({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  return (
    <div className="flex min-h-screen">
      <Sidebar aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-gradient-to-r from-rbs-navy to-rbs-dark px-4 py-3 text-white shadow md:hidden">
          <button aria-label="Abrir menu" onClick={() => setMenuAberto(true)}><Menu size={24} /></button>
          <Link to="/" className="flex items-center gap-2 font-extrabold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15"><Snowflake size={16} className="text-sky-300" /></span>
            RBS <span className="-ml-1 text-sky-300">PMOC</span>
          </Link>
        </header>
        <main className="min-w-0 flex-1 p-3 pb-24 md:p-5 md:pb-5">{children}</main>
      </div>
      <BottomNav aoAbrirMenu={() => setMenuAberto(true)} />
    </div>
  );
}
