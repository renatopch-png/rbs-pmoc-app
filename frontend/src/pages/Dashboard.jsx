import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { Calendar, CalendarDays, CircleCheck, DollarSign, Eye, EyeOff, FileText, Snowflake } from "lucide-react";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { NotificacoesBanner } from "../components/layout/NotificacoesManuencao";
import { MENU, CONFIGURACOES } from "../data/menu";
import { agendaSemanal, paraData } from "../lib/agenda";

const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const CHAVE_VALOR = "rbs.ocultarValor";
const brl = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const ATALHOS = [...MENU.filter((m) => m.to !== "/orcamentos/novo"), CONFIGURACOES];

function lerPreferencia() {
  try { return localStorage.getItem(CHAVE_VALOR) === "1"; } catch { return false; }
}

function Selo({ icone: Icone, cor }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ${cor}`}>
      <Icone size={20} />
    </span>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const [orcamentos, setOrcamentos] = useState([]);
  const [semana, setSemana] = useState(() => agendaSemanal([], []));
  const [ocultarValor, setOcultarValor] = useState(lerPreferencia);

  useEffect(() => {
    (async () => {
      try {
        const [equip, os] = await Promise.all([
          getDocs(collection(db, "equipamentos")),
          getDocs(collection(db, "ordens_servico")),
        ]);
        setSemana(agendaSemanal(
          equip.docs.map((d) => ({ id: d.id, ...d.data() })),
          os.docs.map((d) => ({ id: d.id, ...d.data() })),
        ));
      } catch (e) {
        console.error("Erro ao carregar a agenda:", e);
      }
      try {
        const snap = await getDocs(collection(db, "orcamentos"));
        setOrcamentos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // Coleção nova: fica vazia até as regras do módulo serem publicadas.
        console.warn("Orçamentos indisponíveis:", e.message);
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
  const valorMes = doMes.reduce((total, o) => total + (Number(o.valorTotal) || 0), 0);
  const recentes = [...orcamentos]
    .sort((a, b) => (paraData(b.criadoEm) || 0) - (paraData(a.criadoEm) || 0))
    .slice(0, 5);
  const totalSemana = semana.reduce((t, d) => t + d.servicos.length, 0);
  const primeiroNome = usuario?.displayName?.split(" ")[0] || "Técnico";

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-sky-100 to-blue-50 px-5 py-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rbs-navy text-sky-300 shadow">
          <Snowflake size={28} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-rbs-navy">Olá, {primeiroNome}!</h1>
          <p className="text-sm text-slate-600">Boa rotina de trabalho!</p>
        </div>
      </header>

      <NotificacoesBanner />

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Selo icone={FileText} cor="from-sky-500 to-blue-700" />
            <h2 className="font-bold text-rbs-navy">Orçamentos do Mês</h2>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-rbs-navy">{doMes.length}</p>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Selo icone={DollarSign} cor="from-emerald-500 to-green-700" />
            <h2 className="flex-1 font-bold text-rbs-navy">Valor do Mês</h2>
            <button aria-label={ocultarValor ? "Mostrar valor" : "Ocultar valor"} onClick={alternarValor} className="rounded-full bg-slate-100 p-2 text-slate-600">
              {ocultarValor ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-green-700">{ocultarValor ? "R$ •••••" : brl(valorMes)}</p>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/orcamentos/novo" className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
          <Selo icone={MENU[0].icon} cor={MENU[0].cor} />
          <span><span className="block font-bold text-rbs-navy">Criar Orçamento ou OS</span><span className="text-sm text-slate-500">{MENU[0].desc}</span></span>
          <span className="ml-auto rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">Em breve</span>
        </Link>
        {ATALHOS.map((m) => (
          <Link key={m.to} to={m.to} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
            <Selo icone={m.icon} cor={m.cor} />
            <span className="min-w-0"><span className="block truncate font-bold text-rbs-navy">{m.label}</span><span className="block truncate text-sm text-slate-500">{m.desc}</span></span>
            {m.novo && <span className="ml-auto rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">Em breve</span>}
          </Link>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <Selo icone={CalendarDays} cor="from-blue-500 to-blue-700" />
          <div className="flex-1">
            <h2 className="font-extrabold text-rbs-navy">Agenda Semanal <span className="text-blue-600">({totalSemana})</span></h2>
            <p className="text-sm text-slate-500">Manutenções previstas nesta semana</p>
          </div>
          <Link to="/cronograma" className="text-sm font-bold text-blue-700">Ver todos →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {semana.map((dia, i) => {
            const ehHoje = dia.data.toDateString() === hoje.toDateString();
            return (
              <div key={DIAS[i]} className={`rounded-xl border p-2 text-center ${ehHoje ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-sm font-extrabold ${ehHoje ? "text-blue-700" : "text-rbs-navy"}`}>{DIAS[i]}</p>
                <p className="text-xs text-slate-500">{dia.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{dia.servicos.length} serviço{dia.servicos.length === 1 ? "" : "s"}</p>
                <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500">
                  {dia.servicos.length === 0
                    ? <span className="inline-flex items-center gap-1 text-slate-400"><Calendar size={12} /> Livre</span>
                    : dia.servicos.slice(0, 2).map((s) => <p key={s.id} className="truncate">{s.nome}</p>)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
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
              <li key={o.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <FileText size={20} className="shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-bold text-rbs-navy">
                    #{String(o.numero || 0).padStart(3, "0")}
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800"><CircleCheck size={12} />{o.status || "Concluído"}</span>
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-700">{o.clienteNome}</p>
                  <p className="text-xs text-slate-500">{o.qtdServicos || 1} serviço(s) • {paraData(o.criadoEm)?.toLocaleDateString("pt-BR")}</p>
                </div>
                <p className="font-extrabold text-green-700">{ocultarValor ? "•••••" : brl(o.valorTotal)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
