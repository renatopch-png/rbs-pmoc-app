import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

const ESSENCIAIS = ["clientes", "equipamentos", "ordens_servico"];
const OPCIONAIS = ["plano_atividades", "orcamentos", "tabela_precos", "contadores", "historico_publico", "lancamentos", "contas_fixas", "funcionarios", "servicos_equipe", "convites", "usuarios_autorizados"];

function serializar(v) {
  if (v?.toDate) return { __data: v.toDate().toISOString() };
  if (Array.isArray(v)) return v.map(serializar);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, serializar(x)]));
  return v;
}

async function ler(nome) {
  const snap = await getDocs(collection(db, nome));
  return snap.docs.map((d) => ({ id: d.id, ...serializar(d.data()) }));
}

// Só leitura. Falha em uma coleção essencial interrompe o backup, para nunca
// entregar um arquivo incompleto como se estivesse completo.
export async function gerarBackup() {
  const colecoes = {};
  for (const nome of ESSENCIAIS) colecoes[nome] = await ler(nome);
  for (const nome of OPCIONAIS) {
    try { colecoes[nome] = await ler(nome); } catch (e) { console.warn(`Backup sem ${nome}:`, e.message); }
  }
  return { sistema: "RBS PMOC", geradoEm: new Date().toISOString(), colecoes };
}

export function baixarArquivo(backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `backup-rbs-pmoc-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
