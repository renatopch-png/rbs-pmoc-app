import { doc, getDoc, serverTimestamp, setDoc, writeBatch, deleteDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { paraData } from "./agenda";
import { mesReferencia } from "./financeiro";
import { brl } from "./orcamentos";
import { gerarPixCopiaECola } from "./pix";

// Cobrança mensal do contrato PMOC (Cadastro Preventivo com "cobrança mensal").
// Um documento por contrato e mês: `pmoc_<preventivoId>_<aaaa-mm>`. Ao receber,
// o mesmo id vira o lançamento de entrada no Financeiro (não duplica).
export const idCobranca = (preventivoId, mes) => `pmoc_${preventivoId}_${mes}`;

export const nomeMes = (mes) => {
  const [a, m] = mes.split("-").map(Number);
  const t = new Date(a, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export function somarMes(mes, n) {
  const [a, m] = mes.split("-").map(Number);
  return mesReferencia(new Date(a, m - 1 + n, 1));
}

// Vencimento no dia escolhido; em meses curtos usa o último dia.
export function vencimentoDoMes(mes, dia = 10) {
  const [a, m] = mes.split("-").map(Number);
  const ultimo = new Date(a, m, 0).getDate();
  const d = Math.min(Math.max(Number(dia) || 10, 1), ultimo);
  return `${mes}-${String(d).padStart(2, "0")}`;
}

export const contratosCobraveis = (preventivos) =>
  preventivos.filter((p) => p.cobrancaMensal && p.ativo !== false && Number(p.valor) > 0);

// Execuções do mês: OS dos equipamentos/cliente do contrato + visitas
// marcadas como "Realizado" no Cadastro Preventivo.
export function execucoesDoMes(contrato, ordens, mes) {
  const equip = new Set(contrato.equipamentoIds || []);
  const os = ordens.filter((o) => {
    const d = paraData(o.dataExecucao);
    if (!d || mesReferencia(d) !== mes) return false;
    return equip.size > 0 ? equip.has(o.equipamentoId) : (contrato.clienteId && o.clienteId === contrato.clienteId);
  });
  const visitas = (contrato.historico || []).filter((h) => (h.realizada || "").startsWith(mes));
  return { os: os.length, visitas: visitas.length, total: os.length + visitas.length };
}

export function statusCobranca(c, hoje = new Date()) {
  if (!c) return { rotulo: "Não gerada", cor: "bg-slate-100 text-slate-700" };
  if (c.status === "Pago") return { rotulo: "Paga", cor: "bg-emerald-100 text-emerald-800" };
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  if (c.vencimento < hojeStr) return { rotulo: "Vencida", cor: "bg-red-100 text-red-800", vencida: true };
  return { rotulo: "A receber", cor: "bg-amber-100 text-amber-800" };
}

export function dadosCobranca(contrato, mes, execucoes) {
  return {
    preventivoId: contrato.id,
    clienteId: contrato.clienteId || "",
    clienteNome: contrato.clienteNome || "",
    clienteTelefone: contrato.clienteTelefone || "",
    servico: contrato.servico || "Manutenção PMOC",
    descricao: `PMOC ${nomeMes(mes)} — ${contrato.clienteNome}`,
    mesReferencia: mes,
    valor: Number(contrato.valor) || 0,
    vencimento: vencimentoDoMes(mes, contrato.diaVencimento),
    execucoes: execucoes?.total ?? 0,
    status: "Pendente",
    criadoEm: serverTimestamp(),
    criadoPor: auth.currentUser?.uid || null,
  };
}

// Gera a cobrança do mês se ainda não existir (não sobrescreve paga/pendente).
export async function gerarCobranca(contrato, mes, execucoes) {
  const ref = doc(db, "cobrancas", idCobranca(contrato.id, mes));
  const atual = await getDoc(ref);
  if (atual.exists()) return false;
  await setDoc(ref, dadosCobranca(contrato, mes, execucoes));
  return true;
}

// Baixa: marca a cobrança como paga e cria a entrada no Financeiro, juntos.
export async function receberCobranca(c, formaPagamento = "Pix", dataPagamento = new Date()) {
  const lote = writeBatch(db);
  lote.update(doc(db, "cobrancas", c.id), { status: "Pago", formaPagamento, pagoEm: dataPagamento, lancamentoId: c.id });
  lote.set(doc(db, "lancamentos", c.id), {
    tipo: "entrada", descricao: c.descricao, categoria: "Manutenção", valor: c.valor, data: dataPagamento,
    formaPagamento, cobrancaId: c.id, preventivoId: c.preventivoId, mesReferencia: c.mesReferencia,
    criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(), criadoPor: auth.currentUser?.uid || null,
  });
  await lote.commit();
}

export async function estornarCobranca(c) {
  const lote = writeBatch(db);
  lote.update(doc(db, "cobrancas", c.id), { status: "Pendente", formaPagamento: null, pagoEm: null, lancamentoId: null });
  lote.delete(doc(db, "lancamentos", c.id));
  await lote.commit();
}

export const excluirCobranca = (c) => deleteDoc(doc(db, "cobrancas", c.id));

// Identificador da cobrança no Pix (aparece no extrato do recebedor).
export const txidCobranca = (c) => `PMOC${(c.mesReferencia || "").replace("-", "")}${(c.preventivoId || "").slice(0, 8)}`;

export function pixDaCobranca(c, pix) {
  return pix?.chave ? gerarPixCopiaECola({ ...pix, valor: c.valor, txid: txidCobranca(c) }) : "";
}

export function mensagemCobranca(c, pix) {
  const [a, m, d] = c.vencimento.split("-");
  const copiaECola = pixDaCobranca(c, pix);
  return `Olá! Segue o demonstrativo do contrato de manutenção PMOC referente a ${nomeMes(c.mesReferencia)}:\n`
    + `• Serviço: ${c.servico}\n• Valor: ${brl(c.valor)}\n• Vencimento: ${d}/${m}/${a}\n\n`
    + (pix?.chave
      ? `Pagamento via Pix\n• Chave (${pix.tipoChave}): ${pix.chave}\n• Favorecido: ${pix.favorecido}${pix.banco ? ` — ${pix.banco}` : ""}\n\nPix copia e cola (já com o valor):\n${copiaECola}\n\n`
      : "Pagamento via Pix ou transferência.\n\n")
    + "Após o pagamento, por favor envie o comprovante. — RBS Refrigeração e Elétrica";
}
