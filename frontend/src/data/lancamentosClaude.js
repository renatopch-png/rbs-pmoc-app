// Lançamentos que o Claude deixa prontos: entram sozinhos no banco quando o
// administrador abre o app (mesmo formato do lançamento por link /importar).
// O id de cada um impede lançar duas vezes.
export const LANCAMENTOS_CLAUDE = [
  {
    "id": "roberta-aumento-carga-2026-11-24",
    "cliente": {
      "nome": "Roberta",
      "endereco": "Rua Capitão Ferreira — Rio de Janeiro/RJ",
      "contato": "Roberta"
    },
    "orcamento": {
      "status": "Aprovado",
      "objeto": "Aumento de carga monofásico 127 V (Light) — adequação do padrão de entrada, novo alimentador até o QDL, QDL com disjuntores, circuito do chuveiro e tomadas da cozinha, com cabos aparentes fixados na madeira do telhado.",
      "escopo": "Aumento de carga monofásico 127 V (Light), com fornecimento de materiais e mão de obra, conforme planta anexa.",
      "descricaoDetalhada": "2.1 Padrão de entrada: disjuntor geral 63 A, cabo 16 mm² até o poste (10 m) e ligação ao aterramento existente.\n2.2 Alimentador poste → QDL: cabo 16 mm² (fase e neutro), 30 m, aparente e fixado na madeira do telhado.\n2.3 QDL: QDL de sobrepor 6 a 8 posições, com os disjuntores dos novos circuitos e remanejamento dos existentes.\n2.4 Circuitos: chuveiro 127 V / 5.500 W em cabinho 10 mm² + disjuntor 50 A; cozinha em cabinho 6 mm² + disjuntor 20 A + 3 tomadas 20 A; testes finais e medição de tensão.",
      "itens": [
        {
          "descricao": "Cabo flexível 16 mm² — fase + neutro (T2: poste → QDL)",
          "tipo": "Material",
          "qtd": 35,
          "unidade": "m",
          "valorUnit": 11.5
        },
        {
          "descricao": "Cabo flexível 16 mm² (T1: padrão → poste)",
          "tipo": "Material",
          "qtd": 15,
          "unidade": "m",
          "valorUnit": 19.9
        },
        {
          "descricao": "Cabinho flexível 750 V 10 mm² (chuveiro)",
          "tipo": "Material",
          "qtd": 20,
          "unidade": "m",
          "valorUnit": 13
        },
        {
          "descricao": "Cabinho flexível 750 V 6 mm² — preto, azul e verde (cozinha, 3 × 5 m)",
          "tipo": "Material",
          "qtd": 15,
          "unidade": "m",
          "valorUnit": 7.5
        },
        {
          "descricao": "Conector de derivação 16 mm²",
          "tipo": "Material",
          "qtd": 6,
          "unidade": "pç",
          "valorUnit": 9.9
        },
        {
          "descricao": "Disjuntor geral 1P 63 A (padrão de entrada)",
          "tipo": "Material",
          "qtd": 1,
          "unidade": "pç",
          "valorUnit": 55
        },
        {
          "descricao": "Disjuntor DIN 1P 50 A (chuveiro)",
          "tipo": "Material",
          "qtd": 1,
          "unidade": "pç",
          "valorUnit": 32
        },
        {
          "descricao": "Disjuntor DIN 1P 20 A (cozinha)",
          "tipo": "Material",
          "qtd": 1,
          "unidade": "pç",
          "valorUnit": 18
        },
        {
          "descricao": "QDL de sobrepor 6 a 8 posições (DIN) c/ barramentos de neutro e terra",
          "tipo": "Material",
          "qtd": 1,
          "unidade": "pç",
          "valorUnit": 75
        },
        {
          "descricao": "Tomadas 2P+T 20 A c/ caixa de sobrepor (cozinha)",
          "tipo": "Material",
          "qtd": 3,
          "unidade": "pç",
          "valorUnit": 35
        },
        {
          "descricao": "Chuveiro elétrico Lorenzetti Advanced Multitemperatura 127 V / 5.500 W (ou similar)",
          "tipo": "Material",
          "qtd": 1,
          "unidade": "pç",
          "valorUnit": 189.9
        },
        {
          "descricao": "Mão de obra completa (global): adequação do padrão de entrada e lançamento T1; lançamento T2 fixado na estrutura de madeira do telhado; montagem do QDL e remanejamento dos circuitos existentes; circuitos do chuveiro e da cozinha; instalação do chuveiro e das 3 tomadas; testes finais; pedido de aumento de carga na Light e emissão de TRT",
          "tipo": "Mão de Obra",
          "qtd": 1,
          "unidade": "vb",
          "valorUnit": 1000
        }
      ],
      "validadeDias": 15,
      "prazoExecucao": "2 a 3 dias úteis após a aprovação e a chegada dos materiais",
      "condicoesPagamento": "50% na aprovação (compra de materiais) e 50% na conclusão — PIX, transferência ou cartão (acréscimo da operadora)",
      "garantia": "90 dias para a mão de obra; materiais conforme garantia do fabricante.",
      "naoInclusos": "DR e DPS (excluídos por opção do cliente), taxas e serviços da concessionária, obras de alvenaria/forro/telhado, troca do poste particular, pintura e eletrodomésticos.",
      "observacoes": "Por opção do cliente: circuitos em cabinho 750 V aparente e proteção somente por disjuntores, sem DR e sem DPS (NBR 5410 exige eletroduto para cabinho 750 V e DR 30 mA em banheiro e cozinha). Alimentador em 16 mm²: queda de tensão estimada no chuveiro 5,7% em plena carga. Emissão de TRT (CFT/CRT-RJ). Proposta original: Drive › RBS Engenharia › Clientes e Projetos › AUMENTO DE CARGA ROBERTA.",
      "requerArt": false
    }
  }
];
