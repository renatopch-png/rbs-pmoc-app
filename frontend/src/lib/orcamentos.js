import { doc, runTransaction } from "firebase/firestore";
import { db } from "../services/firebase";

export const STATUS = ["Rascunho", "Enviado", "Aprovado", "Reprovado", "Concluído"];
export const TIPOS_ITEM = ["Mão de Obra", "Material"];
export const CORES_STATUS = {
  Rascunho: "bg-slate-100 text-slate-700",
  Enviado: "bg-blue-100 text-blue-800",
  Aprovado: "bg-emerald-100 text-emerald-800",
  Reprovado: "bg-red-100 text-red-800",
  "Concluído": "bg-green-100 text-green-800",
};
export const CONDICAO_ETAPAS =
  "O serviço pode ser executado por etapas, conforme disponibilidade do cliente, sem prejuízo à qualidade ou à garantia de cada etapa concluída.";

export const brl = (v) => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const numeroFmt = (n) => String(n || 0).padStart(3, "0");
const centavos = (v) => Math.round((Number(v) || 0) * 100);

export function totalItem(item) {
  return Math.round(centavos(item.valorUnit) * (Number(item.qtd) || 0)) / 100;
}

export function calcularTotais(itens, desconto = 0, frete = 0) {
  const soma = (tipo) =>
    itens.filter((i) => i.tipo === tipo).reduce((t, i) => t + centavos(totalItem(i)), 0) / 100;
  const subtotalMaoObra = soma("Mão de Obra");
  const subtotalMateriais = soma("Material");
  const valorTotal = (centavos(subtotalMaoObra) + centavos(subtotalMateriais) + centavos(frete) - centavos(desconto)) / 100;
  return { subtotalMaoObra, subtotalMateriais, valorTotal };
}

// Número único mesmo com dois aparelhos salvando ao mesmo tempo.
export function proximoNumero() {
  const ref = doc(db, "contadores", "orcamentos");
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const numero = (snap.exists() ? snap.data().ultimo || 0 : 0) + 1;
    tx.set(ref, { ultimo: numero });
    return numero;
  });
}
