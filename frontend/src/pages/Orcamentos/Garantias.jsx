import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { ShieldCheck } from "lucide-react";
import { db } from "../../services/firebase";
import { paraInputData } from "../../lib/financeiro";
import { numeroFmt } from "../../lib/orcamentos";

const fmt = (s) => s.split("-").reverse().join("/");

export default function Garantias() {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("ativas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getDocs(collection(db, "orcamentos"))
      .then((s) => setLista(s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((o) => o.garantiaValidaAte)
        .sort((a, b) => a.garantiaValidaAte.localeCompare(b.garantiaValidaAte))))
      .catch(() => setErro("Não foi possível carregar as garantias."))
      .finally(() => setCarregando(false));
  }, []);

  const hoje = paraInputData();
  const visiveis = lista.filter((o) => (filtro === "ativas" ? o.garantiaValidaAte >= hoje : o.garantiaValidaAte < hoje));

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <h1 className="text-2xl font-extrabold text-rbs-navy">Garantias</h1>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm">
        {[["ativas", "Ativas"], ["vencidas", "Vencidas"]].map(([id, r]) => (
          <button key={id} aria-pressed={filtro === id} onClick={() => setFiltro(id)} className={`rounded-lg py-2 text-sm font-bold ${filtro === id ? "bg-rbs text-white" : "bg-slate-100 text-slate-700"}`}>{r}</button>
        ))}
      </div>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhuma garantia {filtro === "ativas" ? "ativa" : "vencida"}. Emita pelo botão Garantia de um orçamento aprovado ou concluído.</p>
      ) : (
        <ul className="space-y-2">
          {visiveis.map((o) => (
            <li key={o.id}>
              <Link to={`/orcamentos/${o.id}/garantia`} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm hover:shadow-md">
                <ShieldCheck size={20} className="shrink-0 text-amber-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-rbs-navy">#{numeroFmt(o.numero)} • {o.clienteNome}</span>
                  <span className="block truncate text-xs text-slate-500">{o.objeto || `${o.garantiaDias} dias`}</span>
                </span>
                <span className="text-right text-xs text-slate-600">Válida até<b className="block text-sm text-rbs-navy">{fmt(o.garantiaValidaAte)}</b></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
