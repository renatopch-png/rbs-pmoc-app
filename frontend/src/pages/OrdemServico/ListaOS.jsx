import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { sincronizarHistorico } from "../../lib/historicoPublico";
import { ChevronDown, List, Search, Snowflake, Users } from "lucide-react";

const CHAVE_AGRUPAR = "rbs.os.agrupar";
const MODOS = [["nenhum", "Lista", List], ["cliente", "Por cliente", Users], ["equipamento", "Por equipamento", Snowflake]];
const lerModo = () => { try { return localStorage.getItem(CHAVE_AGRUPAR) || "nenhum"; } catch { return "nenhum"; } };

export default function ListaOS() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aberta, setAberta] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [agrupar, setAgrupar] = useState(lerModo);
  const [abertos, setAbertos] = useState(() => new Set());
  const [busca, setBusca] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "ordens_servico"));
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => {
          const da = a.dataExecucao?.toDate?.() || new Date(0);
          const dbb = b.dataExecucao?.toDate?.() || new Date(0);
          return dbb - da;
        });
        setOrdens(lista);
      } catch (e) {
        setErro("Não foi possível carregar as ordens de serviço. " + e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  function mudarAgrupamento(modo) {
    setAgrupar(modo);
    setAbertos(new Set());
    try { localStorage.setItem(CHAVE_AGRUPAR, modo); } catch { /* preferência opcional */ }
  }
  const alternarGrupo = (chave) => setAbertos((atual) => {
    const novo = new Set(atual);
    if (novo.has(chave)) novo.delete(chave); else novo.add(chave);
    return novo;
  });

  const termo = busca.trim().toLowerCase();
  const visiveis = useMemo(() => (termo
    ? ordens.filter((o) => [o.clienteNome, o.equipamentoNome, o.local, o.tipo, o.tecnicoNome].some((t) => (t || "").toLowerCase().includes(termo)))
    : ordens), [ordens, termo]);

  // Agrupa mantendo a ordem por data (o grupo com a OS mais recente vem primeiro).
  const grupos = useMemo(() => {
    if (agrupar === "nenhum") return [];
    const mapa = new Map();
    visiveis.forEach((o) => {
      const porCliente = agrupar === "cliente";
      const chave = porCliente ? (o.clienteId || o.clienteNome || "sem-cliente") : (o.equipamentoId || o.equipamentoNome || "sem-equipamento");
      if (!mapa.has(chave)) {
        mapa.set(chave, {
          chave,
          clienteId: o.clienteId || null,
          titulo: porCliente ? (o.clienteNome || "Sem cliente") : (o.equipamentoNome || "Equipamento sem nome"),
          subtitulo: porCliente ? "" : [o.tipo, o.capacidade, o.clienteNome].filter(Boolean).join(" · "),
          ordens: [], preventivas: 0, corretivas: 0,
        });
      }
      const g = mapa.get(chave);
      g.ordens.push(o);
      if (o.tipoAtendimento === "Corretiva") g.corretivas += 1; else g.preventivas += 1;
    });
    return [...mapa.values()].map((g) => (agrupar === "cliente"
      ? { ...g, subtitulo: `${new Set(g.ordens.map((o) => o.equipamentoId)).size} equipamento(s)` }
      : g));
  }, [visiveis, agrupar]);

  function formatarData(v) {
    if (!v) return "—";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleString("pt-BR");
  }

  function resumoChecklist(itens) {
    if (!Array.isArray(itens) || itens.length === 0) return "—";
    const feitos = itens.filter((i) => i.feito || i.concluido || i.checked).length;
    return `${feitos} de ${itens.length} itens`;
  }

  // Apaga um arquivo do Storage a partir da URL salva no Firestore.
  // Se o arquivo já não existir (ou a URL for de outro lugar), apenas ignora.
  async function apagarArquivoStorage(url) {
    if (!url) return;
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn("Não foi possível apagar arquivo do Storage:", url, e.message);
    }
  }

  async function excluirOS(os) {
    const confirmar = window.confirm(
      `Excluir a OS de "${os.equipamentoNome || "equipamento"}" (${formatarData(
        os.dataExecucao
      )})?\n\nEssa ação apaga também as fotos e a assinatura. Não pode ser desfeita.`
    );
    if (!confirmar) return;

    setExcluindo(os.id);
    try {
      // Apaga fotos e assinatura do Storage (não trava a exclusão se alguma falhar)
      const urls = [
        ...(Array.isArray(os.fotosAntes) ? os.fotosAntes : []),
        ...(Array.isArray(os.fotosDepois) ? os.fotosDepois : []),
        ...(Array.isArray(os.fotos) ? os.fotos : []),
        os.assinaturaClienteUrl,
      ].filter(Boolean);

      await Promise.all(urls.map(apagarArquivoStorage));

      // Apaga o registro da OS no Firestore
      await deleteDoc(doc(db, "ordens_servico", os.id));
      if (os.equipamentoId) {
        await sincronizarHistorico(os.equipamentoId).catch((e) =>
          console.warn("Histórico público não atualizado:", e.message));
      }

      // Remove da tela sem precisar recarregar
      setOrdens((prev) => prev.filter((o) => o.id !== os.id));
      if (aberta === os.id) setAberta(null);
    } catch (e) {
      alert("Erro ao excluir: " + e.message);
    } finally {
      setExcluindo(null);
    }
  }

  const renderOS = (os) => (
    <div
      key={os.id}
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-2 p-4 sm:flex-nowrap sm:gap-4">
        <button
          onClick={() => setAberta(aberta === os.id ? null : os.id)}
          className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 text-left sm:flex-nowrap sm:gap-4"
        >
          <div>
            <div className="font-semibold text-gray-900">
              {os.equipamentoNome || "Equipamento sem nome"}
            </div>
            <div className="mt-0.5 text-sm text-gray-600">
              {formatarData(os.dataExecucao)} · {os.tecnicoNome || "técnico não identificado"}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {os.tipoAtendimento && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  os.tipoAtendimento === "Corretiva"
                    ? "bg-orange-50 text-orange-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {os.tipoAtendimento === "Corretiva" ? "🛠️ Corretiva" : "🗓️ Preventiva"}
              </span>
            )}
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
              {resumoChecklist(os.itensChecklist)}
            </span>
            <span className="text-gray-400">{aberta === os.id ? "▲" : "▼"}</span>
          </div>
        </button>

        {isAdmin && (
          <button
            onClick={() => excluirOS(os)}
            disabled={excluindo === os.id}
            title="Excluir esta ordem de serviço"
            className="ml-auto shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {excluindo === os.id ? "Excluindo..." : "🗑️ Excluir"}
          </button>
        )}
      </div>

      {aberta === os.id && (
        <div className="border-t border-gray-100 p-4">
          {os.tipoAtendimento === "Corretiva" && (os.dataAbertura || os.descricaoProblema) && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
                🛠️ Dados do chamado
              </h3>
              {os.dataAbertura && (
                <p className="text-sm text-orange-900">
                  Aberto em: {new Date(os.dataAbertura + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
              )}
              {os.descricaoProblema && (
                <p className="mt-1 text-sm text-orange-900">
                  Problema relatado: {os.descricaoProblema}
                </p>
              )}
            </div>
          )}

          {Array.isArray(os.itensChecklist) && os.itensChecklist.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Checklist
              </h3>
              <ul className="space-y-1 text-sm">
                {os.itensChecklist.map((item, i) => {
                  const feito = item.feito || item.concluido || item.checked;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className={feito ? "text-green-600" : "text-gray-300"}>
                        {feito ? "✓" : "○"}
                      </span>
                      <span className={feito ? "text-gray-800" : "text-gray-400"}>
                        {item.descricao || item.nome || item.texto || `Item ${i + 1}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {os.observacoes && (
            <div className="mb-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Observações
              </h3>
              <p className="text-sm text-gray-700">{os.observacoes}</p>
            </div>
          )}

          {Array.isArray(os.fotosAntes) && os.fotosAntes.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fotos — Antes ({os.fotosAntes.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {os.fotosAntes.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={`Antes ${i + 1}`}
                      className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(os.fotosDepois) && os.fotosDepois.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fotos — Depois ({os.fotosDepois.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {os.fotosDepois.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={`Depois ${i + 1}`}
                      className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Compatibilidade com OS antigas (campo único "fotos") */}
          {!os.fotosAntes && !os.fotosDepois && Array.isArray(os.fotos) && os.fotos.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fotos ({os.fotos.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {os.fotos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {os.assinaturaClienteUrl && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Assinatura do cliente
              </h3>
              <img
                src={os.assinaturaClienteUrl}
                alt="Assinatura do cliente"
                className="h-16 rounded-lg border border-gray-200 bg-white object-contain px-2"
              />
            </div>
          )}

          {/* Botões de ação */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={() => navigate(`/relatorios/pmoc/${os.id}`)}
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
            >
              📄 Gerar PDF PMOC
            </button>
            <button
              onClick={() => navigate(`/relatorios/art/${os.id}`)}
              className="rounded-lg bg-orange-800 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-900"
            >
              📜 Gerar ART
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl md:p-2">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Ordens de serviço</h1>
      <p className="mb-6 text-sm text-gray-600">
        Histórico de manutenções executadas, com checklist, fotos e geração de PDF PMOC.
      </p>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {!carregando && ordens.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Agrupar</span>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Agrupar ordens de serviço">
            {MODOS.map(([id, rotulo, Icone]) => (
              <button key={id} aria-pressed={agrupar === id} onClick={() => mudarAgrupamento(id)}
                className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-bold transition sm:px-3 ${agrupar === id ? "bg-white text-rbs-navy shadow" : "text-slate-600 hover:text-slate-900"}`}>
                <Icone size={14} /> {rotulo}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Buscar OS" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente, equipamento, técnico..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          {agrupar !== "nenhum" && grupos.length > 0 && (
            <button onClick={() => setAbertos(abertos.size === grupos.length ? new Set() : new Set(grupos.map((g) => g.chave)))} className="text-xs font-bold text-blue-700">
              {abertos.size === grupos.length ? "Recolher todos" : "Expandir todos"}
            </button>
          )}
        </div>
      )}

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : ordens.length > 0 && visiveis.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">Nenhuma OS encontrada para “{busca}”.</div>
      ) : ordens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
          Nenhuma ordem de serviço registrada. Vá em Equipamentos e clique em
          "Executar manutenção" para criar a primeira.
        </div>
      ) : (
        <div className="space-y-3">
          {agrupar === "nenhum" ? visiveis.map(renderOS) : grupos.map((g) => {
            const expandido = abertos.has(g.chave) || !!termo;
            return (
              <section key={g.chave} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <button onClick={() => alternarGrupo(g.chave)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ${agrupar === "cliente" ? "from-indigo-500 to-blue-700" : "from-cyan-500 to-sky-700"}`}>
                    {agrupar === "cliente" ? <Users size={20} /> : <Snowflake size={20} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-gray-900">{g.titulo}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {g.subtitulo && `${g.subtitulo} · `}Última: {formatarData(g.ordens[0].dataExecucao)}
                    </span>
                  </span>
                  <span className="hidden gap-1 sm:flex">
                    {g.preventivas > 0 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">🗓️ {g.preventivas}</span>}
                    {g.corretivas > 0 && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-800">🛠️ {g.corretivas}</span>}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">{g.ordens.length} OS</span>
                  <ChevronDown size={18} className={`shrink-0 text-gray-400 transition ${expandido ? "rotate-180" : ""}`} />
                </button>
                {expandido && (
                  <div className="space-y-2 border-t border-gray-100 bg-slate-50/60 p-3">
                    {agrupar === "cliente" && g.clienteId && (
                      <button onClick={() => navigate(`/relatorios/pmoc-consolidado/${g.clienteId}`)} className="mb-1 rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900">
                        📄 PMOC consolidado do cliente
                      </button>
                    )}
                    {g.ordens.map(renderOS)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
