import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  ArrowDownLeft, ArrowUpRight, BarChart3, ClipboardCheck, CalendarDays, ChevronLeft, ChevronRight, Eye, EyeOff, FileText, Plus,
} from "lucide-react";
import { auth, db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { brl } from "../../lib/orcamentos";
import {
  PERIODOS, RESULTADO_ROTULO, dadosSemana, dataDoLancamento, filtrar, idPagamentoFixa, inicioSemana, intervalo, mesReferencia, resumir,
} from "../../lib/financeiro";
import LancamentoForm from "./LancamentoForm";
import { useFinanceiro, useOcultarValores } from "./useFinanceiro";

const COR_RECEBIDO = "#15803d";
const COR_GASTO = "#dc2626";
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const fmtCurta = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function Atalho({ to, icone: Icone, rotulo, cor }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-sm font-bold text-rbs-navy shadow-sm hover:shadow-md">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white ${cor}`}><Icone size={18} /></span>
      {rotulo}
    </Link>
  );
}

function Grafico({ dias, selecionado, aoSelecionar, ocultar }) {
  const maximo = Math.max(1, ...dias.flatMap((d) => [d.receitas, d.despesas]));
  const altura = (v) => (v > 0 ? `${Math.max(3, (v / maximo) * 100)}%` : "0");
  return (
    <div className="grid grid-cols-7 gap-1" role="group" aria-label="Recebido e gasto por dia">
      {dias.map((d, i) => {
        const ativo = selecionado === i;
        const resumo = `${DIAS[i]} ${fmtCurta(d.data)}: recebido ${ocultar ? "oculto" : brl(d.receitas)}, gasto ${ocultar ? "oculto" : brl(d.despesas)}`;
        return (
          <button key={DIAS[i]} title={resumo} aria-label={resumo} aria-pressed={ativo} onClick={() => aoSelecionar(i)}
            className={`rounded-lg px-1 pt-2 ${ativo ? "bg-blue-50" : "hover:bg-slate-50"}`}>
            <span className="flex h-36 items-end justify-center gap-[2px] border-b border-slate-200">
              <span className="w-2.5 rounded-t sm:w-4" style={{ height: altura(d.receitas), background: COR_RECEBIDO }} />
              <span className="w-2.5 rounded-t sm:w-4" style={{ height: altura(d.despesas), background: COR_GASTO }} />
            </span>
            <span className={`mt-1 block text-xs font-bold ${ativo ? "text-blue-700" : "text-slate-700"}`}>{DIAS[i]}</span>
            <span className="block text-[10px] text-slate-500">{fmtCurta(d.data)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Financeiro() {
  const { isAdmin } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lancamentos, contas, carregando, erro, recarregar } = useFinanceiro();
  const [ocultar, alternarOcultar] = useOcultarValores();
  const [periodo, setPeriodo] = useState("semana");
  const [desvioSemana, setDesvioSemana] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState((new Date().getDay() + 6) % 7);
  const [form, setForm] = useState(state?.novoLancamento || null);
  const [aviso, setAviso] = useState("");

  const v = (x) => (ocultar ? "R$ •••••" : brl(x));
  const hoje = new Date();
  const faixa = intervalo(periodo, hoje);
  const resumo = useMemo(() => resumir(filtrar(lancamentos, faixa)), [lancamentos, periodo]); // eslint-disable-line
  const inicio = useMemo(() => {
    const i = inicioSemana(hoje);
    i.setDate(i.getDate() + desvioSemana * 7);
    return i;
  }, [desvioSemana]); // eslint-disable-line
  const dias = useMemo(() => dadosSemana(lancamentos, inicio), [lancamentos, inicio]);
  const semana = resumir(dias.map((d) => [
    { tipo: "entrada", valor: d.receitas }, { tipo: "saida", valor: d.despesas },
  ]).flat());
  const fimSemana = dias[6].data;
  const dia = dias[diaSelecionado];
  const mes = mesReferencia(hoje);
  const pagas = new Set(lancamentos.map((l) => l.id));

  async function pagarConta(conta) {
    if (!window.confirm(`Registrar o pagamento de "${conta.nome}" (${brl(conta.valor)}) em ${mes}?`)) return;
    try {
      await setDoc(doc(db, "lancamentos", idPagamentoFixa(conta.id, mes)), {
        tipo: "saida", descricao: conta.nome, categoria: conta.categoria || "Outros", valor: conta.valor,
        data: new Date(), formaPagamento: "Pix", contaFixaId: conta.id, mesReferencia: mes,
        criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(), criadoPor: auth.currentUser?.uid || null,
      });
      await recarregar();
    } catch (e) {
      setAviso("Não foi possível registrar: " + e.message);
    }
  }

  if (!isAdmin) return <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm">O Financeiro é restrito ao administrador.</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-rbs-navy">Financeiro</h1>
          <p className="text-sm text-slate-500">Controle do seu negócio</p>
        </div>
        <button aria-label={ocultar ? "Mostrar valores" : "Ocultar valores"} onClick={alternarOcultar} className="rounded-full bg-white p-2.5 text-slate-600 shadow-sm">
          {ocultar ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </header>

      {(erro || aviso) && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro || aviso}</p>}

      <button onClick={() => setForm({})} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm hover:shadow-md">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white"><Plus size={22} /></span>
        <span className="flex-1"><span className="block font-bold text-rbs-navy">Fazer lançamento</span><span className="text-sm text-slate-500">Registrar entrada ou saída</span></span>
        <ChevronRight size={18} className="text-slate-400" />
      </button>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Atalho to="/financeiro/cobrancas" icone={ClipboardCheck} rotulo="Cobranças PMOC" cor="from-blue-700 to-blue-900" />
        <Atalho to="/financeiro/extrato?tipo=entrada" icone={ArrowDownLeft} rotulo="Entradas" cor="from-emerald-500 to-green-700" />
        <Atalho to="/financeiro/extrato?tipo=saida" icone={ArrowUpRight} rotulo="Saídas" cor="from-red-500 to-red-700" />
        <Atalho to="/financeiro/contas-fixas" icone={CalendarDays} rotulo="Contas Fixas" cor="from-violet-500 to-indigo-700" />
        <Atalho to="/financeiro/extrato" icone={FileText} rotulo="Extratos" cor="from-blue-500 to-blue-700" />
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm sm:grid-cols-4">
        {PERIODOS.map(([id, rotulo]) => (
          <button key={id} aria-pressed={periodo === id} onClick={() => setPeriodo(id)}
            className={`rounded-lg py-2 text-sm font-bold ${periodo === id ? "bg-rbs text-white" : "bg-slate-100 text-slate-700"}`}>{rotulo}</button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        <div className="min-w-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="flex items-center gap-2 text-sm text-slate-600"><ArrowDownLeft size={16} className="text-green-700" /> Receitas</p>
              <p className="mt-1 break-words text-xl font-extrabold text-green-700">{v(resumo.receitas)}</p>
              <p className="text-xs text-slate-500">{resumo.qtdEntradas} lançamentos</p>
            </section>
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="flex items-center gap-2 text-sm text-slate-600"><ArrowUpRight size={16} className="text-red-600" /> Despesas</p>
              <p className="mt-1 break-words text-xl font-extrabold text-red-600">{v(resumo.despesas)}</p>
              <p className="text-xs text-slate-500">{resumo.qtdSaidas} lançamentos</p>
            </section>
          </div>
          <section className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4">
            <BarChart3 size={28} className="text-blue-700" />
            <div>
              <p className="text-sm text-slate-600">{RESULTADO_ROTULO[periodo]}</p>
              <p className="text-2xl font-extrabold text-rbs-navy">{v(resumo.resultado)}</p>
            </div>
          </section>
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="font-extrabold text-rbs-navy">Lucro e gastos da semana</h2>
            <div className="my-2 flex items-center justify-between">
              <button aria-label="Semana anterior" onClick={() => setDesvioSemana((s) => s - 1)} className="rounded-lg bg-slate-100 p-2"><ChevronLeft size={18} /></button>
              <p className="text-center text-sm font-bold text-rbs-navy">{fmtCurta(inicio)} – {fmtCurta(fimSemana)}
                <span className="block text-xs font-normal text-slate-500">{desvioSemana === 0 ? "Semana atual" : `${Math.abs(desvioSemana)} semana(s) ${desvioSemana < 0 ? "atrás" : "à frente"}`}</span>
              </p>
              <button aria-label="Próxima semana" onClick={() => setDesvioSemana((s) => s + 1)} className="rounded-lg bg-slate-100 p-2"><ChevronRight size={18} /></button>
            </div>
            <p className="text-sm text-slate-600">Lucro da semana</p>
            <p className="text-2xl font-extrabold text-rbs-navy">{v(semana.resultado)}</p>
            <p className="mb-2 mt-1 flex gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: COR_RECEBIDO }} /> Recebido</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: COR_GASTO }} /> Gasto</span>
            </p>
            <Grafico dias={dias} selecionado={diaSelecionado} aoSelecionar={setDiaSelecionado} ocultar={ocultar} />
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-bold text-rbs-navy">{dia.data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div><dt>Recebido</dt><dd className="text-sm font-bold text-green-700">{v(dia.receitas)}</dd></div>
                <div><dt>Gasto</dt><dd className="text-sm font-bold text-red-600">{v(dia.despesas)}</dd></div>
                <div><dt>Resultado</dt><dd className="text-sm font-bold text-rbs-navy">{v(dia.resultado)}</dd></div>
              </dl>
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-3">
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-extrabold text-rbs-navy">Contas Fixas</h2>
              <Link to="/financeiro/contas-fixas" className="text-sm font-bold text-blue-700">Ver todas →</Link>
            </div>
            {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : contas.filter((c) => c.ativa !== false).length === 0 ? (
              <div className="py-3 text-center">
                <p className="font-bold text-rbs-navy">Nenhuma conta fixa cadastrada</p>
                <p className="mb-3 text-sm text-slate-500">Cadastre aluguel, internet e outras despesas mensais.</p>
                <button onClick={() => navigate("/financeiro/contas-fixas")} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">+ Adicionar conta fixa</button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {contas.filter((c) => c.ativa !== false).slice(0, 5).map((c) => {
                  const paga = pagas.has(idPagamentoFixa(c.id, mes));
                  return (
                    <li key={c.id} className="flex items-center gap-2 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-rbs-navy">{c.nome}</p>
                        <p className="text-xs text-slate-500">Vence dia {c.diaVencimento} • {v(c.valor)}</p>
                      </div>
                      {paga
                        ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Paga</span>
                        : <button onClick={() => pagarConta(c)} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Pagar</button>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-extrabold text-rbs-navy">Últimos lançamentos</h2>
              <Link to="/financeiro/extrato" className="text-sm font-bold text-blue-700">Ver todos →</Link>
            </div>
            {lancamentos.length === 0 && !carregando ? <p className="py-3 text-center text-sm text-slate-500">Nenhum lançamento ainda.</p> : (
              <ul className="divide-y divide-slate-100">
                {lancamentos.slice(0, 6).map((l) => (
                  <li key={l.id}>
                    <button onClick={() => setForm(l)} className="flex w-full items-center gap-2 py-2 text-left">
                      {l.tipo === "entrada" ? <ArrowDownLeft size={18} className="shrink-0 text-green-700" /> : <ArrowUpRight size={18} className="shrink-0 text-red-600" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-rbs-navy">{l.descricao}</span>
                        <span className="text-xs text-slate-500">{l.tipo === "entrada" ? "Entrada" : "Saída"} • {dataDoLancamento(l)?.toLocaleDateString("pt-BR")}</span>
                      </span>
                      <span className={`text-sm font-extrabold ${l.tipo === "entrada" ? "text-green-700" : "text-red-600"}`}>{ocultar ? "•••••" : `${l.tipo === "entrada" ? "+" : "-"} ${brl(l.valor)}`}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {form && <LancamentoForm inicial={form} aoFechar={() => { setForm(null); navigate("/financeiro", { replace: true, state: null }); }} aoSalvar={() => { setForm(null); recarregar(); navigate("/financeiro", { replace: true, state: null }); }} />}
    </div>
  );
}
