import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  AlertTriangle, Bell, HandCoins, Calendar, CalendarClock, CalendarDays, DollarSign, Eye, EyeOff,
  FileText, ShieldAlert, StickyNote, Wrench,
} from "lucide-react";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { NotificacoesBanner } from "../components/layout/NotificacoesManuencao";
import { MENU, CONFIGURACOES } from "../data/menu";
import { agendaSemanal, paraData } from "../lib/agenda";
import { brl } from "../lib/orcamentos";
import LinhaOrcamento from "../components/orcamentos/LinhaOrcamento";
import { garantirCobrancasDoMes, resumoAReceber, statusCobranca } from "../lib/cobrancas";
import { dataDoLancamento, mesReferencia } from "../lib/financeiro";
import { diasAte, lerColecao, statusGarantia, statusPreventivo } from "../lib/modulos";
import { Selo } from "../components/ui";

const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const CHAVE_VALOR = "rbs.ocultarValor";
const MODULOS = [...MENU.filter((m) => m.to !== "/orcamentos/novo"), CONFIGURACOES];

function lerPreferencia() {
  try { return localStorage.getItem(CHAVE_VALOR) === "1"; } catch { return false; }
}

function saudacao(h = new Date().getHours()) {
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// Cartão de alerta: número grande + rótulo, destacado quando há pendência.
function Alerta({ to, icone: Icone, valor, rotulo, tom }) {
  const ativo = valor > 0;
  const tons = {
    red: "bg-red-50 text-red-700 ring-red-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition hover:shadow-md ${ativo ? tons[tom] : "bg-white text-slate-400 ring-slate-100"}`}>
      <Icone size={22} className="shrink-0" />
      <span className="min-w-0">
        <span className="block text-2xl font-extrabold leading-none">{valor}</span>
        <span className="block truncate text-xs font-semibold">{rotulo}</span>
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { usuario, isAdmin } = useAuth();
  const [orcamentos, setOrcamentos] = useState([]);
  const [preventivos, setPreventivos] = useState([]);
  const [garantias, setGarantias] = useState([]);
  const [anotacoes, setAnotacoes] = useState([]);
  const [cobrancas, setCobrancas] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [semana, setSemana] = useState(() => agendaSemanal([], []));
  const [ocultarValor, setOcultarValor] = useState(lerPreferencia);

  async function carregarOrcamentos() {
    setOrcamentos(await lerColecao("orcamentos"));
  }

  useEffect(() => {
    (async () => {
      const [prev, gar] = await Promise.all([lerColecao("preventivos"), lerColecao("garantias")]);
      setPreventivos(prev);
      setGarantias(gar);
      try {
        const [equip, os] = await Promise.all([
          getDocs(collection(db, "equipamentos")),
          getDocs(collection(db, "ordens_servico")),
        ]);
        setSemana(agendaSemanal(
          equip.docs.map((d) => ({ id: d.id, ...d.data() })),
          os.docs.map((d) => ({ id: d.id, ...d.data() })),
          new Date(),
          prev,
        ));
      } catch (e) {
        console.error("Erro ao carregar a agenda:", e);
        setSemana(agendaSemanal([], [], new Date(), prev));
      }
      await carregarOrcamentos();
      if (isAdmin) {
        // Mesma regra do Financeiro: a cobrança do mês dos contratos já existe.
        const c0 = await lerColecao("cobrancas");
        const ordensLidas = await lerColecao("ordens_servico");
        const geradas = await garantirCobrancasDoMes(prev, c0, ordensLidas).catch(() => 0);
        setCobrancas(geradas ? await lerColecao("cobrancas") : c0);
        setLancamentos(await lerColecao("lancamentos"));
      }
      if (usuario?.uid) {
        try {
          const snap = await getDocs(query(collection(db, "anotacoes"), where("criadoPor", "==", usuario.uid)));
          setAnotacoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch { /* regras ainda não publicadas */ }
      }
    })();
  }, []);

  function alternarValor() {
    setOcultarValor((atual) => {
      try { localStorage.setItem(CHAVE_VALOR, atual ? "0" : "1"); } catch { /* preferência opcional */ }
      return !atual;
    });
  }

  const hoje = new Date();
  const doMes = orcamentos.filter((o) => {
    const d = paraData(o.criadoEm);
    return d && d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  });
  const valorMes = doMes
    .filter((o) => o.status !== "Reprovado")
    .reduce((total, o) => total + (Number(o.valorTotal) || 0), 0);
  const aprovadosMes = doMes.filter((o) => o.status === "Aprovado" || o.status === "Concluído").length;
  const recentes = [...orcamentos]
    .sort((a, b) => (paraData(b.criadoEm) || 0) - (paraData(a.criadoEm) || 0))
    .slice(0, 5);
  const totalSemana = semana.reduce((t, d) => t + d.servicos.length, 0);
  const primeiroNome = usuario?.displayName?.split(" ")[0] || "Técnico";

  const stPrev = preventivos.map(statusPreventivo);
  const prevAtrasados = stPrev.filter((s) => s.dias !== null && s.dias < 0).length;
  const prevSemana = stPrev.filter((s) => s.dias !== null && s.dias >= 0 && s.dias <= 7).length;
  const garVencendo = [...garantias, ...orcamentos.filter((o) => o.garantiaValidaAte).map((o) => ({ dataFim: o.garantiaValidaAte }))]
    .filter((g) => statusGarantia(g).rotulo === "Vencendo").length;
  const mesAtual = mesReferencia();
  const recebidoMes = lancamentos
    .filter((l) => l.tipo === "entrada" && dataDoLancamento(l) && mesReferencia(dataDoLancamento(l)) === mesAtual)
    .reduce((t, l) => t + Math.round((Number(l.valor) || 0) * 100), 0) / 100;
  const aReceber = resumoAReceber(cobrancas);
  const cobVencidas = cobrancas.filter((c) => statusCobranca(c).vencida).length;
  const lembretes = anotacoes.filter((n) => !n.concluida && n.lembreteEm && diasAte(n.lembreteEm) <= 0).length;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Cabeçalho com saudação e indicadores do mês */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rbs-navy via-rbs-dark to-blue-600 p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-sky-300/10" />
        <p className="text-sm text-blue-100">{hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
        <h1 className="text-2xl font-extrabold">{saudacao()}, {primeiroNome}! 👋</h1>
        <p className="text-sm text-blue-100">Você tem <b className="text-white">{totalSemana}</b> manutenção(ões) prevista(s) nesta semana.</p>
        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-blue-100">Orçamentos do mês</p>
            <p className="text-2xl font-extrabold">{doMes.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-blue-100">Aprovados</p>
            <p className="text-2xl font-extrabold">{aprovadosMes}</p>
          </div>
          {isAdmin && (
            <>
              <Link to="/financeiro" className="rounded-2xl bg-white/10 p-3 backdrop-blur transition hover:bg-white/20">
                <p className="flex items-center gap-1 text-xs text-blue-100">
                  <DollarSign size={13} /> Recebido no mês
                  <button aria-label={ocultarValor ? "Mostrar valores" : "Ocultar valores"} onClick={(e) => { e.preventDefault(); alternarValor(); }} className="ml-auto rounded-full bg-white/15 p-1">
                    {ocultarValor ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </p>
                <p className="text-2xl font-extrabold text-emerald-200">{ocultarValor ? "R$ •••••" : brl(recebidoMes)}</p>
                <p className="text-[11px] text-blue-100">Entradas lançadas no Financeiro</p>
              </Link>
              <Link to="/financeiro/cobrancas" className="rounded-2xl bg-white/10 p-3 backdrop-blur transition hover:bg-white/20">
                <p className="text-xs text-blue-100">A receber (PMOC)</p>
                <p className="text-2xl font-extrabold text-amber-200">{ocultarValor ? "R$ •••••" : brl(aReceber.aReceber)}</p>
                <p className="text-[11px] text-blue-100">{aReceber.qtdAbertas} cobrança(s){aReceber.qtdVencidas ? ` • ${aReceber.qtdVencidas} vencida(s)` : ""} • orçamentos {ocultarValor ? "•••" : brl(valorMes)}</p>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Pendências do dia */}
      <section>
        <h2 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-extrabold uppercase tracking-wide text-slate-500"><AlertTriangle size={15} /> Precisa de atenção</h2>
        <div className={`grid grid-cols-2 gap-2 ${isAdmin ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
          <Alerta to="/preventivo" icone={CalendarClock} valor={prevAtrasados} rotulo="Preventivos atrasados" tom="red" />
          <Alerta to="/preventivo" icone={CalendarDays} valor={prevSemana} rotulo="Preventivos em 7 dias" tom="blue" />
          <Alerta to="/garantias" icone={ShieldAlert} valor={garVencendo} rotulo="Garantias vencendo" tom="amber" />
          <Alerta to="/anotacoes" icone={Bell} valor={lembretes} rotulo="Lembretes para hoje" tom="violet" />
          {isAdmin && <Alerta to="/financeiro/cobrancas" icone={HandCoins} valor={cobVencidas} rotulo="Cobranças PMOC vencidas" tom="red" />}
        </div>
      </section>

      <NotificacoesBanner />

      {/* Ações rápidas */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { to: "/orcamentos/novo", icone: MENU[0].icon, rotulo: "Novo orçamento", cor: MENU[0].cor },
          { to: "/ordens-servico", icone: Wrench, rotulo: "Executar OS", cor: "from-orange-400 to-orange-700" },
          { to: "/laudos/novo", icone: FileText, rotulo: "Novo relatório", cor: "from-green-500 to-green-700" },
          { to: "/anotacoes", icone: StickyNote, rotulo: "Anotação", cor: "from-purple-500 to-violet-700" },
        ].map((a) => (
          <Link key={a.to} to={a.to} className={`flex items-center gap-2 rounded-2xl bg-gradient-to-br p-3 font-bold text-white shadow-sm transition hover:shadow-md hover:brightness-110 ${a.cor}`}>
            <a.icone size={20} className="shrink-0" /> <span className="truncate text-sm">{a.rotulo}</span>
          </Link>
        ))}
      </section>

      {/* Módulos em grade de ícones, estilo app */}
      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-extrabold text-rbs-navy">Funções</h2>
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-5 lg:grid-cols-7">
          {MODULOS.filter((m) => isAdmin || !m.admin).map((m) => (
            <Link key={m.to} to={m.to} className="group flex flex-col items-center gap-1.5 text-center">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition group-hover:-translate-y-0.5 group-hover:shadow-lg ${m.cor}`}>
                <m.icon size={26} />
              </span>
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-slate-700 sm:text-xs">{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <Selo icone={CalendarDays} cor="from-blue-500 to-blue-700" />
          <div className="flex-1">
            <h2 className="font-extrabold text-rbs-navy">Agenda Semanal <span className="text-blue-600">({totalSemana})</span></h2>
            <p className="text-sm text-slate-500">Equipamentos e preventivos desta semana</p>
          </div>
          <Link to="/cronograma" className="text-sm font-bold text-blue-700">Ver todos →</Link>
        </div>
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-7 lg:overflow-visible">
          {semana.map((dia, i) => {
            const ehHoje = dia.data.toDateString() === hoje.toDateString();
            return (
              <div key={DIAS[i]} className={`w-28 shrink-0 snap-start rounded-2xl border p-2 text-center lg:w-auto ${ehHoje ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-sm font-extrabold ${ehHoje ? "text-blue-700" : "text-rbs-navy"}`}>{DIAS[i]}</p>
                <p className="text-xs text-slate-500">{dia.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{dia.servicos.length} serviço{dia.servicos.length === 1 ? "" : "s"}</p>
                <div className="mt-2 space-y-0.5 border-t border-slate-200 pt-2 text-xs text-slate-500">
                  {dia.servicos.length === 0
                    ? <span className="inline-flex items-center gap-1 text-slate-400"><Calendar size={12} /> Livre</span>
                    : dia.servicos.slice(0, 3).map((s) => <p key={s.id} className={`truncate ${s.preventivo ? "font-semibold text-orange-700" : ""}`}>{s.nome}</p>)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <Selo icone={FileText} cor="from-blue-500 to-blue-700" />
          <div className="flex-1">
            <h2 className="font-extrabold text-rbs-navy">Orçamentos Recentes</h2>
            <p className="text-sm text-slate-500">Seus últimos orçamentos criados</p>
          </div>
          <Link to="/orcamentos" className="text-sm font-bold text-blue-700">Ver todos →</Link>
        </div>
        {recentes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Nenhum orçamento criado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {recentes.map((o) => (
              <LinhaOrcamento key={o.id} o={o} ocultarValor={ocultarValor} aoMudar={carregarOrcamentos} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
