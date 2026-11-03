import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import { modulo } from "../../data/menu";
import { numeroFmt } from "../../lib/orcamentos";
import { CORES_LAUDO, TIPOS_LAUDO } from "../../lib/laudos";
import { dataBR, lerColecao } from "../../lib/modulos";
import { BOTAO, Badge, Busca, CAMPO, Cabecalho, Vazio } from "../../components/ui";

const MOD = modulo("/laudos");

export default function ListaLaudos() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    lerColecao("laudos").then((l) => {
      setLista(l.sort((a, b) => (b.numero || 0) - (a.numero || 0)));
      setCarregando(false);
    });
  }, []);

  const termo = busca.trim().toLowerCase();
  const visiveis = lista.filter((l) => (!tipo || l.tipo === tipo)
    && (!termo || [l.clienteNome, l.assunto, l.equipamentoNome, String(l.numero)].some((t) => (t || "").toLowerCase().includes(termo))));

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <Cabecalho modulo={MOD} subtitulo="Laudos, pareceres e relatórios de visita em PDF">
        <Link to="/laudos/novo" className={BOTAO}><Plus size={16} /> Novo relatório</Link>
      </Cabecalho>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar cliente, assunto, nº..." />
        <select aria-label="Tipo" className={`${CAMPO} sm:w-72`} value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS_LAUDO.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : visiveis.length === 0 ? (
        <Vazio>Nenhum relatório técnico ainda. Crie o primeiro em <b>Novo relatório</b>.</Vazio>
      ) : (
        <ul className="space-y-2">
          {visiveis.map((l) => (
            <li key={l.id}>
              <Link to={`/laudos/${l.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700"><FileText size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-bold text-rbs-navy">
                    #{numeroFmt(l.numero)} <span className="truncate">{l.clienteNome}</span>
                    <Badge cor={CORES_LAUDO[l.status] || CORES_LAUDO.Rascunho}>{l.status || "Rascunho"}</Badge>
                  </p>
                  <p className="truncate text-sm text-slate-700">{l.assunto || l.tipo}</p>
                  <p className="text-xs text-slate-500">{l.tipo} • {dataBR(l.dataVisita)}{l.tecnico && ` • ${l.tecnico}`}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
