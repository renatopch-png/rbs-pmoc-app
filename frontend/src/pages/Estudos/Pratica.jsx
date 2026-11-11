import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { BOTAO, BOTAO_SEC } from "../../components/ui";

const LETRAS = ["A", "B", "C", "D"];

// Exemplo resolvido: enunciado, passos numerados e resposta destacada.
export function ExemploResolvido({ exemplo }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Problema</span>
        {exemplo.enunciado}
      </div>
      <ol className="space-y-2">
        {exemplo.passos.map((p, i) => (
          <li key={p} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rbs text-xs font-bold text-white">{i + 1}</span>
            <span className="pt-0.5 font-mono text-[13px] text-slate-800">{p}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-900">
        <b>Resposta:</b> {exemplo.resposta}
      </div>
    </div>
  );
}

export function Tabela({ tabela }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-extrabold text-rbs-navy">{tabela.titulo}</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-rbs-dark text-white">
            <tr>{tabela.cab.map((c) => <th key={c} className="px-3 py-2 text-xs font-bold">{c}</th>)}</tr>
          </thead>
          <tbody>
            {tabela.linhas.map((l) => (
              <tr key={l.join("|")} className="odd:bg-white even:bg-rbs-light">
                {l.map((x, i) => <td key={i} className={`px-3 py-2 align-top ${i === 0 ? "font-bold text-slate-800" : "text-slate-700"}`}>{x}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Questões de múltipla escolha com correção imediata e placar.
export function Quiz({ questoes, aoTerminar }) {
  const [resp, setResp] = useState({});
  const respondidas = Object.keys(resp).length;
  const acertos = questoes.filter((q, i) => resp[i] === q.c).length;
  const fim = respondidas === questoes.length;

  function responder(i, k) {
    if (resp[i] !== undefined) return;
    const novo = { ...resp, [i]: k };
    setResp(novo);
    if (Object.keys(novo).length === questoes.length) {
      aoTerminar?.(questoes.filter((q, j) => novo[j] === q.c).length);
    }
  }

  return (
    <div className="space-y-4">
      {questoes.map((q, i) => {
        const r = resp[i];
        return (
          <fieldset key={q.p} className="space-y-2">
            <legend className="mb-1 text-sm font-bold text-slate-800">{i + 1}. {q.p}</legend>
            {q.origem && <p className="-mt-1 text-xs text-slate-400">{q.origem}</p>}
            {q.op.map((o, k) => {
              const certa = r !== undefined && k === q.c;
              const errada = r === k && k !== q.c;
              return (
                <button
                  type="button"
                  key={o}
                  onClick={() => responder(i, k)}
                  disabled={r !== undefined}
                  className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition
                    ${certa ? "border-emerald-500 bg-emerald-50 text-emerald-900" : errada ? "border-red-400 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-700 hover:border-rbs hover:bg-rbs-light"}
                    ${r !== undefined && !certa && !errada ? "opacity-60" : ""}`}
                >
                  <span className="font-mono font-bold">{LETRAS[k]})</span>
                  <span className="flex-1">{o}</span>
                  {certa && <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />}
                  {errada && <XCircle size={18} className="shrink-0 text-red-500" />}
                </button>
              );
            })}
            {r !== undefined && (
              <p className={`rounded-lg px-3 py-2 text-xs ${r === q.c ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                <b>{r === q.c ? "Correto." : `Resposta: ${LETRAS[q.c]}.`}</b> {q.ex}
              </p>
            )}
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
        <span className="flex-1 text-sm font-bold text-slate-700">
          {fim ? `Resultado: ${acertos} de ${questoes.length} (${Math.round((acertos / questoes.length) * 100)} %)` : `${respondidas} de ${questoes.length} respondidas`}
        </span>
        {respondidas > 0 && <button type="button" onClick={() => setResp({})} className={BOTAO_SEC}><RotateCcw size={16} /> Refazer</button>}
      </div>
    </div>
  );
}

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simulado: sorteia questões de todos os tópicos de uma coleção.
export function Simulado({ colecao, pratica, total = 10 }) {
  const [rodada, setRodada] = useState(0);
  const questoes = useMemo(() => embaralhar(
    colecao.topicos.flatMap((t, i) => (pratica[`${colecao.id}/${t.id}`]?.quiz || []).map((q) => ({ ...q, origem: `Tema ${String(i + 1).padStart(2, "0")} · ${t.titulo}` }))),
  ).slice(0, total), [colecao, pratica, total, rodada]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{questoes.length} questões sorteadas entre os {colecao.topicos.length} tópicos de {colecao.titulo}. Cada rodada traz uma combinação diferente.</p>
      <Quiz key={rodada} questoes={questoes} />
      <button type="button" onClick={() => setRodada((r) => r + 1)} className={`${BOTAO} w-full`}><RotateCcw size={16} /> Novo simulado</button>
    </div>
  );
}
