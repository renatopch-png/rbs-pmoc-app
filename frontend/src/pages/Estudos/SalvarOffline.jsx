import { useEffect, useState } from "react";
import { CheckCircle2, CloudDownload, Loader2 } from "lucide-react";

// Mesmo nome do cache configurado no service worker (vite.config.js → runtimeCaching).
const CACHE = "estudos-pdf";

async function contarSalvos(urls) {
  if (!("caches" in window)) return null;
  try {
    const cache = await caches.open(CACHE);
    const chaves = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
    return urls.filter((u) => chaves.has(u)).length;
  } catch {
    return null;
  }
}

// Baixa todos os PDFs de estudo: o service worker guarda cada um e eles passam a abrir sem internet.
export default function SalvarOffline({ urls }) {
  const [salvos, setSalvos] = useState(null);
  const [baixando, setBaixando] = useState(false);
  const [feitos, setFeitos] = useState(0);
  const [falhas, setFalhas] = useState(0);
  const semSuporte = !("serviceWorker" in navigator);

  useEffect(() => { contarSalvos(urls).then(setSalvos); }, [urls]);

  async function baixar() {
    setBaixando(true);
    setFeitos(0);
    setFalhas(0);
    let erros = 0;
    for (let i = 0; i < urls.length; i++) {
      try {
        const r = await fetch(urls[i]);
        if (!r.ok) erros++;
        else await r.blob();
      } catch {
        erros++;
      }
      setFeitos(i + 1);
    }
    setFalhas(erros);
    setBaixando(false);
    setSalvos(await contarSalvos(urls));
  }

  const completo = salvos !== null && salvos >= urls.length;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${completo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
        {completo ? <CheckCircle2 size={20} /> : <CloudDownload size={20} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-rbs-navy">Estudar sem internet</p>
        <p className="text-xs text-slate-500">
          {baixando
            ? `Baixando ${feitos} de ${urls.length} PDFs…`
            : completo
              ? `Todos os ${urls.length} PDFs estão salvos neste aparelho.`
              : salvos !== null
                ? `${salvos} de ${urls.length} PDFs salvos neste aparelho. Baixe tudo para abrir em campo, sem sinal.`
                : `Baixe os ${urls.length} PDFs para abrir em campo, sem sinal.`}
          {falhas > 0 && !baixando && ` ${falhas} não baixaram: tente de novo com internet.`}
          {semSuporte && " Este navegador não guarda arquivos offline; instale o app na tela inicial."}
        </p>
        {baixando && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-rbs transition-all" style={{ width: `${(feitos / urls.length) * 100}%` }} />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={baixar}
        disabled={baixando}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rbs px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rbs-dark disabled:opacity-60 sm:w-auto"
      >
        {baixando ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />}
        {completo ? "Atualizar arquivos" : "Salvar offline"}
      </button>
    </div>
  );
}
