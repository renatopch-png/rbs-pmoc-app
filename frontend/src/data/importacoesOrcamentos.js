// Orçamentos feitos fora do app (propostas em PDF) e lançados aqui já aprovados.
// Cada importação tem um id fixo: o orçamento é gravado com esse id, então
// importar de novo (ou em outro aparelho) nunca duplica.

const M = (descricao, unidade, qtd, valorUnit) => ({
  descricao, tipo: "Material", qtd, unidade, valorUnit, equipamentoId: "", equipamentoNome: "",
});

export const IMPORTACOES_ORCAMENTOS = [
  {
    id: "import-roberta-aumento-carga-2026-11-24",
    cliente: { nome: "Roberta", endereco: "Rua Capitão Ferreira — Rio de Janeiro/RJ", edificio: "", contato: "Roberta", telefone: "" },
    orcamento: {
      status: "Aprovado",
      objeto: "Aumento de carga monofásico 127 V (Light) — adequação do padrão de entrada, novo alimentador até o QDL, QDL com disjuntores, circuito do chuveiro e tomadas da cozinha, com cabos aparentes fixados na madeira do telhado.",
      escopo: "Aumento de carga monofásico 127 V (Light), com fornecimento de materiais e mão de obra, conforme planta anexa.",
      descricaoDetalhada: [
        "2.1 Padrão de entrada: disjuntor geral 63 A, cabo 16 mm² até o poste (10 m) e ligação ao aterramento existente.",
        "2.2 Alimentador poste → QDL: cabo 16 mm² (fase e neutro), 30 m, aparente e fixado na madeira do telhado.",
        "2.3 QDL: QDL de sobrepor 6 a 8 posições, com os disjuntores dos novos circuitos e remanejamento dos existentes.",
        "2.4 Circuitos: chuveiro 127 V / 5.500 W em cabinho 10 mm² + disjuntor 50 A; cozinha em cabinho 6 mm² + disjuntor 20 A + 3 tomadas 20 A; testes finais e medição de tensão.",
      ].join("\n"),
      itens: [
        M("Cabo flexível 16 mm² — fase + neutro (T2: poste → QDL)", "m", 35, 11.5),
        M("Cabo flexível 16 mm² (T1: padrão → poste)", "m", 15, 19.9),
        M("Cabinho flexível 750 V 10 mm² (chuveiro)", "m", 20, 13),
        M("Cabinho flexível 750 V 6 mm² — preto, azul e verde (cozinha, 3 × 5 m)", "m", 15, 7.5),
        M("Conector de derivação 16 mm²", "pç", 6, 9.9),
        M("Disjuntor geral 1P 63 A (padrão de entrada)", "pç", 1, 55),
        M("Disjuntor DIN 1P 50 A (chuveiro)", "pç", 1, 32),
        M("Disjuntor DIN 1P 20 A (cozinha)", "pç", 1, 18),
        M("QDL de sobrepor 6 a 8 posições (DIN) c/ barramentos de neutro e terra", "pç", 1, 75),
        M("Tomadas 2P+T 20 A c/ caixa de sobrepor (cozinha)", "pç", 3, 35),
        M("Chuveiro elétrico Lorenzetti Advanced Multitemperatura 127 V / 5.500 W (ou similar)", "pç", 1, 189.9),
        {
          descricao: "Mão de obra completa (global): adequação do padrão de entrada e lançamento T1; lançamento T2 fixado na estrutura de madeira do telhado; montagem do QDL e remanejamento dos circuitos existentes; circuitos do chuveiro e da cozinha; instalação do chuveiro e das 3 tomadas; testes finais; pedido de aumento de carga na Light e emissão de TRT",
          tipo: "Mão de Obra", qtd: 1, unidade: "vb", valorUnit: 1000, equipamentoId: "", equipamentoNome: "",
        },
      ],
      frete: 0,
      desconto: 0,
      validadeDias: 15,
      prazoExecucao: "2 a 3 dias úteis após a aprovação e a chegada dos materiais",
      condicoesPagamento: "50% na aprovação (compra de materiais) e 50% na conclusão — PIX, transferência ou cartão (acréscimo da operadora)",
      garantia: "90 dias para a mão de obra; materiais conforme garantia do fabricante.",
      naoInclusos: "DR e DPS (excluídos por opção do cliente), taxas e serviços da concessionária, obras de alvenaria/forro/telhado, troca do poste particular, pintura e eletrodomésticos.",
      observacoes: "Por opção do cliente: circuitos em cabinho 750 V aparente e proteção somente por disjuntores, sem DR e sem DPS (NBR 5410 exige eletroduto para cabinho 750 V e DR 30 mA em banheiro e cozinha). Alimentador em 16 mm²: queda de tensão estimada no chuveiro 5,7% em plena carga. Emissão de TRT (CFT/CRT-RJ). Proposta original: Drive › RBS Engenharia › Clientes e Projetos › AUMENTO DE CARGA ROBERTA.",
      requerArt: false,
      malhaAterramento: false,
      complexidadeAlvenaria: "",
      distanciaCabeamento: "40 m (padrão → poste → QDL)",
    },
  },
];
