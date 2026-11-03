import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  return (
    <div className="flex min-h-screen">
      <Sidebar aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-rbs-navy px-4 py-3 text-white md:hidden">
          <button aria-label="Abrir menu" onClick={() => setMenuAberto(true)}><Menu size={24} /></button>
          <span className="font-extrabold">RBS <span className="text-sky-300">PMOC</span></span>
        </header>
        <main className="min-w-0 flex-1 p-2 md:p-4">{children}</main>
      </div>
    </div>
  );
}
