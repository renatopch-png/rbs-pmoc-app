import html2pdf from "html2pdf.js";
import { DADOS_RBS } from "../services/ServicoWhatsApp";

export const EMPRESA = "RBS REFRIGERAÇÃO E ELÉTRICA";
export const LINHA_RBS = "Refrigeração Elétrica • Energia Solar • Engenharia Térmica";
export const ENDERECO_RBS = "Rua Capitão Ferreira, nº 86 — Rio de Janeiro/RJ";
const RODAPE = `RBS Refrigeração e Elétrica | CNPJ ${DADOS_RBS.cnpj}`;

// Cabeçalho e rodapé são desenhados em todas as páginas do PDF.
export function gerarPdfRbs(elemento, filename) {
  return html2pdf()
    .set({
      margin: [34, 14, 16, 14],
      filename,
      image: { type: "jpeg", quality: 0.96 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".evitar"] },
    })
    .from(elemento)
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      const total = pdf.internal.getNumberOfPages();
      const largura = pdf.internal.pageSize.getWidth();
      const altura = pdf.internal.pageSize.getHeight();
      for (let p = 1; p <= total; p += 1) {
        pdf.setPage(p);
        pdf.setFillColor(239, 246, 255).rect(0, 0, largura, 28, "F");
        pdf.setFillColor(11, 83, 148).rect(0, 28, largura, 0.8, "F");
        pdf.setFont("helvetica", "bold").setFontSize(14).setTextColor(11, 83, 148).text(EMPRESA, 14, 11);
        pdf.setFont("helvetica", "normal").setFontSize(9).setTextColor(60, 70, 85).text(LINHA_RBS, 14, 17);
        pdf.text(`CNPJ ${DADOS_RBS.cnpj} • ${ENDERECO_RBS}`, 14, 22);
        pdf.setFontSize(8).setTextColor(100).text(`${RODAPE} | Página ${p} de ${total}`, largura / 2, altura - 7, { align: "center" });
      }
    })
    .save();
}
