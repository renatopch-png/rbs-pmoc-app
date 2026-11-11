// Material de estudo "Meu Estudo": mapas mentais técnicos.
// Os PDFs ficam em public/estudos/ (um arquivo por tópico + o volume completo).
// Gerado a partir dos mapas; edite aqui o texto exibido no app.

export const COLECOES = [
 {
  "id": "instrumentacao",
  "titulo": "Instrumentação Industrial",
  "pdf": "/estudos/instrumentacao/instrumentacao-completo.pdf",
  "topicos": [
   {
    "id": "fundamentos",
    "titulo": "Fundamentos",
    "resumo": "Variáveis, elementos da malha e termos de desempenho.",
    "tag": "PV",
    "pdf": "/estudos/instrumentacao/01-fundamentos.pdf",
    "dica": "Zero vivo: 4 mA significa 0 % da escala. Se o sinal cai a 0 mA, o problema é falha no cabo ou no instrumento.",
    "ramos": [
     {
      "titulo": "Variáveis de processo",
      "itens": [
       "Pressão (P)",
       "Temperatura (T)",
       "Vazão (F)",
       "Nível (L)",
       "Analíticas (A): pH, condutividade, O₂"
      ]
     },
     {
      "titulo": "Elementos da malha",
      "itens": [
       "Elemento primário: sente a variável",
       "Transmissor: converte em sinal padrão",
       "Controlador: compara PV com SP",
       "Elemento final: válvula, inversor, damper"
      ]
     },
     {
      "titulo": "Faixa e span",
      "itens": [
       "Range: limite inferior (LRV) e superior (URV)",
       "Span = URV − LRV",
       "Ex.: 20 a 220 °C → span de 200 °C",
       "Supressão e elevação de zero"
      ]
     },
     {
      "titulo": "Desempenho",
      "itens": [
       "Exatidão: proximidade do valor verdadeiro",
       "Repetibilidade: mesma leitura nas mesmas condições",
       "Histerese: diferença entre subida e descida",
       "Zona morta e resolução"
      ]
     },
     {
      "titulo": "Como o erro é expresso",
      "itens": [
       "% do span",
       "% do fundo de escala",
       "% do valor lido",
       "Valor absoluto (ex.: ±0,5 °C)"
      ]
     },
     {
      "titulo": "Sinais padrão",
      "itens": [
       "Corrente: 4–20 mA",
       "Pneumático: 3–15 psi (0,2–1,0 kgf/cm²)",
       "Tensão: 1–5 V ou 0–10 V",
       "Digital: HART, Fieldbus, Profibus"
      ]
     }
    ]
   },
   {
    "id": "simbologia",
    "titulo": "Simbologia ISA 5.1",
    "resumo": "Como ler tags, balões e linhas de um P&ID.",
    "tag": "ISA",
    "pdf": "/estudos/instrumentacao/02-simbologia.pdf",
    "dica": "Leia o tag da esquerda para a direita: a 1ª letra diz o que se mede, as demais dizem o que o instrumento faz.",
    "ramos": [
     {
      "titulo": "1ª letra: o que se mede",
      "itens": [
       "A análise · F vazão · L nível",
       "P pressão · T temperatura",
       "S velocidade · W peso · Z posição",
       "H manual · E tensão"
      ]
     },
     {
      "titulo": "Letras seguintes: função",
      "itens": [
       "I indicador · R registrador",
       "C controlador · T transmissor",
       "E elemento primário · V válvula",
       "A alarme · S chave · Y relé/conversor",
       "G visor"
      ]
     },
     {
      "titulo": "Modificadores",
      "itens": [
       "D diferencial → PDT",
       "H alto · L baixo → LAH, LAL",
       "HH / LL: muito alto / muito baixo",
       "Q totalizador → FQI"
      ]
     },
     {
      "titulo": "Exemplos de tags",
      "itens": [
       "PIT-101: transmissor indicador de pressão",
       "FIC-201: controlador indicador de vazão",
       "TE-301: elemento de temperatura",
       "LSHH-401: chave de nível muito alto",
       "FY-201: conversor I/P"
      ]
     },
     {
      "titulo": "Balão: onde está",
      "itens": [
       "Círculo sem linha: campo",
       "Linha cheia: painel da sala de controle",
       "Linha tracejada: atrás do painel",
       "Círculo no quadrado: SDCD",
       "Losango no quadrado: CLP · hexágono: computador"
      ]
     },
     {
      "titulo": "Linhas de sinal",
      "itens": [
       "Contínua: conexão ao processo",
       "Tracejada: sinal elétrico",
       "Com traços duplos //: pneumático",
       "Com X: capilar",
       "Com pequenos círculos: link de dados"
      ]
     }
    ]
   },
   {
    "id": "pressao",
    "titulo": "Pressão",
    "resumo": "Tipos, unidades, sensores e instalação.",
    "tag": "PT",
    "pdf": "/estudos/instrumentacao/03-pressao.pdf",
    "dica": "No manifold de 3 vias, deixe a equalizadora aberta enquanto abre ou fecha os bloqueios. Isso evita sobrepressão de um lado só na célula DP.",
    "ramos": [
     {
      "titulo": "Tipos",
      "itens": [
       "Absoluta: referência ao vácuo",
       "Manométrica: referência à atmosfera",
       "Diferencial: P1 − P2",
       "Vácuo: abaixo da atmosférica",
       "Pabs = Pman + Patm"
      ]
     },
     {
      "titulo": "Unidades",
      "itens": [
       "1 bar = 100 kPa",
       "1 bar ≈ 14,50 psi",
       "1 kgf/cm² ≈ 0,981 bar",
       "1 atm = 101,325 kPa = 760 mmHg",
       "1 mca ≈ 9,81 kPa"
      ]
     },
     {
      "titulo": "Elementos mecânicos",
      "itens": [
       "Tubo de Bourdon (C, espiral, helicoidal)",
       "Diafragma",
       "Fole",
       "Coluna de líquido (tubo em U)"
      ]
     },
     {
      "titulo": "Sensores eletrônicos",
      "itens": [
       "Strain gauge / piezorresistivo",
       "Capacitivo (célula DP)",
       "Piezoelétrico (pressão dinâmica)",
       "Ressonante de silício"
      ]
     },
     {
      "titulo": "Acessórios",
      "itens": [
       "Sifão: protege contra vapor",
       "Selo diafragma: fluido corrosivo ou viscoso",
       "Amortecedor de pulsação",
       "Manifold de 3 ou 5 vias",
       "Válvula de bloqueio e dreno"
      ]
     },
     {
      "titulo": "Instalação",
      "itens": [
       "Gás: tomada no topo, instrumento acima",
       "Líquido: tomada lateral, instrumento abaixo",
       "Vapor: tomada lateral, com perna úmida",
       "Opere entre ~25 % e 75 % da escala"
      ]
     }
    ]
   },
   {
    "id": "temperatura",
    "titulo": "Temperatura",
    "resumo": "Termopares, Pt100 e boas práticas de instalação.",
    "tag": "TE",
    "pdf": "/estudos/instrumentacao/04-temperatura.pdf",
    "dica": "O Pt100 varia cerca de 0,385 Ω por °C. Leitura absurda ou travada? Meça a resistência direto no borne do sensor.",
    "ramos": [
     {
      "titulo": "Termopares",
      "itens": [
       "Efeito Seebeck: dois metais geram mV",
       "Tipo J (Fe–Constantan): até ~750 °C",
       "Tipo K (Cromel–Alumel): até ~1 250 °C",
       "Tipo T (Cu–Constantan): −200 a 350 °C",
       "Tipos S, R, B (Pt–Rh): até 1 600–1 700 °C"
      ]
     },
     {
      "titulo": "Junta fria",
      "itens": [
       "Mede-se a diferença entre as junções",
       "Compensação automática no transmissor",
       "Cabo de extensão ou compensação do mesmo tipo",
       "Polaridade invertida gera erro grande"
      ]
     },
     {
      "titulo": "RTD Pt100",
      "itens": [
       "100 Ω a 0 °C",
       "≈ 138,5 Ω a 100 °C (α = 0,00385)",
       "2 fios: o cabo entra como erro",
       "3 fios: compensa o cabo (mais usado)",
       "4 fios: maior exatidão"
      ]
     },
     {
      "titulo": "Classes Pt100 (IEC 60751)",
      "itens": [
       "Classe A: ±(0,15 + 0,002·|t|) °C",
       "Classe B: ±(0,30 + 0,005·|t|) °C",
       "Ex.: classe B a 100 °C → ±0,8 °C"
      ]
     },
     {
      "titulo": "Outros sensores",
      "itens": [
       "Termistor NTC/PTC: faixa estreita, muito sensível",
       "Bimetálico: indicação local",
       "Termômetro a capilar (gás ou líquido)",
       "Pirômetro infravermelho: sem contato, depende da emissividade"
      ]
     },
     {
      "titulo": "Instalação",
      "itens": [
       "Poço termométrico protege e permite troca",
       "Imersão mínima ≈ 10× o diâmetro da bainha",
       "Óleo ou pasta térmica reduz o tempo de resposta",
       "Evite trechos sem fluxo"
      ]
     }
    ]
   },
   {
    "id": "vazao",
    "titulo": "Vazão",
    "resumo": "Princípios de medição e onde cada um se aplica.",
    "tag": "FT",
    "pdf": "/estudos/instrumentacao/05-vazao.pdf",
    "dica": "Na placa de orifício, metade da vazão dá só um quarto do ΔP. Por isso a medição perde precisão no começo da escala.",
    "ramos": [
     {
      "titulo": "Pressão diferencial",
      "itens": [
       "Placa de orifício, Venturi, bocal, Pitot",
       "Q ∝ √ΔP (extração de raiz)",
       "Baixo custo, perda de carga permanente",
       "Rangeabilidade típica ~4:1"
      ]
     },
     {
      "titulo": "Eletromagnético",
      "itens": [
       "Lei de Faraday",
       "Só líquidos condutivos (≥ ~5 µS/cm)",
       "Sem perda de carga e sem partes móveis",
       "Tubo sempre cheio e aterrado"
      ]
     },
     {
      "titulo": "Coriolis",
      "itens": [
       "Mede vazão mássica direta",
       "Também mede densidade e temperatura",
       "Alta exatidão (~0,1 %)",
       "Custo alto em diâmetros grandes"
      ]
     },
     {
      "titulo": "Vórtex, turbina e ultrassom",
      "itens": [
       "Vórtex: frequência dos vórtices de Von Kármán",
       "Turbina: rotação ∝ velocidade (fluido limpo)",
       "Ultrassom: tempo de trânsito (limpo) ou Doppler (com partículas)",
       "Clamp-on: instala sem cortar o tubo"
      ]
     },
     {
      "titulo": "Deslocamento positivo",
      "itens": [
       "Câmaras de volume fixo",
       "Bom para fluidos viscosos (óleos)",
       "Comum em medição fiscal e dosagem"
      ]
     },
     {
      "titulo": "Instalação",
      "itens": [
       "Trecho reto típico: 10 D antes, 5 D depois",
       "Curvas e válvulas exigem mais: veja o fabricante",
       "Evite ar ou gás no medidor de líquido",
       "Q = v · A"
      ]
     }
    ]
   },
   {
    "id": "nivel",
    "titulo": "Nível",
    "resumo": "Métodos diretos, hidrostáticos, com e sem contato.",
    "tag": "LT",
    "pdf": "/estudos/instrumentacao/06-nivel.pdf",
    "dica": "Água: 1 m de coluna ≈ 0,098 bar (9,81 kPa). Para outro líquido, multiplique pela densidade relativa.",
    "ramos": [
     {
      "titulo": "Medição direta",
      "itens": [
       "Visor de vidro (LG)",
       "Régua ou trena",
       "Indicador magnético com boia"
      ]
     },
     {
      "titulo": "Pressão hidrostática",
      "itens": [
       "P = ρ · g · h",
       "Tanque aberto: transmissor de pressão no fundo",
       "Tanque fechado: transmissor DP (perna seca ou úmida)",
       "Selo remoto com capilar: fluido agressivo",
       "Depende da densidade do produto"
      ]
     },
     {
      "titulo": "Sem contato",
      "itens": [
       "Radar: micro-ondas, pouco afetado por vapor e temperatura",
       "Ultrassônico: barato, sofre com espuma e vapor",
       "Radiométrico: casos extremos (licença CNEN)"
      ]
     },
     {
      "titulo": "Com contato",
      "itens": [
       "Radar de onda guiada (GWR)",
       "Capacitivo: depende do meio",
       "Deslocador (empuxo de Arquimedes)",
       "Borbulhador (purga de ar)"
      ]
     },
     {
      "titulo": "Chaves de nível",
      "itens": [
       "Boia",
       "Vibratória (diapasão)",
       "Condutiva (eletrodos)",
       "Alarmes LSH/LSL e proteção de bomba"
      ]
     }
    ]
   },
   {
    "id": "analiticos",
    "titulo": "Analíticos",
    "resumo": "pH, condutividade, oxigênio e análise de gases.",
    "tag": "AT",
    "pdf": "/estudos/instrumentacao/07-analiticos.pdf",
    "dica": "Eletrodo de pH com inclinação abaixo de ~90 % da teórica (≈ 53 mV/pH) está pedindo troca.",
    "ramos": [
     {
      "titulo": "pH",
      "itens": [
       "Eletrodo de vidro + referência",
       "≈ 59,16 mV/pH a 25 °C",
       "Calibre com tampões pH 4, 7 e 10",
       "Compensação de temperatura obrigatória",
       "Mantenha o eletrodo sempre úmido"
      ]
     },
     {
      "titulo": "Condutividade",
      "itens": [
       "Unidade: µS/cm ou mS/cm",
       "Constante de célula K (0,01 a 10 cm⁻¹)",
       "Toroidal (indutiva) para meios sujos",
       "Referência a 25 °C"
      ]
     },
     {
      "titulo": "Oxigênio dissolvido",
      "itens": [
       "Sensor óptico (luminescente)",
       "Sensor amperométrico (membrana)",
       "mg/L ou % de saturação",
       "Efluentes e água de caldeira"
      ]
     },
     {
      "titulo": "Gases",
      "itens": [
       "O₂ em combustão: zircônia",
       "CO/CO₂: infravermelho (NDIR)",
       "Gás combustível: % do LIE",
       "H₂S e NH₃: células eletroquímicas"
      ]
     },
     {
      "titulo": "Outras análises",
      "itens": [
       "Turbidez (NTU)",
       "Cloro residual",
       "Densidade e viscosidade",
       "Cromatografia gasosa (composição)"
      ]
     },
     {
      "titulo": "Sistema de amostragem",
      "itens": [
       "Atenção ao atraso da amostra",
       "Filtro e condicionamento de pressão e temperatura",
       "Calibração com gás ou solução padrão"
      ]
     }
    ]
   },
   {
    "id": "sinais",
    "titulo": "Sinais e comunicação",
    "resumo": "4–20 mA, HART e redes industriais.",
    "tag": "IT",
    "pdf": "/estudos/instrumentacao/08-sinais.pdf",
    "dica": "Para achar a porcentagem: % = (mA − 4) / 16. Ex.: 8 mA corresponde a 25 % da escala.",
    "ramos": [
     {
      "titulo": "4–20 mA",
      "itens": [
       "Zero vivo: 4 mA = 0 %",
       "I = 4 + 16 · (PV − LRV) / span",
       "Ex.: 0–10 bar, 12 mA → 5 bar",
       "Falha (NAMUR NE 43): ≤ 3,6 mA ou ≥ 21 mA"
      ]
     },
     {
      "titulo": "Ligação",
      "itens": [
       "2 fios: alimentado pela malha (24 Vcc)",
       "4 fios: alimentação separada",
       "Resistor de 250 Ω converte em 1–5 V",
       "Confira a queda de tensão da malha"
      ]
     },
     {
      "titulo": "HART",
      "itens": [
       "Digital sobreposto ao 4–20 mA (FSK)",
       "1 200 Hz = bit 1 · 2 200 Hz = bit 0",
       "Exige ≥ 250 Ω na malha",
       "Configuração, diagnóstico, multivariável"
      ]
     },
     {
      "titulo": "Redes de campo",
      "itens": [
       "Foundation Fieldbus H1: 31,25 kbit/s",
       "Profibus PA (campo) e DP (painel)",
       "Modbus RTU em RS-485",
       "WirelessHART e ISA100 (sem fio)"
      ]
     },
     {
      "titulo": "Ethernet industrial",
      "itens": [
       "Profinet",
       "EtherNet/IP",
       "Modbus TCP",
       "OPC UA: integração com supervisório e MES"
      ]
     },
     {
      "titulo": "Boas práticas",
      "itens": [
       "Cabo blindado e trançado",
       "Blindagem aterrada em um só ponto (painel)",
       "Separe sinal de cabos de potência",
       "Isolador galvânico contra laço de terra"
      ]
     }
    ]
   },
   {
    "id": "pid",
    "titulo": "Controle PID",
    "resumo": "Ações de controle, sintonia e estratégias.",
    "tag": "TIC",
    "pdf": "/estudos/instrumentacao/09-pid.pdf",
    "dica": "Passe de manual para automático com a PV estável e perto do SP. É a transferência sem salto (bumpless).",
    "ramos": [
     {
      "titulo": "Malha de controle",
      "itens": [
       "Aberta: sem realimentação",
       "Fechada: mede, compara e corrige",
       "Ação reversa: PV sobe → saída desce (aquecimento)",
       "Ação direta: PV sobe → saída sobe (resfriamento)"
      ]
     },
     {
      "titulo": "Proporcional (P)",
      "itens": [
       "Saída proporcional ao erro",
       "BP (%) = 100 / Kp",
       "Deixa erro residual (offset)",
       "Kp alto demais → oscilação"
      ]
     },
     {
      "titulo": "Integral (I)",
      "itens": [
       "Elimina o offset",
       "Ti em min/rep ou Ki em rep/min",
       "Integral demais → oscilação lenta",
       "Anti-windup evita saturação"
      ]
     },
     {
      "titulo": "Derivativa (D)",
      "itens": [
       "Reage à taxa de variação",
       "Antecipa a correção",
       "Útil em temperatura (processo lento)",
       "Evite em vazão: amplifica ruído"
      ]
     },
     {
      "titulo": "Sintonia",
      "itens": [
       "Ziegler–Nichols em malha fechada: Ku e Pu",
       "Kp = 0,6·Ku · Ti = Pu/2 · Td = Pu/8",
       "Curva de reação (malha aberta)",
       "Ajuste fino: P, depois I, depois D"
      ]
     },
     {
      "titulo": "Estratégias",
      "itens": [
       "Cascata: a mestre ajusta o SP da escrava",
       "Razão: mantém proporção entre vazões",
       "Feedforward: corrige antes do distúrbio",
       "Split-range: uma saída, duas válvulas",
       "Override / seletor"
      ]
     }
    ]
   },
   {
    "id": "valvulas",
    "titulo": "Válvulas de controle",
    "resumo": "Corpo, atuador, falha segura e dimensionamento.",
    "tag": "FV",
    "pdf": "/estudos/instrumentacao/10-valvulas.pdf",
    "dica": "Válvula com stiction faz a malha oscilar em dente de serra mesmo com sintonia correta. Verifique a válvula antes de mexer no PID.",
    "ramos": [
     {
      "titulo": "Tipos de corpo",
      "itens": [
       "Globo: melhor para controle fino",
       "Borboleta: grandes diâmetros, baixo custo",
       "Esfera segmentada (V-ball): fluido com sólidos",
       "Gaveta: só bloqueio, nunca controle"
      ]
     },
     {
      "titulo": "Atuadores",
      "itens": [
       "Pneumático diafragma-mola (mais comum)",
       "Pistão: força maior",
       "Elétrico: dispensa ar comprimido",
       "Hidráulico: alta força e velocidade"
      ]
     },
     {
      "titulo": "Ação em falha",
      "itens": [
       "FC (falha fecha) = ar para abrir",
       "FO (falha abre) = ar para fechar",
       "FL: trava na última posição",
       "Defina pela segurança do processo"
      ]
     },
     {
      "titulo": "Acessórios",
      "itens": [
       "Posicionador eletropneumático (4–20 mA)",
       "Conversor I/P (FY)",
       "Solenoide de desarme",
       "Chaves fim de curso (ZSO / ZSC)",
       "Filtro regulador de ar"
      ]
     },
     {
      "titulo": "Característica de vazão",
      "itens": [
       "Linear",
       "Igual porcentagem (mais usada)",
       "Abertura rápida (on/off)",
       "Trabalhe entre ~20 % e 80 % de abertura"
      ]
     },
     {
      "titulo": "Dimensionamento e problemas",
      "itens": [
       "Q = Cv · √(ΔP / G) (gpm, psi)",
       "Kv ≈ 0,865 · Cv",
       "Cavitação: bolhas implodem e desgastam",
       "Flashing, ruído e agarramento (stiction)"
      ]
     }
    ]
   },
   {
    "id": "calibracao",
    "titulo": "Calibração",
    "resumo": "Metrologia aplicada ao instrumento de campo.",
    "tag": "CAL",
    "pdf": "/estudos/instrumentacao/11-calibracao.pdf",
    "dica": "Erro de zero desloca a curva inteira; erro de span muda a inclinação. Por isso o zero vem primeiro.",
    "ramos": [
     {
      "titulo": "Conceitos",
      "itens": [
       "Calibrar: comparar com padrão rastreável",
       "Ajustar: corrigir o instrumento",
       "Erro = indicação − valor de referência",
       "Incerteza de medição sempre declarada"
      ]
     },
     {
      "titulo": "Rastreabilidade",
      "itens": [
       "Cadeia até o padrão nacional (Inmetro)",
       "Laboratórios RBC (ISO/IEC 17025)",
       "Padrão ~4× melhor que o instrumento (TUR 4:1)",
       "Certificado com data, incerteza e condições"
      ]
     },
     {
      "titulo": "Procedimento",
      "itens": [
       "Pontos: 0, 25, 50, 75 e 100 % do span",
       "Subida e descida (verifica histerese)",
       "Registre “como encontrado” e “como deixado”",
       "Ajuste zero, depois span, e repita"
      ]
     },
     {
      "titulo": "Ferramentas",
      "itens": [
       "Calibrador de processo (mA, V, Ω, mV)",
       "Bomba comparativa ou balança de peso morto",
       "Forno de bloco seco e banho termostático",
       "Comunicador HART"
      ]
     },
     {
      "titulo": "Gestão",
      "itens": [
       "Periodicidade conforme criticidade e histórico",
       "Etiqueta de status no instrumento",
       "Critério de aceitação definido antes",
       "Instrumentos de segurança: teste periódico"
      ]
     }
    ]
   },
   {
    "id": "areas-classificadas",
    "titulo": "Áreas classificadas",
    "resumo": "Atmosferas explosivas e tipos de proteção.",
    "tag": "Ex",
    "pdf": "/estudos/instrumentacao/12-areas-classificadas.pdf",
    "dica": "Equipamento para Zona 0 (EPL Ga) pode ir para Zonas 1 e 2. O contrário nunca.",
    "ramos": [
     {
      "titulo": "Zonas (gases)",
      "itens": [
       "Zona 0: atmosfera explosiva contínua",
       "Zona 1: provável em operação normal",
       "Zona 2: rara e de curta duração",
       "Poeiras: Zonas 20, 21 e 22"
      ]
     },
     {
      "titulo": "Tipos de proteção",
      "itens": [
       "Ex d: à prova de explosão",
       "Ex e: segurança aumentada",
       "Ex i: segurança intrínseca (ia, ib, ic)",
       "Ex p: pressurizado · Ex m: encapsulado",
       "Ex t: proteção por invólucro (poeiras)"
      ]
     },
     {
      "titulo": "Grupos de gás",
      "itens": [
       "IIA: propano (menos severo)",
       "IIB: etileno",
       "IIC: hidrogênio e acetileno (mais severo)",
       "IIC atende também IIB e IIA"
      ]
     },
     {
      "titulo": "Classe de temperatura",
      "itens": [
       "T1 ≤ 450 °C · T2 ≤ 300 °C",
       "T3 ≤ 200 °C · T4 ≤ 135 °C",
       "T5 ≤ 100 °C · T6 ≤ 85 °C",
       "Superfície abaixo da ignição do gás"
      ]
     },
     {
      "titulo": "Segurança intrínseca",
      "itens": [
       "Limita a energia abaixo da ignição",
       "Barreira zener ou isolador galvânico",
       "Confira parâmetros de entidade (Uo, Io, Co, Lo)",
       "Cabos azuis, separados dos demais"
      ]
     },
     {
      "titulo": "Normas e certificação",
      "itens": [
       "ABNT NBR IEC 60079 (série)",
       "Certificação Inmetro obrigatória",
       "Marcação ex.: Ex db IIC T6 Gb",
       "NR-10 e NR-20 para trabalho na área"
      ]
     }
    ]
   }
  ],
  "desc": "Pressão, temperatura, vazão, nível, ISA 5.1, sinais, PID, válvulas, calibração e áreas classificadas.",
  "cor": "from-sky-500 to-blue-700"
 },
 {
  "id": "refrigeracao",
  "titulo": "Automação de Refrigeração",
  "pdf": "/estudos/refrigeracao/refrigeracao-completo.pdf",
  "topicos": [
   {
    "id": "ciclo",
    "titulo": "Ciclo de refrigeração",
    "resumo": "Componentes, estados do fluido, capacidade e eficiência.",
    "tag": "CF",
    "pdf": "/estudos/refrigeracao/01-ciclo.pdf",
    "dica": "Pressão sozinha não diz nada: converta sempre na tabela P×T do fluido para saber a temperatura de saturação.",
    "ramos": [
     {
      "titulo": "Componentes",
      "itens": [
       "Compressor: eleva pressão e temperatura",
       "Condensador: rejeita calor",
       "Dispositivo de expansão: reduz a pressão",
       "Evaporador: absorve calor do ambiente"
      ]
     },
     {
      "titulo": "Estados do fluido",
      "itens": [
       "Sucção: vapor superaquecido, baixa pressão",
       "Descarga: vapor superaquecido, alta pressão",
       "Linha de líquido: líquido sub-resfriado",
       "Após a expansão: mistura líquido + vapor"
      ]
     },
     {
      "titulo": "Capacidade",
      "itens": [
       "1 TR = 12 000 BTU/h ≈ 3,517 kW",
       "1 kW ≈ 3 412 BTU/h",
       "1 kcal/h ≈ 3,968 BTU/h",
       "Depende da evaporação e da condensação"
      ]
     },
     {
      "titulo": "Eficiência",
      "itens": [
       "COP = capacidade / potência elétrica",
       "EER = BTU/h ÷ W",
       "IDRS: índice sazonal dos splits (Inmetro)",
       "Cada 1 K a menos na evaporação ≈ 2 % a 4 % mais consumo"
      ]
     },
     {
      "titulo": "Fluidos refrigerantes",
      "itens": [
       "R-22 (HCFC): em eliminação",
       "R-410A: splits e VRF",
       "R-32: splits inverter (A2L, levemente inflamável)",
       "R-404A → R-448A / R-449A no comercial",
       "R-290 e R-744 (CO₂): fluidos naturais"
      ]
     },
     {
      "titulo": "Faixas típicas de evaporação",
      "itens": [
       "Climatização: ~ +5 a +7 °C",
       "Resfriados (0 a +5 °C): ~ −8 a −10 °C",
       "Congelados (−18 a −25 °C): ~ −28 a −35 °C",
       "ΔT ar × evaporação: ~6 a 10 K"
      ]
     }
    ]
   },
   {
    "id": "sensores",
    "titulo": "Sensores",
    "resumo": "Temperatura, pressão e onde instalar cada um.",
    "tag": "TE",
    "pdf": "/estudos/refrigeracao/02-sensores.pdf",
    "dica": "NTC 10 kΩ: a 25 °C mede 10 kΩ e a 0 °C fica entre ~27 e 33 kΩ, conforme o modelo. Infinito = aberto; perto de zero = em curto.",
    "ramos": [
     {
      "titulo": "NTC",
      "itens": [
       "O mais usado em controladores de câmara",
       "10 kΩ a 25 °C (padrão comum)",
       "Resistência cai quando a temperatura sobe",
       "Faixa típica −50 a +105 °C"
      ]
     },
     {
      "titulo": "PTC, Pt1000 e Pt100",
      "itens": [
       "PTC: resistência sobe com a temperatura",
       "Pt1000: 1 000 Ω a 0 °C, bom para distâncias longas",
       "Pt100 em chillers e processos",
       "Confira o tipo no parâmetro do controlador"
      ]
     },
     {
      "titulo": "Posição dos sensores",
      "itens": [
       "Ambiente: no retorno de ar do evaporador",
       "Fim de degelo: entre as aletas, no ponto mais frio",
       "Sucção: tubo < 7/8″ às 12 h; maior, às 4 ou 8 h",
       "Isole o sensor de sucção"
      ]
     },
     {
      "titulo": "Transdutores de pressão",
      "itens": [
       "Ratiométrico 0,5–4,5 V (alimentação 5 V)",
       "4–20 mA para distâncias longas",
       "Faixa adequada ao lado (baixa / alta) e ao fluido",
       "Instale em cima do tubo, nunca embaixo (óleo)"
      ]
     },
     {
      "titulo": "Outros sensores",
      "itens": [
       "Umidade relativa (UR %)",
       "CO₂ para renovação de ar",
       "Detector de vazamento de refrigerante (ppm)",
       "Sensor de porta (reed switch)"
      ]
     },
     {
      "titulo": "Diagnóstico",
      "itens": [
       "Meça a resistência com o sensor desligado",
       "Compare com a tabela R×T do fabricante",
       "Erro de sensor: geralmente aberto ou em curto",
       "Offset (calibração) no parâmetro do controlador"
      ]
     }
    ]
   },
   {
    "id": "superaquecimento",
    "titulo": "Superaquecimento e sub-resfriamento",
    "resumo": "As duas medidas que mostram como está o ciclo.",
    "tag": "SA",
    "pdf": "/estudos/refrigeracao/03-superaquecimento.pdf",
    "dica": "R-410A com sucção em ~8,3 bar (man.) satura a ~+5 °C. Tubo de sucção a +12 °C → SA = 7 K.",
    "ramos": [
     {
      "titulo": "Superaquecimento (SA)",
      "itens": [
       "SA = T sucção − T saturação (evaporação)",
       "Útil: na saída do evaporador",
       "Total: na entrada do compressor",
       "Típico com VET: ~3 a 7 K (ajuste de fábrica)",
       "Garante que só vapor chegue ao compressor"
      ]
     },
     {
      "titulo": "Sub-resfriamento (SR)",
      "itens": [
       "SR = T saturação (condensação) − T linha de líquido",
       "Medido na saída do condensador",
       "Típico: ~4 a 10 K (veja o fabricante)",
       "Garante líquido puro na expansão"
      ]
     },
     {
      "titulo": "SA alto",
      "itens": [
       "Falta de fluido (vazamento)",
       "Filtro secador ou expansão restrita",
       "Válvula de expansão fechando demais",
       "Descarga do compressor muito quente"
      ]
     },
     {
      "titulo": "SR alto",
      "itens": [
       "Excesso de carga de fluido",
       "Restrição na linha de líquido ou na expansão",
       "Condensador alagado de líquido"
      ]
     },
     {
      "titulo": "SA baixo",
      "itens": [
       "Expansão alimentando demais",
       "Bulbo solto ou mal isolado",
       "Evaporador sujo ou com gelo, pouca carga térmica",
       "Risco de retorno de líquido"
      ]
     },
     {
      "titulo": "Carga de fluido",
      "itens": [
       "Capilar ou orifício fixo: carregue pelo SA",
       "VET ou EEV: carregue pelo SR",
       "Fluido com glide: orvalho no SA, bolha no SR",
       "Mistura zeotrópica: carregue sempre como líquido"
      ]
     }
    ]
   },
   {
    "id": "expansao",
    "titulo": "Válvulas de expansão",
    "resumo": "Capilar, termostática e eletrônica.",
    "tag": "EXV",
    "pdf": "/estudos/refrigeracao/04-expansao.pdf",
    "dica": "Antes de mexer no ajuste da VET, meça o SA e confira o filtro secador. A maioria das “válvulas ruins” é falta de fluido ou restrição.",
    "ramos": [
     {
      "titulo": "Capilar e orifício fixo",
      "itens": [
       "Restrição fixa, sem ajuste",
       "Equaliza as pressões na parada",
       "Refrigeradores e splits pequenos",
       "Muito sensível à carga de fluido"
      ]
     },
     {
      "titulo": "VET (termostática)",
      "itens": [
       "Bulbo lê a temperatura da sucção",
       "Mantém o SA constante (ajuste na haste)",
       "Equalização interna: pouca perda de carga",
       "Equalização externa: com distribuidor"
      ]
     },
     {
      "titulo": "EEV (eletrônica)",
      "itens": [
       "Motor de passo ou PWM",
       "Driver lê transdutor de pressão + sensor de temperatura",
       "SA menor e estável → mais eficiência",
       "Pode fechar totalmente na parada"
      ]
     },
     {
      "titulo": "Seleção",
      "itens": [
       "Capacidade no ponto real (evap., cond., SR)",
       "Orifício certo para o fluido",
       "Superdimensionada → oscilação (hunting)",
       "Subdimensionada → SA alto"
      ]
     },
     {
      "titulo": "Problemas comuns",
      "itens": [
       "SA oscilando (hunting)",
       "Bulbo com perda de carga: válvula fecha",
       "Umidade congelando no orifício",
       "Tela de filtro obstruída"
      ]
     },
     {
      "titulo": "Solenoide da linha de líquido",
      "itens": [
       "Pump-down: recolhe o fluido antes de parar",
       "Comandada pelo controlador de temperatura",
       "Seta do corpo no sentido do fluxo",
       "Confira a tensão da bobina"
      ]
     }
    ]
   },
   {
    "id": "pressostatos",
    "titulo": "Pressostatos e proteções",
    "resumo": "O que desliga o sistema e por quê.",
    "tag": "PSH",
    "pdf": "/estudos/refrigeracao/05-pressostatos.pdf",
    "dica": "Scroll girando ao contrário faz barulho alto, não bombeia e esquenta. Use relé de sequência de fase em todo compressor trifásico.",
    "ramos": [
     {
      "titulo": "Pressostato de baixa (LP)",
      "itens": [
       "Desliga com sucção baixa (falta de fluido, gelo)",
       "Usado no pump-down",
       "Rearme automático",
       "Diferencial evita partidas curtas"
      ]
     },
     {
      "titulo": "Pressostato de alta (HP)",
      "itens": [
       "Desliga com descarga alta",
       "Condensador sujo, ventilador parado, excesso de carga",
       "Rearme manual (segurança)",
       "Ajuste abaixo da pressão máxima do sistema"
      ]
     },
     {
      "titulo": "Pressostato de óleo",
      "itens": [
       "Semi-herméticos com bomba de óleo",
       "Mede o diferencial óleo − cárter",
       "Temporiza ~120 s antes de desarmar",
       "Rearme manual"
      ]
     },
     {
      "titulo": "Proteções do compressor",
      "itens": [
       "Disjuntor-motor ou relé térmico",
       "Termostato de descarga",
       "Protetor interno (klixon) nos herméticos",
       "Módulo com PTC no enrolamento (scroll e semi)"
      ]
     },
     {
      "titulo": "Proteções elétricas",
      "itens": [
       "Relé de falta e sequência de fase",
       "Relé de sub e sobretensão",
       "Temporizador anti-reciclagem (3 a 5 min)",
       "DPS e aterramento"
      ]
     },
     {
      "titulo": "Controle de condensação",
      "itens": [
       "Pressostato liga e desliga ventiladores",
       "Ou varia a velocidade (inversor / EC)",
       "Mantém pressão mínima para a expansão",
       "Essencial em clima frio"
      ]
     }
    ]
   },
   {
    "id": "controlador",
    "titulo": "Controlador digital",
    "resumo": "Parâmetros e funções do controlador de câmara.",
    "tag": "TIC",
    "pdf": "/estudos/refrigeracao/06-controlador.pdf",
    "dica": "Configure o modo de emergência (ciclo liga/desliga fixo) para falha de sensor: o produto não fica sem frio até a visita técnica.",
    "ramos": [
     {
      "titulo": "Funções",
      "itens": [
       "Termostato com diferencial (histerese)",
       "Controle de degelo",
       "Ventiladores do evaporador",
       "Alarmes de temperatura"
      ]
     },
     {
      "titulo": "Temperatura",
      "itens": [
       "Setpoint e diferencial (ex.: SP 2 °C, dif. 2 K)",
       "Limites do SP (trava contra ajuste errado)",
       "Offset do sensor",
       "Tempo mínimo entre partidas do compressor"
      ]
     },
     {
      "titulo": "Ventiladores do evaporador",
      "itens": [
       "Atraso após o degelo (gotejamento)",
       "Param com a porta aberta",
       "Ligam só com o evaporador frio",
       "Contínuos ou junto com o compressor"
      ]
     },
     {
      "titulo": "Alarmes",
      "itens": [
       "Alta e baixa temperatura, com atraso",
       "Porta aberta",
       "Falha de sensor (modo de emergência)",
       "Saída para sirene e para supervisório"
      ]
     },
     {
      "titulo": "Comunicação",
      "itens": [
       "RS-485 com Modbus RTU",
       "Supervisório local, nuvem ou app",
       "Registro de temperatura (boas práticas sanitárias)",
       "Relatórios de data logger"
      ]
     },
     {
      "titulo": "Instalação",
      "itens": [
       "Relé interno até a corrente indicada; acima, contator",
       "Cabo de sensor longe de cabo de potência",
       "Alimentação conforme o modelo",
       "Emenda de sensor soldada e isolada"
      ]
     }
    ]
   },
   {
    "id": "degelo",
    "titulo": "Degelo",
    "resumo": "Tipos, início, fim e falhas mais comuns.",
    "tag": "DEG",
    "pdf": "/estudos/refrigeracao/07-degelo.pdf",
    "dica": "Resistência de degelo: R = U² / P. Ex.: 1 000 W em 220 V → ~48 Ω. Infinito = queimada.",
    "ramos": [
     {
      "titulo": "Por que degelar",
      "itens": [
       "Gelo isola o evaporador e bloqueia o ar",
       "Cai a capacidade e a pressão de sucção",
       "Necessário com evaporação abaixo de ~0 °C"
      ]
     },
     {
      "titulo": "Tipos",
      "itens": [
       "Natural (parada): câmaras acima de ~+2 °C",
       "Resistência elétrica: comum em congelados",
       "Gás quente: mais rápido, usa a descarga",
       "Ciclo reverso: bombas de calor e splits"
      ]
     },
     {
      "titulo": "Início",
      "itens": [
       "Por intervalo de tempo (ex.: a cada 6 h)",
       "Por tempo de compressor ligado",
       "Sob demanda: ΔT ar × evaporador ou pressão",
       "Por horário, fora da ponta"
      ]
     },
     {
      "titulo": "Fim",
      "itens": [
       "Por temperatura do evaporador (~+8 a +12 °C)",
       "Por tempo máximo (segurança)",
       "Gotejamento: pausa para escoar a água",
       "Atraso dos ventiladores até o evaporador esfriar"
      ]
     },
     {
      "titulo": "Componentes",
      "itens": [
       "Resistências no evaporador e na bandeja",
       "Resistência no dreno (câmara negativa)",
       "Termostato de segurança",
       "Contatores para a carga resistiva"
      ]
     },
     {
      "titulo": "Falhas comuns",
      "itens": [
       "Bloco de gelo: dreno congelado ou resistência queimada",
       "Gelo em parte do evaporador: resistência aberta",
       "Degelos demais: gasto de energia e temperatura instável",
       "Umidade entrando: porta, cortina, vedação"
      ]
     }
    ]
   },
   {
    "id": "quadro",
    "titulo": "Quadro de comando",
    "resumo": "Montagem do painel elétrico de câmara fria.",
    "tag": "QC",
    "pdf": "/estudos/refrigeracao/08-quadro.pdf",
    "dica": "Pressostato de alta com rearme manual em série no comando: se desarmar, alguém precisa ir ver o motivo antes de religar.",
    "ramos": [
     {
      "titulo": "Potência",
      "itens": [
       "Disjuntor geral e por circuito",
       "Disjuntor-motor do compressor",
       "Contatores: compressor, ventiladores, degelo",
       "Relé de falta e sequência de fase"
      ]
     },
     {
      "titulo": "Comando",
      "itens": [
       "Controlador digital (TIC)",
       "Circuito de comando 24 V ou 220 V",
       "Seletora Manual – 0 – Automático",
       "Botão de emergência"
      ]
     },
     {
      "titulo": "Sinalização",
      "itens": [
       "Lâmpadas: ligado, degelo, falha",
       "Sirene de alarme",
       "Iluminação da câmara com interruptor externo",
       "Alarme de pessoa presa dentro da câmara"
      ]
     },
     {
      "titulo": "Intertravamentos",
      "itens": [
       "Compressor só com ventilador do condensador",
       "Pressostatos de alta e baixa em série no comando",
       "Degelo elétrico desliga o compressor",
       "Porta aberta desliga os ventiladores"
      ]
     },
     {
      "titulo": "Dimensionamento (NBR 5410)",
      "itens": [
       "Cabo por corrente e queda de tensão",
       "Queda máx. de 4 % nos circuitos terminais",
       "IDR 30 mA em tomadas e iluminação",
       "DPS no quadro e aterramento TN-S"
      ]
     },
     {
      "titulo": "Documentação",
      "itens": [
       "Diagrama de força e de comando atualizado",
       "Bornes e cabos identificados",
       "ART de projeto e execução",
       "Isolação do motor medida com megômetro"
      ]
     }
    ]
   },
   {
    "id": "partida",
    "titulo": "Partida de compressores",
    "resumo": "Métodos de partida e seus efeitos na rede.",
    "tag": "M",
    "pdf": "/estudos/refrigeracao/09-partida.pdf",
    "dica": "Hermético monofásico: R(C-S) + R(C-R) deve dar R(S-R). Se não fechar, há enrolamento aberto ou em curto.",
    "ramos": [
     {
      "titulo": "Partida direta",
      "itens": [
       "Simples e barata",
       "Corrente de partida 5 a 8× a nominal",
       "Limite de potência definido pela concessionária",
       "Herméticos pequenos"
      ]
     },
     {
      "titulo": "Monofásico",
      "itens": [
       "Capacitor de partida + relé (potencial ou PTC)",
       "Capacitor de marcha (permanente)",
       "Terminais: C comum, S partida, R marcha",
       "R(C-S) + R(C-R) = R(S-R)"
      ]
     },
     {
      "titulo": "Estrela-triângulo",
      "itens": [
       "Corrente de partida cai para ~1/3",
       "Motor de 6 terminais, tensão de Δ = rede",
       "Torque também cai para ~1/3",
       "Temporizador de comutação Y → Δ"
      ]
     },
     {
      "titulo": "Part-winding",
      "itens": [
       "Comum em semi-herméticos",
       "Liga metade do enrolamento, depois a outra",
       "Atraso de ~1 s entre contatores",
       "Corrente ~60 % da partida direta"
      ]
     },
     {
      "titulo": "Soft-starter",
      "itens": [
       "Rampa de tensão por tiristores",
       "Reduz o pico de corrente e o golpe mecânico",
       "Contator de bypass após a partida",
       "Não varia a velocidade em regime"
      ]
     },
     {
      "titulo": "Inversor de frequência",
      "itens": [
       "Partida com corrente perto da nominal",
       "Varia a capacidade do compressor",
       "Compressor precisa ser compatível",
       "Detalhes no mapa 10"
      ]
     }
    ]
   },
   {
    "id": "inversor",
    "titulo": "Inversor de frequência",
    "resumo": "Velocidade variável em compressores, bombas e ventiladores.",
    "tag": "SIC",
    "pdf": "/estudos/refrigeracao/10-inversor.pdf",
    "dica": "Em bombas e ventiladores, rodar a 80 % da rotação consome ~51 % da potência: 0,8³ = 0,512.",
    "ramos": [
     {
      "titulo": "Princípio",
      "itens": [
       "Retifica a rede, filtra no barramento CC, gera PWM",
       "n = 120 · f / p (rpm)",
       "Controle V/f ou vetorial",
       "Capacidade do compressor ∝ rotação"
      ]
     },
     {
      "titulo": "Aplicações",
      "itens": [
       "Compressor de velocidade variável",
       "Ventiladores do condensador",
       "Bombas de água gelada e de condensação",
       "Ventiladores de fan coil e AHU"
      ]
     },
     {
      "titulo": "Economia de energia",
      "itens": [
       "Bombas e ventiladores: potência ∝ rotação³",
       "80 % da rotação → ~51 % da potência",
       "Menos partidas e paradas",
       "Temperatura mais estável"
      ]
     },
     {
      "titulo": "Parâmetros",
      "itens": [
       "Frequência mínima e máxima",
       "Rampas de aceleração e desaceleração",
       "PID interno com transmissor 4–20 mA",
       "Corrente nominal do motor"
      ]
     },
     {
      "titulo": "Instalação",
      "itens": [
       "Cabo blindado entre inversor e motor",
       "Reator ou filtro contra harmônicos",
       "Aterramento curto, em ponto único",
       "Ventilação do painel (perdas ~2 a 3 %)"
      ]
     },
     {
      "titulo": "Falhas comuns",
      "itens": [
       "Sobrecorrente: rampa curta ou motor travado",
       "Subtensão no barramento CC",
       "Sobretemperatura: painel sem ventilação",
       "Fuga à terra: isolação do cabo ou do motor"
      ]
     }
    ]
   },
   {
    "id": "chiller",
    "titulo": "Chillers, HVAC e PMOC",
    "resumo": "Água gelada, supervisão predial e obrigações legais.",
    "tag": "BMS",
    "pdf": "/estudos/refrigeracao/11-chiller.pdf",
    "dica": "Chiller com ΔT de água muito baixo (ex.: 2 K) indica vazão excessiva: energia gasta no bombeamento e capacidade mal aproveitada.",
    "ramos": [
     {
      "titulo": "Chiller",
      "itens": [
       "Água gelada típica: 7 °C ida / 12 °C retorno",
       "TR ≈ vazão (m³/h) · ΔT / 3,02",
       "Chave de fluxo obrigatória",
       "Proteção anticongelamento na saída"
      ]
     },
     {
      "titulo": "Sistema de água",
      "itens": [
       "Bombas primárias e secundárias",
       "Válvulas de 2 ou 3 vias nos fan coils",
       "Torre de resfriamento (condensação a água)",
       "Tratamento químico e purga"
      ]
     },
     {
      "titulo": "Controle de ambiente",
      "itens": [
       "Sensor de ambiente por zona",
       "Fan coil: válvula + velocidade do ventilador",
       "Renovação de ar controlada por CO₂",
       "ABNT NBR 16401: conforto e qualidade do ar"
      ]
     },
     {
      "titulo": "Supervisão (BMS)",
      "itens": [
       "BACnet (IP e MS/TP)",
       "Modbus RTU e TCP",
       "Agendamento horário e setpoints",
       "Tendências e histórico de alarmes"
      ]
     },
     {
      "titulo": "VRF e splits inverter",
      "itens": [
       "Rede própria do fabricante (gateway para o BMS)",
       "Controle central por zonas",
       "Endereçamento das unidades internas",
       "Rateio de consumo por unidade"
      ]
     },
     {
      "titulo": "PMOC e legislação",
      "itens": [
       "Lei 13.589/2018: PMOC em ambientes de uso coletivo",
       "Portaria MS 3.523/1998",
       "RE ANVISA nº 9/2003: qualidade do ar",
       "Responsável técnico com ART",
       "Registros de manutenção rastreáveis"
      ]
     }
    ]
   },
   {
    "id": "diagnostico",
    "titulo": "Diagnóstico de falhas",
    "resumo": "Do sintoma à causa, com as medições certas.",
    "tag": "ALM",
    "pdf": "/estudos/refrigeracao/12-diagnostico.pdf",
    "dica": "Antes de condenar o compressor, meça tensão, corrente e isolação e confira capacitor e relé. Muita troca desnecessária começa sem essas medidas.",
    "ramos": [
     {
      "titulo": "Câmara não gela",
      "itens": [
       "Confira setpoint e parâmetros",
       "Compressor ligado? Meça a corrente",
       "Evaporador com gelo (degelo falhando)",
       "Porta, vedação e carga de produto"
      ]
     },
     {
      "titulo": "Descarga alta",
      "itens": [
       "Condensador sujo ou ventilador parado",
       "Excesso de carga de fluido",
       "Ar ou incondensáveis no sistema",
       "Ar quente recirculando no condensador"
      ]
     },
     {
      "titulo": "Sucção baixa",
      "itens": [
       "Falta de fluido (vazamento)",
       "Filtro secador ou expansão restrita",
       "Evaporador congelado ou ventilador parado",
       "Pouca carga térmica"
      ]
     },
     {
      "titulo": "Compressor desarmando",
      "itens": [
       "Tensão e desequilíbrio entre fases (≤ 2 %)",
       "Corrente acima da nominal (RLA)",
       "Isolação medida com megômetro",
       "Partidas curtas: diferencial pequeno"
      ]
     },
     {
      "titulo": "Ferramentas",
      "itens": [
       "Manifold digital (calcula SA e SR)",
       "Alicate amperímetro true RMS",
       "Termômetro de contato",
       "Detector eletrônico de vazamento",
       "Megômetro, bomba de vácuo e vacuômetro"
      ]
     },
     {
      "titulo": "Boas práticas",
      "itens": [
       "Vácuo ≤ 500 mícrons com teste de subida",
       "Nitrogênio passando durante a brasagem",
       "Teste de estanqueidade com N₂",
       "Registre as leituras na OS e no PMOC"
      ]
     }
    ]
   }
  ],
  "desc": "Ciclo, sensores, superaquecimento, expansão, proteções, degelo, quadro, partidas, inversor, chillers/PMOC e diagnóstico.",
  "cor": "from-cyan-500 to-teal-700"
 }
];
