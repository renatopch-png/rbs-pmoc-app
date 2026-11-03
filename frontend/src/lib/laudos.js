import { doc, runTransaction } from "firebase/firestore";
import { db } from "../services/firebase";

export const TIPOS_LAUDO = [
  "Laudo Técnico",
  "Relatório de Visita Técnica",
  "Relatório de Manutenção Corretiva",
  "Parecer Técnico",
  "Laudo de Vistoria / Inspeção",
  "Relatório de Comissionamento (Startup)",
  "Relatório de Sistema Fotovoltaico",
];

export const STATUS_LAUDO = ["Rascunho", "Finalizado", "Enviado"];
export const CORES_LAUDO = {
  Rascunho: "bg-slate-100 text-slate-700",
  Finalizado: "bg-emerald-100 text-emerald-800",
  Enviado: "bg-blue-100 text-blue-800",
};

// Modelos de medição para preencher a tabela com um toque.
export const MODELOS_MEDICAO = {
  "Climatização (Split / Self)": [
    { parametro: "Tensão de alimentação", unidade: "V", referencia: "220 ± 10%" },
    { parametro: "Corrente do compressor", unidade: "A", referencia: "≤ RLA placa" },
    { parametro: "Pressão de sucção", unidade: "psig", referencia: "" },
    { parametro: "Pressão de descarga", unidade: "psig", referencia: "" },
    { parametro: "Temperatura de insuflamento", unidade: "°C", referencia: "" },
    { parametro: "Temperatura de retorno", unidade: "°C", referencia: "" },
    { parametro: "ΔT (retorno − insuflamento)", unidade: "K", referencia: "8 a 12" },
    { parametro: "Superaquecimento", unidade: "K", referencia: "5 a 7" },
    { parametro: "Sub-resfriamento", unidade: "K", referencia: "4 a 7" },
  ],
  "Refrigeração comercial": [
    { parametro: "Temperatura da câmara", unidade: "°C", referencia: "" },
    { parametro: "Pressão de sucção", unidade: "psig", referencia: "" },
    { parametro: "Pressão de descarga", unidade: "psig", referencia: "" },
    { parametro: "Corrente do compressor", unidade: "A", referencia: "≤ RLA placa" },
    { parametro: "Superaquecimento", unidade: "K", referencia: "" },
  ],
  "Elétrica / Quadro de comando": [
    { parametro: "Tensão F-F", unidade: "V", referencia: "" },
    { parametro: "Tensão F-N", unidade: "V", referencia: "" },
    { parametro: "Corrente por fase (L1/L2/L3)", unidade: "A", referencia: "" },
    { parametro: "Resistência de aterramento", unidade: "Ω", referencia: "≤ 10 (recomendado)" },
    { parametro: "Resistência de isolamento", unidade: "MΩ", referencia: "≥ 1 (NBR 5410)" },
    { parametro: "Temperatura de conexões (termografia)", unidade: "°C", referencia: "" },
  ],
  "Fotovoltaico (NBR 16274)": [
    { parametro: "Voc da string", unidade: "V", referencia: "Conforme projeto" },
    { parametro: "Isc da string", unidade: "A", referencia: "Conforme projeto" },
    { parametro: "Resistência de isolamento (+/− para terra)", unidade: "MΩ", referencia: "≥ 1" },
    { parametro: "Continuidade do aterramento", unidade: "Ω", referencia: "" },
    { parametro: "Potência AC do inversor", unidade: "kW", referencia: "" },
    { parametro: "Geração do mês", unidade: "kWh", referencia: "Estimativa do projeto" },
  ],
};

export function proximoNumeroLaudo() {
  const ref = doc(db, "contadores", "laudos");
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const numero = (snap.exists() ? snap.data().ultimo || 0 : 0) + 1;
    tx.set(ref, { ultimo: numero });
    return numero;
  });
}
