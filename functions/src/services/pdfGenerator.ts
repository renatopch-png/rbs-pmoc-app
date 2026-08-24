import PDFDocument from "pdfkit";
import { Response } from "express";

interface DadosRelatorio {
  cliente: any;
  edificio: any;
  equipamentos: any[];
  ordensServico: any[];
  art?: { numero: string; responsavelTecnico: string };
}

export function gerarRelatorioPMOC(dados: DadosRelatorio, res: Response) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=relatorio-pmoc.pdf");
  doc.pipe(res);

  // Cabeçalho institucional (padrão RBS - faixa azul)
  doc.rect(0, 0, doc.page.width, 70).fill("#EFF6FF");
  doc.fillColor("#0B5394").fontSize(16).text("RBS REFRIGERAÇÃO E ELÉTRICA", 50, 20);
  doc
    .fillColor("#1E40AF")
    .fontSize(9)
    .text("Refrigeração Elétrica • Energia Solar • Engenharia Térmica", 50, 40);
  doc
    .fillColor("#1E40AF")
    .fontSize(8)
    .text("CNPJ 33.632.222/0001-86 — Rua Capitão Ferreira, nº 86 — Rio de Janeiro/RJ", 50, 53);

  doc.moveDown(4);
  doc.fillColor("#0B5394").fontSize(18).text("Relatório de PMOC", { align: "center" });
  doc.moveDown();

  doc.fillColor("black").fontSize(11);
  doc.text(`Cliente: ${dados.cliente.razaoSocial}`);
  doc.text(`CNPJ: ${dados.cliente.cnpj}`);
  doc.text(`Edifício: ${dados.edificio.nome}`);
  if (dados.art) {
    doc.text(`ART nº: ${dados.art.numero} — Resp. Técnico: ${dados.art.responsavelTecnico}`);
  }
  doc.moveDown();

  doc.fillColor("#0B5394").fontSize(14).text("Equipamentos", { underline: true });
  doc.fillColor("black").fontSize(10);
  dados.equipamentos.forEach((eq) => {
    doc.text(
      `• ${eq.tipo} | ${eq.marca}/${eq.modelo} | ${eq.capacidade.valor} ${eq.capacidade.unidade} | Local: ${eq.localizacao}`
    );
  });
  doc.moveDown();

  doc.fillColor("#0B5394").fontSize(14).text("Histórico de Manutenções", { underline: true });
  doc.fillColor("black").fontSize(10);
  dados.ordensServico.forEach((os) => {
    const data = os.dataExecucao?.toDate ? os.dataExecucao.toDate() : new Date(os.dataExecucao);
    doc.text(
      `${data.toLocaleDateString("pt-BR")} — ${os.status} — ${os.observacoes || "sem observações"}`
    );
  });

  doc.end();
}
