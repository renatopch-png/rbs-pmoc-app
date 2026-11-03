import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ClipboardCheck } from "lucide-react";
import { brl } from "../lib/orcamentos";
import { dataBR, lerColecao } from "../lib/modulos";
import { garantirCobrancasDoMes, nomeMes, resumoAReceber, statusCobranca } from "../lib/cobrancas";
import { mesReferencia } from "../lib/financeiro";

// Bloco do Financeiro: valores a receber dos contratos PMOC (mensalidades).
export default function AReceberPMOC({ ocultar = false }) {
  const [r, setR] = useState(null);
  const [erro, setErro] = useState("");
  const v = (x) => (ocultar ? "R$ •••••" : brl(x));

  useEffect(() => {
    (async () => {
      try {
        const [p, o, c0] = await Promise.all([lerColecao("preventivos"), lerColecao("ordens_servico"), lerColecao("cobrancas")]);
        const geradas = await garantirCobrancasDoMes(p, c0, o).catch(() => 0);
        setR(resumoAReceber(geradas ? await lerColecao("cobrancas") : c0));
      } catch (e) {
        setErro(e.message);
      }
    })();
  }, []);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white"><ClipboardCheck size={20} /></span>
        <div className="flex-1">
          <h2 className="font-extrabold text-rbs-navy">A receber — Contratos PMOC</h2>
          <p className="text-xs text-slate-500">Mensalidades das manutenções • {nomeMes(mesReferencia())}</p>
        </div>
        <Link to="/financeiro/cobrancas" className="text-sm font-bold text-blue-700">Ver todas →</Link>
      </div>
      {erro && <p className="text-sm text-red-700">Não foi possível carregar: {erro}</p>}
      {!r ? <p className="text-sm text-slate-500">Carregando...</p> : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-800">A receber</p><p className="text-lg font-extrabold text-amber-700">{v(r.aReceber)}</p><p className="text-[11px] text-amber-800">{r.qtdAbertas} cobrança(s)</p></div>
            <div className="rounded-xl bg-red-50 p-3"><p className="text-xs text-red-800">Vencido</p><p className="text-lg font-extrabold text-red-600">{v(r.vencido)}</p><p className="text-[11px] text-red-800">{r.qtdVencidas} cobrança(s)</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-600">Previsto no mês</p><p className="text-lg font-extrabold text-rbs-navy">{v(r.previstoMes)}</p></div>
            <div className="rounded-xl bg-green-50 p-3"><p className="text-xs text-green-800">Recebido no mês</p><p className="text-lg font-extrabold text-green-700">{v(r.recebidoMes)}</p></div>
          </div>
          {r.abertas.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
              Nada a receber. Para cobrar um contrato, no <Link to="/preventivo" className="font-bold text-blue-700">Cadastro Preventivo</Link> marque “Gerar cobrança mensal” e informe o valor.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {r.abertas.slice(0, 6).map((c) => {
                const st = statusCobranca(c);
                return (
                  <li key={c.id}>
                    <Link to={`/financeiro/cobrancas/${c.id}`} className="flex items-center gap-2 py-2">
                      {st.vencida && <AlertTriangle size={16} className="shrink-0 text-red-600" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-rbs-navy">{c.clienteNome}</span>
                        <span className="text-xs text-slate-500">{nomeMes(c.mesReferencia)} • vence {dataBR(c.vencimento)}</span>
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.cor}`}>{st.rotulo}</span>
                      <span className="text-sm font-extrabold text-amber-700">{ocultar ? "•••••" : brl(c.valor)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
