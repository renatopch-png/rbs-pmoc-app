import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Circle, Download, FileText, Lightbulb } from "lucide-react";
import { modulo } from "../../data/menu";
import { COLECOES } from "../../data/estudos";
import { BOTAO, BOTAO_SEC, Badge, Busca, Cabecalho, Filtros, Painel, Vazio } from "../../components/ui";

const MOD = modulo("/estudos");
const CHAVE = "rbs-estudos-concluidos";
const CORES_RAMO = ["text-blue-700", "text-emerald-700", "text-red-700", "text-violet-700", "text-amber-700", "text-cyan-700"];

function lerConcluidos() {
  try { return new Set(JSON.parse(localStorage.getItem(CHAVE) || "[]")); } catch { return new Set(); }
}

const chave = (c, t) => `${c.id}/${t.id}`;
const numero = (i) => String(i + 1).padStart(2, "0");
const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Estudos() {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(null);
  const [concluidos, setConcluidos] = useState(lerConcluidos);

  function alternar(k) {
    setConcluidos((atual) => {
      const novo = new Set(atual);
      novo.has(k) ? novo.delete(k) : novo.add(k);
      try { localStorage.setItem(CHAVE, JSON.stringify([...novo])); } catch { /* sem armazenamento local */ }
      return novo;
    });
  }

  const termo = normalizar(busca.trim());
  const colecoes = useMemo(() => COLECOES
    .filter((c) => filtro === "todas" || c.id === filtro)
    .map((c) => ({
      ...c,
      visiveis: c.topicos
        .map((t, i) => ({ ...t, i }))
        .filter((t) => !termo || normalizar([t.titulo, t.resumo, t.dica, ...t.ramos.flatMap((r) => [r.titulo, ...r.itens])].join(" ")).includes(termo)),
    })), [filtro, termo]);

  const total = COLECOES.reduce((s, c) => s + c.topicos.length, 0);
  const opcoes = [
    { valor: "todas", rotulo: "Todas", qtd: total },
    ...COLECOES.map((c) => ({ valor: c.id, rotulo: c.titulo, qtd: c.topicos.length })),
  ];
  const nada = colecoes.every((c) => c.visiveis.length === 0);

  return (
    <div className="space-y-4">
      <Cabecalho modulo={MOD} subtitulo={`${total} mapas técnicos em PDF, organizados por tópico`} />

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar tópico, fórmula ou termo (ex.: Pt100, degelo, 4–20 mA)" />
        <Filtros opcoes={opcoes} valor={filtro} aoMudar={setFiltro} />
      </div>

      {nada && <Vazio>Nenhum tópico encontrado para “{busca}”.</Vazio>}

      {colecoes.filter((c) => c.visiveis.length > 0).map((c) => {
        const feitos = c.topicos.filter((t) => concluidos.has(chave(c, t))).length;
        const pct = Math.round((feitos / c.topicos.length) * 100);
        return (
          <section key={c.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow ${c.cor}`}>
                <BookOpen size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold leading-tight text-rbs-navy">{c.titulo}</h2>
                <p className="text-sm text-slate-500">{c.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso em ${c.titulo}`}>
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{feitos}/{c.topicos.length} estudados</span>
                </div>
              </div>
              <div className="flex w-full gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
                <a href={c.pdf} target="_blank" rel="noopener noreferrer" className={BOTAO}><FileText size={16} /> PDF completo</a>
                <a href={c.pdf} download className={BOTAO_SEC}><Download size={16} /> Baixar</a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {c.visiveis.map((t) => {
                const feito = concluidos.has(chave(c, t));
                return (
                  <article key={t.id} className="flex flex-col rounded-2xl bg-white p-4 shadow-sm">
                    <button type="button" onClick={() => setAberto({ c, t })} className="flex flex-1 items-start gap-3 text-left">
                      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-rbs-navy font-mono text-[11px] font-bold leading-tight text-rbs-navy">
                        <span>{t.tag}</span>
                        <span className="w-full border-t-2 border-rbs-navy pt-0.5 text-center text-[10px] text-slate-500">{numero(t.i)}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block font-extrabold leading-tight text-rbs-navy">{t.titulo}</span>
                        <span className="mt-0.5 block text-sm text-slate-500">{t.resumo}</span>
                      </span>
                    </button>
                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <a href={t.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-rbs-light px-2.5 py-1.5 text-xs font-bold text-rbs hover:bg-blue-100">
                        <FileText size={14} /> PDF
                      </a>
                      <button type="button" onClick={() => setAberto({ c, t })} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Ver resumo</button>
                      <button type="button" onClick={() => alternar(chave(c, t))} aria-pressed={feito} className={`ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold ${feito ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"}`}>
                        {feito ? <CheckCircle2 size={16} /> : <Circle size={16} />} {feito ? "Estudado" : "Marcar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {aberto && (
        <Painel titulo={`${numero(aberto.t.i)} · ${aberto.t.titulo}`} aoFechar={() => setAberto(null)}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge cor="bg-rbs-light text-rbs">{aberto.c.titulo}</Badge>
              <p className="text-sm text-slate-500">{aberto.t.resumo}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {aberto.t.ramos.map((r, k) => (
                <div key={r.titulo} className="rounded-xl border border-slate-200 p-3">
                  <h3 className={`mb-1.5 text-sm font-extrabold ${CORES_RAMO[k % CORES_RAMO.length]}`}>{k + 1}. {r.titulo}</h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {r.itens.map((x) => <li key={x} className="flex gap-1.5"><span className="text-slate-300">–</span><span>{x}</span></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex gap-2 rounded-xl border border-dashed border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
              <Lightbulb size={18} className="mt-0.5 shrink-0" />
              <p><b>Dica de campo:</b> {aberto.t.dica}</p>
            </div>
            <div className="flex flex-wrap gap-2 [&>*]:flex-1">
              <a href={aberto.t.pdf} target="_blank" rel="noopener noreferrer" className={BOTAO}><FileText size={16} /> Abrir PDF ilustrado</a>
              <button type="button" onClick={() => alternar(chave(aberto.c, aberto.t))} className={BOTAO_SEC}>
                {concluidos.has(chave(aberto.c, aberto.t)) ? <><CheckCircle2 size={16} className="text-emerald-600" /> Estudado</> : <><Circle size={16} /> Marcar como estudado</>}
              </button>
            </div>
            <p className="text-xs text-slate-400">Valores típicos: confirme sempre no datasheet do fabricante e na norma vigente.</p>
          </div>
        </Painel>
      )}
    </div>
  );
}
