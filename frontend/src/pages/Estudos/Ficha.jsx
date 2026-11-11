import { useState } from "react";
import {
  Activity, Antenna, Fan, ArrowRight, BookOpen, Cable, Calculator, Circle, ClipboardCheck, Cpu, Database, Droplets, Eye, Factory, Flame, Gauge, GraduationCap, Hand, KeyRound, Layers, Magnet, Monitor, MoveVertical, Plug, Radio, Repeat, Ruler, Scale, Server, Settings, Shield, ShieldAlert, Sigma, Siren, SlidersHorizontal, Spline, Target, Thermometer, Timer, ToggleRight, TriangleAlert, Waves, Wind, Wrench, Zap,
} from "lucide-react";

// Só os ícones usados nas fichas (importar a biblioteca inteira aumenta o app em ~1 MB).
const Icones = { Activity, Antenna, Fan, Fan, ArrowRight, BookOpen, Cable, Calculator, Circle, ClipboardCheck, Cpu, Database, Droplets, Eye, Factory, Flame, Gauge, GraduationCap, Hand, KeyRound, Layers, Magnet, Monitor, MoveVertical, Plug, Radio, Repeat, Ruler, Scale, Server, Settings, Shield, ShieldAlert, Sigma, Siren, SlidersHorizontal, Spline, Target, Thermometer, Timer, ToggleRight, TriangleAlert, Waves, Wind, Wrench, Zap };

const pad = (n) => String(n).padStart(2, "0");

// Destaque do marcador ativo na ilustração (marcadores têm data-n = 1..6).
const CSS_MARCADOR = `.fv-mk{cursor:pointer}.fv-mk circle[r="8.5"]{transition:fill .15s}` +
  [1, 2, 3, 4, 5, 6].map((n) => `.ficha[data-ativo="${n}"] .fv-mk[data-n="${n}"] circle[r="8.5"]{fill:#d9480f}`).join("");

function Icone({ nome, ...p }) {
  const I = Icones[nome] || Icones.Circle;
  return <I {...p} />;
}

