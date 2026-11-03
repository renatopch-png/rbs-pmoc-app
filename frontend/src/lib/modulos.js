import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { paraData } from "./agenda";

// Mesmos intervalos usados nos equipamentos (agenda.js / Agendador).
export const PERIODICIDADES = { Semanal: 7, Quinzenal: 15, Mensal: 30, Bimestral: 60, Trimestral: 90, Semestral: 180, Anual: 365 };

const DIA = 24 * 60 * 60 * 1000;

export function hojeZero() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// "2026-11-03" -> Date local (evita o deslocamento de fuso do new Date("aaaa-mm-dd")).
export function dataLocal(v) {
  if (!v) return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [a, m, d] = v.split("-").map(Number);
    return new Date(a, m - 1, d);
  }
  return paraData(v);
}

export function paraInput(d) {
  if (!d) return "";
  const x = dataLocal(d);
  if (!x) return "";
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

export const dataBR = (v) => dataLocal(v)?.toLocaleDateString("pt-BR") || "—";

export function diasAte(v) {
  const d = dataLocal(v);
  if (!d) return null;
  const alvo = new Date(d);
  alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo - hojeZero()) / DIA);
}

export function somarMeses(v, meses) {
  const d = dataLocal(v);
  if (!d) return null;
  const r = new Date(d);
  r.setMonth(r.getMonth() + Number(meses || 0));
  return r;
}

export function somarPeriodo(v, periodicidade) {
  const d = dataLocal(v) || hojeZero();
  const r = new Date(d);
  if (periodicidade === "Mensal") r.setMonth(r.getMonth() + 1);
  else if (periodicidade === "Bimestral") r.setMonth(r.getMonth() + 2);
  else if (periodicidade === "Trimestral") r.setMonth(r.getMonth() + 3);
  else if (periodicidade === "Semestral") r.setMonth(r.getMonth() + 6);
  else if (periodicidade === "Anual") r.setFullYear(r.getFullYear() + 1);
  else r.setDate(r.getDate() + (PERIODICIDADES[periodicidade] || 30));
  return r;
}

// ---- Garantias ----
export function fimGarantia(g) {
  return g.dataFim ? dataLocal(g.dataFim) : somarMeses(g.dataInicio, g.prazoMeses);
}

export function statusGarantia(g) {
  const dias = diasAte(fimGarantia(g));
  if (dias === null) return { rotulo: "Sem data", cor: "bg-slate-100 text-slate-700", dias };
  if (dias < 0) return { rotulo: "Vencida", cor: "bg-red-100 text-red-800", dias };
  if (dias <= 30) return { rotulo: "Vencendo", cor: "bg-amber-100 text-amber-800", dias };
  return { rotulo: "Ativa", cor: "bg-emerald-100 text-emerald-800", dias };
}

// ---- Preventivos ----
export function statusPreventivo(p) {
  if (p.ativo === false) return { rotulo: "Pausado", cor: "bg-slate-100 text-slate-700", dias: null };
  const dias = diasAte(p.proximaData);
  if (dias === null) return { rotulo: "Sem data", cor: "bg-slate-100 text-slate-700", dias };
  if (dias < 0) return { rotulo: `Atrasado ${-dias}d`, cor: "bg-red-100 text-red-800", dias };
  if (dias === 0) return { rotulo: "Hoje", cor: "bg-orange-100 text-orange-800", dias };
  if (dias <= 7) return { rotulo: `Em ${dias}d`, cor: "bg-amber-100 text-amber-800", dias };
  return { rotulo: `Em ${dias}d`, cor: "bg-emerald-100 text-emerald-800", dias };
}

// Leitura tolerante: coleção nova sem regras publicadas não derruba a tela.
export async function lerColecao(nome) {
  try {
    const snap = await getDocs(collection(db, nome));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn(`Coleção ${nome} indisponível:`, e.message);
    return [];
  }
}

export function linkWhatsApp(telefone, texto) {
  const destino = (telefone || "").replace(/\D/g, "");
  const numero = destino && !destino.startsWith("55") ? `55${destino}` : destino;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

// Ao executar uma OS, avança a próxima visita dos preventivos que incluem o
// equipamento e estão vencidos ou previstos para os próximos 7 dias.
// Depois de avançar, a nova data fica fora da janela, então as demais OS do
// mesmo contrato no mesmo ciclo não empurram a data de novo.
export async function avancarPreventivosDoEquipamento(equipamentoId, hoje = new Date()) {
  if (!equipamentoId) return 0;
  const snap = await getDocs(query(collection(db, "preventivos"), where("equipamentoIds", "array-contains", equipamentoId)));
  const hojeStr = paraInput(hoje);
  let n = 0;
  for (const d of snap.docs) {
    const p = d.data();
    const dias = diasAte(p.proximaData);
    if (p.ativo === false || dias === null || dias > 7) continue;
    const historico = [...(p.historico || []), { prevista: p.proximaData, realizada: hojeStr, origem: "OS" }].slice(-24);
    await updateDoc(doc(db, "preventivos", d.id), {
      proximaData: paraInput(somarPeriodo(p.proximaData, p.periodicidade)), ultimaExecucao: hojeStr, historico,
    });
    n += 1;
  }
  return n;
}
