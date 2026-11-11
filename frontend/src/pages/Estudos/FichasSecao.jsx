import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, FileText, Layers, X } from "lucide-react";
import { FICHAS, MODULOS } from "../../data/fichasInstrumentacao";
import { BOTAO, BOTAO_SEC, Filtros } from "../../components/ui";
import Ficha from "./Ficha";

const pad = (n) => String(n).padStart(2, "0");
export const PDF_FICHAS = "/estudos/fichas/fichas-instrumentacao.pdf";
export const pdfModulo = (m) => `/estudos/fichas/modulo-${pad(m + 1)}.pdf`;

// Visualizador em tela cheia com navegação entre fichas.
function Visualizador({ lista, indice, aoMudar, aoFechar }) {
  const ficha = lista[indice];
  useEffect(() => {
    function tecla(e) {
      if (e.key === "Escape") aoFechar();
      if (e.key === "ArrowRight" && indice < lista.length - 1) aoMudar(indice + 1);
      if (e.key === "ArrowLeft" && indice > 0) aoMudar(indice - 1);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [indice, lista.length, aoMudar, aoFechar]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-2 sm:p-6" onClick={aoFechar}>
      <div role="dialog" aria-label={ficha.titulo} className="mx-auto max-w-3xl space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow">
          <button type="button" onClick={() => aoMudar(indice - 1)} disabled={indice === 0} aria-label="Ficha anterior" className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={20} /></button>
          <span className="flex-1 text-center text-xs font-bold text-slate-500">{indice + 1} de {lista.length}</span>
          <button type="button" onClick={() => aoMudar(indice + 1)} disabled={indice === lista.length - 1} aria-label="Próxima ficha" className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={20} /></button>
          <a href={pdfModulo(ficha.mod)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-rbs-light px-3 py-2 text-xs font-bold text-rbs hover:bg-blue-100"><FileText size={14} /> PDF do módulo</a>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <Ficha key={ficha.id} ficha={ficha} />
      </div>
    </div>
  );
}

export default function FichasSecao({ visiveis }) {
  const [mod, setMod] = useState("todos");
  const [aberta, setAberta] = useState(null);
  const lista = visiveis.filter((f) => mod === "todos" || f.mod === Number(mod));
  const opcoes = [
    { valor: "todos", rotulo: "Todos", qtd: visiveis.length },
    ...MODULOS.map((m, i) => ({ valor: String(i), rotulo: `${pad(i + 1)} · ${m}`, qtd: visiveis.filter((f) => f.mod === i).length })).filter((o) => o.qtd > 0),
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-rbs-navy text-white shadow"><Layers size={24} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold leading-tight text-rbs-navy">Fichas visuais · Instrumentação</h2>
          <p className="text-sm text-slate-500">{FICHAS.length} fichas ilustradas em {MODULOS.length} módulos. Toque nos números da ilustração para destacar cada peça.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          <a href={PDF_FICHAS} target="_blank" rel="noopener noreferrer" className={BOTAO}><FileText size={16} /> PDF completo</a>
          <a href={PDF_FICHAS} download className={BOTAO_SEC}><Download size={16} /> Baixar</a>
        </div>
      </div>

      <Filtros opcoes={opcoes} valor={mod} aoMudar={setMod} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {lista.map((f, i) => (
          <button
            type="button"
            key={f.id}
            onClick={() => setAberta(i)}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-rbs"
          >
            <span className="relative block bg-gradient-to-b from-slate-50 to-white p-1" dangerouslySetInnerHTML={{ __html: f.arte }} />
            <span className="flex flex-1 flex-col gap-0.5 border-t border-slate-100 p-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Ficha {pad(f.num)} · {MODULOS[f.mod]}</span>
              <span className="text-sm font-extrabold leading-tight text-rbs-navy group-hover:text-rbs">{f.titulo}</span>
            </span>
          </button>
        ))}
      </div>

      {aberta !== null && lista[aberta] && <Visualizador lista={lista} indice={aberta} aoMudar={setAberta} aoFechar={() => setAberta(null)} />}
    </section>
  );
}