// Ficha visual no formato pôster: ilustração com peças numeradas, cadeia funcional,
// exemplo numérico, atenção e ponto-chave. `pagina` fixa o tamanho em A4 (impressão).
export default function Ficha({ ficha, serie, pagina = false }) {
  const [ativo, setAtivo] = useState(0);
  const modulo = serie.modulos[ficha.mod];

  function clicarArte(e) {
    const g = e.target.closest?.("[data-n]");
    if (g) setAtivo(Number(g.dataset.n));
  }

  return (
    <article
      data-ativo={ativo}
      className={`ficha relative overflow-hidden bg-white text-slate-800 ${pagina ? "flex h-[1123px] w-[794px] flex-col px-11 pb-7 pt-9" : "rounded-2xl p-4 sm:p-6"}`}
    >
      <style>{CSS_MARCADOR}</style>
      <span aria-hidden="true" className="pointer-events-none absolute right-24 top-3 select-none font-black leading-none text-slate-100 sm:right-28" style={{ fontSize: pagina ? 150 : 96 }}>
        {pad(ficha.num)}
      </span>

      <header className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-rbs-navy sm:text-[11px]">
            <Icones.GraduationCap size={14} /> Meu Estudo · Fichas de {serie.curto}
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-[11px]">Módulo {pad(ficha.mod + 1)} — {modulo}</p>
        </div>
        <div className="shrink-0 rounded-md bg-rbs-navy px-2.5 py-1 text-center leading-none text-white">
          <span className="block text-[9px] font-bold tracking-wider">FICHA</span>
          <span className="block text-xl font-black">{pad(ficha.num)}</span>
        </div>
      </header>

      <div className="relative mt-3 border-b-2 border-rbs-navy pb-3">
        <h2 className={`font-black leading-[0.98] tracking-tight text-rbs-navy ${pagina ? "text-[40px]" : "text-[26px] sm:text-4xl"}`} style={{ textWrap: "balance" }}>
          {ficha.titulo}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">{ficha.sub}</p>
      </div>

      {pagina ? (
        <>
          <div className="mt-4 grid flex-1 grid-cols-[1.85fr_1fr] gap-4">
            <div className="flex flex-col gap-4">
        <div
          className={`rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2 flex flex-1 items-center [&>svg]:w-full`}
          onClick={clicarArte}
          role="img"
          aria-label={`Ilustração: ${ficha.titulo}`}
          dangerouslySetInnerHTML={{ __html: ficha.arte }}
        />
        <section className="rounded-xl border-2 border-rbs bg-rbs-light/60 p-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rbs"><Icones.Calculator size={14} /> Exemplo numérico</h3>
          <dl className="space-y-0.5 text-[12px]">
            {ficha.exemplo.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-2 border-b border-blue-100 pb-0.5 last:border-0">
                <dt className="font-bold text-slate-600">{k}</dt><dd className="font-extrabold text-rbs-navy">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
            </div>
        <ol className={`grid gap-2 ${pagina ? "content-center" : "content-start"}`}>
          {ficha.partes.map(([nome, desc], i) => {
            const n = i + 1;
            const on = ativo === n;
            return (
              <li key={nome}>
                <button
                  type="button"
                  onClick={() => setAtivo(on ? 0 : n)}
                  aria-pressed={on}
                  className={`flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-1.5 text-left transition ${on ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white hover:border-rbs"}`}
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${on ? "bg-orange-600" : "bg-rbs-navy"}`}>{pad(n)}</span>
                  <span className="min-w-0">
                    <span className={`block font-extrabold leading-tight text-rbs-navy ${pagina ? "text-[14px]" : "text-[13px]"}`}>{nome}</span>
                    <span className={`block leading-snug text-slate-600 ${pagina ? "text-[13px]" : "text-[12.5px]"}`}>{desc}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
          </div>
      <section className="mt-4 rounded-xl border border-slate-200 p-3">
        <h3 className="mx-auto -mt-6 mb-2 w-fit rounded bg-rbs-navy px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">Cadeia funcional</h3>
        <div className="flex flex-wrap items-start justify-center gap-y-2">
          {ficha.cadeia.map(([ic, rot], i) => (
            <div key={rot + i} className="flex items-start">
              {i > 0 && <Icones.ArrowRight size={16} className="mx-1 mt-3 shrink-0 text-slate-400" />}
              <div className="flex w-[72px] flex-col items-center text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-rbs bg-rbs-light text-rbs"><Icone nome={ic} size={20} /></span>
                <span className="mt-1 text-[11px] font-bold leading-tight text-slate-700">{rot}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
          <div className="mt-4 grid grid-cols-2 gap-3">
        <section className="rounded-xl border-2 border-red-300 bg-red-50 p-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-red-700"><Icones.TriangleAlert size={14} /> Atenção</h3>
          <p className="text-[12.5px] leading-snug text-red-900">{ficha.atencao}</p>
        </section>
        <section className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700"><Icones.KeyRound size={14} /> Ponto-chave</h3>
          <p className="text-[12.5px] font-semibold leading-snug text-emerald-900">{ficha.chave}</p>
        </section>
          </div>
        </>
      ) : (
        <>
      <div className={`mt-4 grid gap-4 ${pagina ? "min-h-0 flex-1 grid-cols-[1.5fr_1fr]" : "md:grid-cols-[1.25fr_1fr]"}`}>
        <div
          className={`rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2 ${pagina ? "flex items-center [&>svg]:w-full" : ""}`}
          onClick={clicarArte}
          role="img"
          aria-label={`Ilustração: ${ficha.titulo}`}
          dangerouslySetInnerHTML={{ __html: ficha.arte }}
        />
        <ol className={`grid gap-2 ${pagina ? "content-center" : "content-start"}`}>
          {ficha.partes.map(([nome, desc], i) => {
            const n = i + 1;
            const on = ativo === n;
            return (
              <li key={nome}>
                <button
                  type="button"
                  onClick={() => setAtivo(on ? 0 : n)}
                  aria-pressed={on}
                  className={`flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-1.5 text-left transition ${on ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white hover:border-rbs"}`}
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${on ? "bg-orange-600" : "bg-rbs-navy"}`}>{pad(n)}</span>
                  <span className="min-w-0">
                    <span className={`block font-extrabold leading-tight text-rbs-navy ${pagina ? "text-[14px]" : "text-[13px]"}`}>{nome}</span>
                    <span className={`block leading-snug text-slate-600 ${pagina ? "text-[13px]" : "text-[12.5px]"}`}>{desc}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <section className="mt-4 rounded-xl border border-slate-200 p-3">
        <h3 className="mx-auto -mt-6 mb-2 w-fit rounded bg-rbs-navy px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">Cadeia funcional</h3>
        <div className="flex flex-wrap items-start justify-center gap-y-2">
          {ficha.cadeia.map(([ic, rot], i) => (
            <div key={rot + i} className="flex items-start">
              {i > 0 && <Icones.ArrowRight size={16} className="mx-1 mt-3 shrink-0 text-slate-400" />}
              <div className="flex w-[72px] flex-col items-center text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-rbs bg-rbs-light text-rbs"><Icone nome={ic} size={20} /></span>
                <span className="mt-1 text-[11px] font-bold leading-tight text-slate-700">{rot}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className={`mt-4 grid gap-3 ${pagina ? "grid-cols-3" : "sm:grid-cols-3"}`}>
        <section className="rounded-xl border-2 border-rbs bg-rbs-light/60 p-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rbs"><Icones.Calculator size={14} /> Exemplo numérico</h3>
          <dl className="space-y-0.5 text-[12px]">
            {ficha.exemplo.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-2 border-b border-blue-100 pb-0.5 last:border-0">
                <dt className="font-bold text-slate-600">{k}</dt><dd className="font-extrabold text-rbs-navy">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-xl border-2 border-red-300 bg-red-50 p-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-red-700"><Icones.TriangleAlert size={14} /> Atenção</h3>
          <p className="text-[12.5px] leading-snug text-red-900">{ficha.atencao}</p>
        </section>
        <section className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700"><Icones.KeyRound size={14} /> Ponto-chave</h3>
          <p className="text-[12.5px] font-semibold leading-snug text-emerald-900">{ficha.chave}</p>
        </section>
      </div>
        </>
      )}

      <footer className={`flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 ${pagina ? "mt-auto" : "mt-4"}`}>
        <span>Meu Estudo · {serie.nome}</span>
        {!pagina && <span className="hidden normal-case sm:inline">Toque nos números para destacar cada peça</span>}
        <span>Ficha {pad(ficha.num)} / {serie.fichas.length}</span>
      </footer>
    </article>
  );
}
