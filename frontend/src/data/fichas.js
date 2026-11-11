// Séries de fichas visuais ("Meu Estudo"). Cada ficha tem o próprio PDF (uma página A4)
// e cada série tem um PDF completo com capa. Os PDFs ficam em public/estudos/fichas/<série>/.
import * as Instrumentacao from "./fichasInstrumentacao";
import * as Refrigeracao from "./fichasRefrigeracao";
import { TEMAS_INSTRUMENTACAO, TEMAS_REFRIGERACAO } from "./estudos";

const pad = (n) => String(n).padStart(2, "0");

function serie(id, nome, curto, cor, origem, simulado = null) {
  return {
    id, nome, curto, cor, simulado,
    modulos: origem.MODULOS,
    pdf: `/estudos/fichas/${id}/${id}-completo.pdf`,
    fichas: origem.FICHAS.map((f) => ({ ...f, pdf: `/estudos/fichas/${id}/${pad(f.num)}-${f.id}.pdf` })),
  };
}

export const SERIES = [
  serie("instrumentacao", "Instrumentação Industrial", "Instrumentação", "from-blue-600 to-rbs-navy", Instrumentacao,
    { id: "instrumentacao", titulo: "Instrumentação Industrial", topicos: TEMAS_INSTRUMENTACAO }),
  serie("refrigeracao", "Automação de Refrigeração", "Refrigeração", "from-cyan-500 to-teal-700", Refrigeracao,
    { id: "refrigeracao", titulo: "Automação de Refrigeração", topicos: TEMAS_REFRIGERACAO }),
];

export const TOTAL_FICHAS = SERIES.reduce((s, x) => s + x.fichas.length, 0);
