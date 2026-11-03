import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { FileText, Plus } from "lucide-react";
import { db } from "../../services/firebase";
import { paraData } from "../../lib/agenda";
import { CORES_STATUS, STATUS, brl, numeroFmt } from "../../lib/orcamentos";

export default function ListaOrcamentos() {
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "orcamentos"));
        setLista(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.numero || 0) - (a.numero || 0)));
      } catch (e) {
        setErro("Não foi possível carregar os orçamentos. Confira se as novas regras do banco foram publicadas.");
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lista.filter((o) => (!status || o.status === status)
      && (!termo || `${o.clienteNome} ${numeroFmt(o.numero)}`.toLowerCase().includes(termo)));
  }, [lista, busca, status]);

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-rbs-navy">Orçamentos</h1>
        <Link to="/orcamentos/novo" className="inline-flex items-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Novo</Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
        <input aria-label="Buscar" placeholder="Buscar por cliente ou número" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select aria-label="Status" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
      {carregando ? <p className="text-sm text-gray-500">Carregando...</p> : filtrados.length === 0 && !erro ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhum orçamento encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {filtrados.map((o) => (
            <li key={o.id}>
              <Link to={`/orcamentos/${o.id}`} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm hover:shadow-md">
                <FileText size={20} className="shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-bold text-rbs-navy">#{numeroFmt(o.numero)}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${CORES_STATUS[o.status] || CORES_STATUS.Rascunho}`}>{o.status}</span>
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-700">{o.clienteNome}</p>
                  <p className="text-xs text-slate-500">{paraData(o.criadoEm)?.toLocaleDateString("pt-BR")}</p>
                </div>
                <p className="font-extrabold text-green-700">{brl(o.valorTotal)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
