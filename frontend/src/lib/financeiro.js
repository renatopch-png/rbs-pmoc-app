export const CATEGORIAS = {
  entrada: ["Serviços", "Manutenção", "Instalação", "Venda de peças", "Outros"],
  saida: ["Materiais", "Combustível", "Ferramentas", "Salários", "Impostos", "Aluguel", "Internet e telefone", "Outros"],
};
export const FORMAS_PAGAMENTO = ["Pix", "Dinheiro", "Cartão", "Boleto", "Transferência"];
export const PERIODOS = [["hoje", "Hoje"], ["semana", "Esta Semana"], ["mes", "Este Mês"], ["todos", "Todos"]];
export const RESULTADO_ROTULO = { hoje: "Resultado de Hoje", semana: "Resultado da Semana", mes: "Resultado do Mês", todos: "Resultado Geral" };

const inicioDia = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const paraCentavos = (v) => Math.round((Number(v) || 0) * 100);

export function dataDoLancamento(l) {
  const v = l.data;
  const d = v?.toDate ? v.toDate() : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function inicioSemana(ref = new Date()) {
  const d = inicioDia(ref);
  return somaDias(d, -((d.getDay() + 6) % 7));
}

// Intervalo [inicio, fim) do período; `null` em "todos".
export function intervalo(periodo, hoje = new Date()) {
  if (periodo === "hoje") { const i = inicioDia(hoje); return [i, somaDias(i, 1)]; }
  if (periodo === "semana") { const i = inicioSemana(hoje); return [i, somaDias(i, 7)]; }
  if (periodo === "mes") return [new Date(hoje.getFullYear(), hoje.getMonth(), 1), new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)];
  return null;
}

export function filtrar(lancamentos, faixa) {
  if (!faixa) return lancamentos;
  return lancamentos.filter((l) => { const d = dataDoLancamento(l); return d && d >= faixa[0] && d < faixa[1]; });
}

export function resumir(lancamentos) {
  let entradas = 0; let saidas = 0; let qtdEntradas = 0; let qtdSaidas = 0;
  lancamentos.forEach((l) => {
    if (l.tipo === "entrada") { entradas += paraCentavos(l.valor); qtdEntradas += 1; } else { saidas += paraCentavos(l.valor); qtdSaidas += 1; }
  });
  return { receitas: entradas / 100, despesas: saidas / 100, resultado: (entradas - saidas) / 100, qtdEntradas, qtdSaidas };
}

export function dadosSemana(lancamentos, inicio) {
  return Array.from({ length: 7 }, (_, i) => {
    const data = somaDias(inicio, i);
    return { data, ...resumir(filtrar(lancamentos, [data, somaDias(data, 1)])) };
  });
}

export const mesReferencia = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const idPagamentoFixa = (contaId, mes) => `fixa_${contaId}_${mes}`;
export const paraInputData = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// Meio-dia local: evita a data "voltar um dia" ao converter fuso horário.
export const deInputData = (s) => new Date(`${s}T12:00:00`);

export function gerarCsv(lancamentos) {
  const campo = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = lancamentos.map((l) => [
    dataDoLancamento(l)?.toLocaleDateString("pt-BR"), l.tipo === "entrada" ? "Entrada" : "Saída", l.descricao, l.categoria,
    l.formaPagamento, (Number(l.valor) || 0).toFixed(2).replace(".", ","),
  ].map(campo).join(";"));
  return `﻿${["Data;Tipo;Descrição;Categoria;Pagamento;Valor", ...linhas].join("\r\n")}`;
}
