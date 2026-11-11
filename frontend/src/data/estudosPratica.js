// Prática de cada tópico de "Meus Estudos": exemplo resolvido + questões de fixação.
// Chave: "<coleção>/<tópico>". Em cada questão, `c` é o índice da alternativa correta.
// Valores típicos de campo: confirme sempre no datasheet do fabricante e na norma.

export const PRATICA = {
  // ───────────────────────── Instrumentação Industrial ─────────────────────────
  "instrumentacao/fundamentos": {
    exemplo: {
      enunciado: "Um transmissor de temperatura tem range de −20 a 180 °C e exatidão de ±0,5 % do span. Qual o erro máximo em °C e entre quais valores pode estar a leitura real quando ele indica 100 °C?",
      passos: ["Span = URV − LRV = 180 − (−20) = 200 °C", "Erro máximo = 0,5 % × 200 °C = ±1,0 °C", "Leitura de 100 °C → valor real entre 99 °C e 101 °C"],
      resposta: "±1,0 °C; valor real entre 99 e 101 °C.",
    },
    quiz: [
      { p: "Um instrumento com range de 50 a 250 °C tem span de:", op: ["250 °C", "200 °C", "300 °C", "50 °C"], c: 1, ex: "Span = 250 − 50 = 200 °C." },
      { p: "Qual elemento da malha converte a medição em sinal padrão (ex.: 4–20 mA)?", op: ["Elemento primário", "Controlador", "Transmissor", "Elemento final"], c: 2, ex: "O transmissor condiciona o sinal do sensor e envia o sinal padrão." },
      { p: "A diferença de leitura entre a subida e a descida da variável chama-se:", op: ["Repetibilidade", "Histerese", "Zona morta", "Resolução"], c: 1, ex: "Histerese é a diferença entre as curvas de subida e de descida." },
    ],
  },
  "instrumentacao/simbologia": {
    exemplo: {
      enunciado: "Decodifique o tag PDIT-305 de um P&ID.",
      passos: ["1ª letra P = pressão", "D logo após a 1ª letra = modificador diferencial", "I = indicador · T = transmissor", "305 = número da malha"],
      resposta: "Transmissor indicador de pressão diferencial da malha 305.",
    },
    quiz: [
      { p: "O tag LSHH significa:", op: ["Chave de nível muito alto", "Controlador de nível alto", "Alarme de nível baixo", "Transmissor de nível"], c: 0, ex: "L nível, S chave (switch), HH muito alto." },
      { p: "Balão com linha horizontal cheia indica instrumento:", op: ["No campo", "Atrás do painel", "No painel da sala de controle, acessível ao operador", "Em software (SDCD)"], c: 2, ex: "Linha cheia = painel principal, acessível ao operador." },
      { p: "Na ISA 5.1, a linha tracejada representa:", op: ["Sinal pneumático", "Sinal elétrico", "Capilar", "Conexão ao processo"], c: 1, ex: "Tracejada = elétrico; traços duplos // = pneumático; X = capilar." },
    ],
  },
  "instrumentacao/pressao": {
    exemplo: {
      enunciado: "Um manômetro indica 6,0 bar ao nível do mar. Qual a pressão absoluta e quanto vale a leitura em psi?",
      passos: ["Patm ≈ 1,013 bar", "Pabs = Pman + Patm = 6,0 + 1,013 = 7,013 bar(a)", "Em psi: 6,0 × 14,50 ≈ 87 psi (manométrico, psig)"],
      resposta: "≈ 7,01 bar absoluto; leitura de ≈ 87 psig.",
    },
    quiz: [
      { p: "1 kgf/cm² equivale a aproximadamente:", op: ["1,000 bar", "0,981 bar", "14,50 bar", "0,100 bar"], c: 1, ex: "1 kgf/cm² = 98,07 kPa ≈ 0,981 bar." },
      { p: "Para medir pressão de vapor com manômetro, usa-se:", op: ["Sifão", "Fole", "Amortecedor de pulsação apenas", "Tomada no fundo do tubo"], c: 0, ex: "O sifão forma um selo de condensado e protege o elemento do calor." },
      { p: "Em linhas de gás, a tomada de pressão deve ficar:", op: ["No fundo do tubo", "Na lateral, instrumento abaixo", "No topo, instrumento acima", "Em qualquer posição"], c: 2, ex: "No topo, o condensado volta para a linha e não acumula no instrumento." },
    ],
  },
  "instrumentacao/temperatura": {
    exemplo: {
      enunciado: "Um Pt100 classe B mede 50 °C. Qual a resistência esperada e a tolerância do sensor?",
      passos: ["Pela tabela IEC 60751: R(50 °C) ≈ 119,40 Ω", "Tolerância classe B = ±(0,30 + 0,005 × 50)", "= ±(0,30 + 0,25) = ±0,55 °C"],
      resposta: "≈ 119,4 Ω; tolerância de ±0,55 °C.",
    },
    quiz: [
      { p: "A ligação do Pt100 a 3 fios serve para:", op: ["Aumentar a faixa de medição", "Compensar a resistência do cabo", "Dispensar o transmissor", "Medir dois pontos"], c: 1, ex: "O terceiro fio permite descontar a resistência dos condutores." },
      { p: "Para medir 1 100 °C num forno, o termopar mais indicado é:", op: ["Tipo T", "Tipo J", "Tipo K", "Pt100"], c: 2, ex: "Tipo K vai até ~1 250 °C; T e J não chegam a 1 100 °C." },
      { p: "A compensação de junta fria corrige:", op: ["A temperatura da junção de referência", "A resistência do poço", "O ruído elétrico", "A emissividade"], c: 0, ex: "O termopar mede diferença de temperatura; a junção de referência precisa ser compensada." },
    ],
  },
  "instrumentacao/vazao": {
    exemplo: {
      enunciado: "Placa de orifício para 0–100 m³/h. O transmissor DP (sem extração de raiz) indica 25 % do range de ΔP. Qual a vazão?",
      passos: ["Vazão ∝ √ΔP", "Q = Qmáx × √(ΔP/ΔPmáx) = 100 × √0,25", "Q = 100 × 0,5 = 50 m³/h"],
      resposta: "50 m³/h (e não 25 m³/h).",
    },
    quiz: [
      { p: "O medidor eletromagnético NÃO serve para:", op: ["Água de processo", "Esgoto", "Óleo diesel", "Polpa de minério"], c: 2, ex: "Só mede líquidos condutivos; hidrocarbonetos não conduzem." },
      { p: "O medidor Coriolis mede diretamente:", op: ["Vazão volumétrica", "Vazão mássica", "Velocidade do som", "Pressão diferencial"], c: 1, ex: "Mede vazão mássica e também densidade." },
      { p: "Se o ΔP numa placa de orifício cai para 1/4, a vazão cai para:", op: ["1/4", "1/2", "1/16", "Não muda"], c: 1, ex: "Q ∝ √ΔP → √(1/4) = 1/2." },
    ],
  },
  "instrumentacao/nivel": {
    exemplo: {
      enunciado: "Tanque aberto com óleo de densidade 850 kg/m³. O transmissor no fundo indica 0,25 bar. Qual o nível?",
      passos: ["P = 0,25 bar = 25 000 Pa", "h = P / (ρ · g) = 25 000 / (850 × 9,81)", "h ≈ 3,0 m"],
      resposta: "≈ 3,0 m de óleo.",
    },
    quiz: [
      { p: "Em tanque com muito vapor e espuma, a melhor opção sem contato é:", op: ["Ultrassônico", "Radar", "Boia", "Visor de vidro"], c: 1, ex: "O radar sofre pouco com vapor; o ultrassom é afetado por vapor e espuma." },
      { p: "Em tanque fechado e pressurizado, a medição hidrostática usa:", op: ["Transmissor de pressão manométrica no fundo", "Transmissor de pressão diferencial", "Chave de nível vibratória", "Trena"], c: 1, ex: "O DP desconta a pressão do espaço de vapor." },
      { p: "A medição hidrostática depende de:", op: ["Cor do produto", "Densidade do produto", "Constante dielétrica", "Velocidade do som"], c: 1, ex: "P = ρ · g · h: mudou a densidade, muda a leitura." },
    ],
  },
  "instrumentacao/analiticos": {
    exemplo: {
      enunciado: "Calibração de pH: no tampão 7 o eletrodo lê −5 mV e no tampão 4 lê +165 mV (25 °C). O eletrodo está bom?",
      passos: ["Inclinação = (165 − (−5)) / (7 − 4) = 170 / 3 ≈ 56,7 mV/pH", "Eficiência = 56,7 / 59,16 ≈ 96 %", "Offset em pH 7 = −5 mV (pequeno)"],
      resposta: "Sim: ~96 % da inclinação teórica, dentro do aceitável (acima de ~90 %).",
    },
    quiz: [
      { p: "Um eletrodo de pH ideal, em pH 7, gera:", op: ["0 mV", "59 mV", "−59 mV", "414 mV"], c: 0, ex: "pH 7 é o ponto de zero do eletrodo ideal." },
      { p: "A condutividade é normalmente referida à temperatura de:", op: ["0 °C", "20 °C", "25 °C", "100 °C"], c: 2, ex: "Os medidores compensam para 25 °C." },
      { p: "O O₂ em gases de combustão costuma ser medido por:", op: ["Célula de zircônia", "Turbidímetro", "Eletrodo de vidro", "Pitot"], c: 0, ex: "Sondas de zircônia são o padrão em caldeiras e fornos." },
    ],
  },
  "instrumentacao/sinais": {
    exemplo: {
      enunciado: "Transmissor 0–16 bar envia 14 mA. Fonte de 24 V, resistor HART de 250 Ω, cabo de 50 Ω, transmissor exige 12 V mínimos. Qual a pressão e a malha funciona a 20 mA?",
      passos: ["PV = (14 − 4) / 16 × 16 bar = 10 bar", "Queda a 20 mA: 0,020 × (250 + 50) = 6 V", "Sobra para o transmissor: 24 − 6 = 18 V ≥ 12 V"],
      resposta: "10 bar; a malha funciona (18 V disponíveis).",
    },
    quiz: [
      { p: "Uma corrente de 2 mA na malha indica:", op: ["0 % da escala", "Falha (abaixo de 3,6 mA)", "Valor negativo válido", "Comunicação HART"], c: 1, ex: "Pela NAMUR NE 43, ≤ 3,6 mA é sinal de falha." },
      { p: "Para comunicar HART, a malha precisa de no mínimo:", op: ["50 Ω", "120 Ω", "250 Ω", "1 kΩ"], c: 2, ex: "O sinal FSK precisa de ≥ 250 Ω de carga." },
      { p: "A blindagem do cabo de sinal deve ser aterrada:", op: ["Nas duas pontas", "Em um só ponto (painel)", "Em nenhum ponto", "No campo e no meio do trajeto"], c: 1, ex: "Aterrar em um ponto evita laço de terra." },
    ],
  },
  "instrumentacao/pid": {
    exemplo: {
      enunciado: "No teste de Ziegler–Nichols em malha fechada, o ganho crítico foi Ku = 4 e o período de oscilação Pu = 2 min. Calcule o PID.",
      passos: ["Kp = 0,6 × Ku = 0,6 × 4 = 2,4 (BP ≈ 42 %)", "Ti = Pu / 2 = 1 min/rep", "Td = Pu / 8 = 0,25 min"],
      resposta: "Kp = 2,4; Ti = 1 min; Td = 0,25 min (ponto de partida para ajuste fino).",
    },
    quiz: [
      { p: "A ação que elimina o erro residual (offset) é a:", op: ["Proporcional", "Integral", "Derivativa", "On/off"], c: 1, ex: "A integral acumula o erro até zerá-lo." },
      { p: "Um controle de aquecimento (PV sobe → saída desce) usa ação:", op: ["Direta", "Reversa", "Derivativa", "Split-range"], c: 1, ex: "Ação reversa: a saída age contra o sentido da PV." },
      { p: "Em controle em cascata, a malha mestre ajusta:", op: ["A saída da válvula", "O SP da malha escrava", "O ganho da escrava", "O alarme"], c: 1, ex: "A mestre gera o setpoint da escrava." },
    ],
  },
  "instrumentacao/valvulas": {
    exemplo: {
      enunciado: "Dimensione o Cv para água (G = 1), vazão de 100 gpm e ΔP de 16 psi na válvula.",
      passos: ["Cv = Q / √(ΔP / G)", "Cv = 100 / √(16 / 1) = 100 / 4 = 25", "Kv ≈ 0,865 × 25 ≈ 21,6 (m³/h, bar)"],
      resposta: "Cv = 25 (Kv ≈ 21,6). Escolha a válvula para trabalhar entre ~20 % e 80 % de abertura.",
    },
    quiz: [
      { p: "Válvula de combustível de uma caldeira deve ser:", op: ["FO (falha abre)", "FC (falha fecha)", "FL (falha trava)", "Tanto faz"], c: 1, ex: "Na falta de ar ou sinal, cortar o combustível é o lado seguro." },
      { p: "A característica de vazão mais usada em controle é:", op: ["Linear", "Abertura rápida", "Igual porcentagem", "On/off"], c: 2, ex: "Igual porcentagem compensa a variação de ΔP do sistema." },
      { p: "Malha oscilando em dente de serra mesmo com boa sintonia sugere:", op: ["Válvula com agarramento (stiction)", "Transmissor descalibrado", "Excesso de derivativa", "Cavitação leve"], c: 0, ex: "Stiction gera oscilação típica em dente de serra." },
    ],
  },
  "instrumentacao/calibracao": {
    exemplo: {
      enunciado: "Transmissor 0–10 bar. O padrão aplica 5,000 bar e o transmissor envia 12,10 mA. Critério de aceitação: ±0,5 % do span. Aprova?",
      passos: ["Esperado a 50 %: 4 + 0,5 × 16 = 12,00 mA", "Erro = 12,10 − 12,00 = 0,10 mA", "Em % do span: 0,10 / 16 = 0,625 % > 0,5 %"],
      resposta: "Reprovado “como encontrado”: ajustar e registrar “como deixado”.",
    },
    quiz: [
      { p: "A relação de exatidão padrão/instrumento (TUR) recomendada é de:", op: ["1:1", "2:1", "4:1", "10:1 obrigatório"], c: 2, ex: "O padrão deve ser cerca de 4× melhor que o instrumento." },
      { p: "No ajuste, mexe-se primeiro no:", op: ["Span", "Zero", "Amortecimento", "Range"], c: 1, ex: "O zero desloca toda a curva; o span vem depois." },
      { p: "Calibrar subindo e descendo serve para verificar:", op: ["Histerese", "Rastreabilidade", "Incerteza do padrão", "Tempo de resposta"], c: 0, ex: "A diferença entre subida e descida é a histerese." },
    ],
  },
  "instrumentacao/areas-classificadas": {
    exemplo: {
      enunciado: "Interprete a marcação Ex db IIC T4 Gb e diga se o equipamento pode ser instalado em Zona 1 com um gás de temperatura de ignição de 100 °C.",
      passos: ["Ex db = à prova de explosão, nível b", "IIC = grupo mais severo (serve para IIB e IIA)", "T4 = superfície até 135 °C · Gb = adequado para Zona 1", "135 °C > 100 °C de ignição do gás"],
      resposta: "Zona 1 sim, mas NÃO com esse gás: seria preciso T5 (≤ 100 °C) com margem, ou T6.",
    },
    quiz: [
      { p: "A zona com atmosfera explosiva presente de forma contínua é a:", op: ["Zona 0", "Zona 1", "Zona 2", "Zona 22"], c: 0, ex: "Zona 0: contínua ou por longos períodos." },
      { p: "O grupo de gás mais severo é o:", op: ["IIA", "IIB", "IIC", "I"], c: 2, ex: "IIC inclui hidrogênio e acetileno." },
      { p: "A classe de temperatura T6 limita a superfície a:", op: ["135 °C", "100 °C", "85 °C", "200 °C"], c: 2, ex: "T6 ≤ 85 °C." },
    ],
  },

  // ───────────────────────── Automação de Refrigeração ─────────────────────────
  "refrigeracao/ciclo": {
    exemplo: {
      enunciado: "A carga térmica de uma câmara é 21 000 kcal/h e o compressor consome 8 kW. Converta para BTU/h, TR e kW e calcule o COP.",
      passos: ["BTU/h = 21 000 × 3,968 ≈ 83 330 BTU/h", "TR = 83 330 / 12 000 ≈ 6,9 TR", "kW = 6,9 × 3,517 ≈ 24,4 kW", "COP = 24,4 / 8 ≈ 3,0"],
      resposta: "≈ 83 300 BTU/h ≈ 6,9 TR ≈ 24,4 kW; COP ≈ 3,0.",
    },
    quiz: [
      { p: "O componente que rejeita o calor do ciclo é o:", op: ["Evaporador", "Condensador", "Compressor", "Filtro secador"], c: 1, ex: "O condensador entrega ao ambiente o calor retirado mais o do compressor." },
      { p: "1 TR equivale a:", op: ["9 000 BTU/h", "12 000 BTU/h", "3 412 BTU/h", "1 000 kcal/h"], c: 1, ex: "1 TR = 12 000 BTU/h ≈ 3,517 kW." },
      { p: "Logo após a válvula de expansão o fluido está como:", op: ["Vapor superaquecido", "Líquido sub-resfriado", "Mistura de líquido e vapor", "Gás a alta pressão"], c: 2, ex: "A expansão faz parte do líquido evaporar (flash)." },
    ],
  },
  "refrigeracao/sensores": {
    exemplo: {
      enunciado: "Transdutor ratiométrico 0,5–4,5 V com faixa de 0 a 30 bar indica 2,5 V. Qual a pressão?",
      passos: ["Faixa útil do sinal = 4,5 − 0,5 = 4,0 V", "Fração = (2,5 − 0,5) / 4,0 = 0,5", "P = 0,5 × 30 = 15 bar"],
      resposta: "15 bar. Abaixo de 0,5 V ou acima de 4,5 V, suspeite de falha no transdutor ou no cabo.",
    },
    quiz: [
      { p: "Quando a temperatura sobe, a resistência de um NTC:", op: ["Sobe", "Cai", "Não muda", "Oscila"], c: 1, ex: "NTC = coeficiente negativo de temperatura." },
      { p: "Sensor de sucção em tubo de 5/8″ fica na posição:", op: ["12 horas", "6 horas", "4 ou 8 horas", "Qualquer uma"], c: 0, ex: "Em tubos menores que 7/8″, às 12 h; maiores, às 4 ou 8 h." },
      { p: "O transdutor de pressão deve ser instalado:", op: ["Embaixo do tubo", "Em cima do tubo", "Dentro do evaporador", "Na linha de dreno"], c: 1, ex: "Embaixo, acumula óleo e a leitura fica errada." },
    ],
  },
  "refrigeracao/superaquecimento": {
    tabela: {
      titulo: "Diagnóstico rápido por SA × SR",
      cab: ["SA", "SR", "Causa provável"],
      linhas: [
        ["Alto", "Baixo", "Falta de fluido (vazamento)"],
        ["Alto", "Alto", "Restrição: filtro secador, solenoide ou expansão"],
        ["Baixo", "Alto", "Excesso de carga de fluido"],
        ["Baixo", "Normal", "Expansão alimentando demais, bulbo solto ou pouca carga térmica"],
        ["Normal", "Normal", "Ciclo ok: procure a falha fora do circuito (ar, sensores, comando)"],
      ],
    },
    exemplo: {
      enunciado: "Split R-410A: sucção 8,3 bar(man.) e tubo de sucção a 12 °C; alta 26,3 bar(man.) e linha de líquido a 39 °C. Calcule SA e SR.",
      passos: ["Tabela R-410A: 8,3 bar(man.) ≈ +5 °C de saturação", "SA = 12 − 5 = 7 K", "Tabela R-410A: 26,3 bar(man.) ≈ +45 °C de saturação", "SR = 45 − 39 = 6 K"],
      resposta: "SA = 7 K e SR = 6 K: ciclo dentro do típico. Confira os valores do fabricante.",
    },
    quiz: [
      { p: "SA alto e SR baixo indicam, em geral:", op: ["Excesso de fluido", "Falta de fluido", "Condensador sujo", "Bulbo solto"], c: 1, ex: "Pouco fluido: o evaporador fica faminto (SA alto) e falta líquido no condensador (SR baixo)." },
      { p: "SA alto e SR alto indicam, em geral:", op: ["Restrição na linha de líquido ou na expansão", "Falta de fluido", "Pouca carga térmica", "Ventilador do evaporador parado"], c: 0, ex: "O líquido fica retido antes da restrição (SR alto) e falta no evaporador (SA alto)." },
      { p: "Um sistema com tubo capilar deve ser carregado pelo:", op: ["Sub-resfriamento", "Superaquecimento", "Peso na balança apenas", "Corrente do compressor"], c: 1, ex: "Expansão fixa: carga pelo SA; VET/EEV: carga pelo SR." },
    ],
  },
  "refrigeracao/expansao": {
    exemplo: {
      enunciado: "Câmara com VET apresenta SA de 14 K. O filtro secador está com 4 K de diferença entre entrada e saída. Qual o diagnóstico?",
      passos: ["SA alto → evaporador recebendo pouco fluido", "Queda de temperatura no filtro = perda de carga (restrição)", "Antes de mexer na VET, resolva a restrição"],
      resposta: "Filtro secador obstruído: trocar o filtro, refazer vácuo e conferir o SA.",
    },
    quiz: [
      { p: "A VET com equalização externa é indicada quando:", op: ["O evaporador tem distribuidor ou grande perda de carga", "O sistema é muito pequeno", "Não há bulbo", "O fluido é R-22"], c: 0, ex: "A equalização externa compensa a queda de pressão no evaporador." },
      { p: "VET superdimensionada costuma causar:", op: ["SA estável", "Oscilação do SA (hunting)", "Sub-resfriamento alto", "Pressão de descarga baixa"], c: 1, ex: "Ela abre e fecha demais, fazendo o SA oscilar." },
      { p: "A válvula eletrônica (EEV) controla o SA lendo:", op: ["Só a temperatura ambiente", "Pressão e temperatura da sucção", "A corrente do compressor", "A pressão de descarga"], c: 1, ex: "O driver calcula o SA com transdutor de pressão + sensor de temperatura." },
    ],
  },
  "refrigeracao/pressostatos": {
    exemplo: {
      enunciado: "Descreva a sequência do pump-down numa câmara com solenoide na linha de líquido e pressostato de baixa.",
      passos: ["Câmara atinge o SP → controlador desliga a solenoide", "Compressor continua e recolhe o fluido no condensador/tanque", "Sucção cai → pressostato de baixa desliga o compressor", "Câmara esquenta → solenoide abre → sucção sobe → pressostato religa o compressor"],
      resposta: "O compressor para com o evaporador vazio, evitando partida com líquido no cárter.",
    },
    quiz: [
      { p: "O pressostato de alta deve ter rearme:", op: ["Automático", "Manual", "Por tempo", "Remoto apenas"], c: 1, ex: "É proteção de segurança: alguém precisa verificar a causa." },
      { p: "O relé de sequência de fase protege principalmente:", op: ["O compressor scroll girando ao contrário", "A resistência de degelo", "O sensor NTC", "A solenoide"], c: 0, ex: "O scroll só comprime em um sentido de rotação." },
      { p: "O temporizador anti-reciclagem costuma ficar entre:", op: ["5 e 10 s", "30 e 60 s", "3 e 5 min", "30 e 60 min"], c: 2, ex: "Dá tempo para as pressões equalizarem e limita partidas por hora." },
    ],
  },
  "refrigeracao/controlador": {
    exemplo: {
      enunciado: "Controlador com SP = 2 °C e diferencial de 2 K (aplicado acima do SP). Em que temperaturas o compressor liga e desliga?",
      passos: ["Desliga ao atingir o SP: 2 °C", "Liga em SP + diferencial: 2 + 2 = 4 °C", "Câmara oscila entre 2 e 4 °C (média ≈ 3 °C)"],
      resposta: "Liga a 4 °C e desliga a 2 °C. Confira no manual se o diferencial é aplicado acima ou abaixo do SP.",
    },
    quiz: [
      { p: "O parâmetro de offset do sensor serve para:", op: ["Mudar o setpoint", "Corrigir a leitura do sensor", "Atrasar o degelo", "Ligar o alarme"], c: 1, ex: "O offset corrige o desvio da medição." },
      { p: "Os ventiladores do evaporador esperam após o degelo para:", op: ["Economizar energia", "Escorrer a água e não lançar gotas no produto", "Esquentar a câmara", "Testar o sensor"], c: 1, ex: "É o tempo de gotejamento e de resfriamento das aletas." },
      { p: "Com falha do sensor ambiente, o ideal é o controlador:", op: ["Desligar tudo", "Entrar em modo de emergência (ciclo fixo)", "Ligar o degelo", "Ignorar e seguir"], c: 1, ex: "O ciclo fixo mantém o frio até a manutenção." },
    ],
  },
  "refrigeracao/degelo": {
    exemplo: {
      enunciado: "Evaporador com 3 resistências de 800 W em 220 V. Calcule a resistência de cada uma e a corrente total (monofásico).",
      passos: ["R = U² / P = 220² / 800 = 60,5 Ω (cada)", "Potência total = 3 × 800 = 2 400 W", "I = P / U = 2 400 / 220 ≈ 10,9 A"],
      resposta: "≈ 60 Ω por resistência; ≈ 11 A no circuito. Contator em AC-1 com folga acima de 11 A.",
    },
    quiz: [
      { p: "O fim de degelo mais eficiente é por:", op: ["Tempo fixo apenas", "Temperatura do evaporador", "Pressão de descarga", "Porta aberta"], c: 1, ex: "Termina quando o gelo acabou, com o tempo máximo como segurança." },
      { p: "O degelo natural (por parada) funciona bem em câmaras:", op: ["De congelados a −25 °C", "Acima de ~+2 °C", "De túnel de congelamento", "Qualquer uma"], c: 1, ex: "Acima de ~+2 °C o próprio ar da câmara derrete o gelo." },
      { p: "Gelo acumulado na bandeja e no dreno indica falha na:", op: ["Resistência da bandeja ou do dreno", "Solenoide", "Válvula de expansão", "Sonda de ambiente"], c: 0, ex: "A água congela antes de escoar." },
    ],
  },
  "refrigeracao/quadro": {
    exemplo: {
      enunciado: "Compressor trifásico 220 V de 7,5 kW, cos φ = 0,85 e rendimento 0,90. Estime a corrente e um cabo inicial.",
      passos: ["I = P / (√3 × U × cos φ × η)", "I = 7 500 / (1,732 × 220 × 0,85 × 0,90) ≈ 25,7 A", "Cobre/PVC, método B1, 3 condutores: 6 mm² (≈ 36 A) como ponto de partida", "Verificar queda de tensão e fatores de correção"],
      resposta: "≈ 26 A (use a RLA do datasheet); cabo inicial de 6 mm², a confirmar pela NBR 5410.",
    },
    quiz: [
      { p: "O IDR de 30 mA é obrigatório principalmente em:", op: ["Circuito do compressor", "Tomadas e iluminação", "Circuito de comando 24 V", "Barramento de terra"], c: 1, ex: "Proteção de pessoas contra choque em circuitos de uso geral." },
      { p: "Os pressostatos de alta e baixa ficam ligados:", op: ["Em paralelo na potência", "Em série no circuito de comando", "No circuito do sensor", "No neutro"], c: 1, ex: "Qualquer um que abrir corta o comando do compressor." },
      { p: "O esquema de aterramento recomendado para o quadro é:", op: ["TN-C", "TN-S", "IT sem neutro", "Sem aterramento"], c: 1, ex: "TN-S separa neutro e terra." },
    ],
  },
  "refrigeracao/partida": {
    exemplo: {
      enunciado: "Hermético monofásico sem identificação. Medições: 4,5 Ω, 1,5 Ω e 6,0 Ω entre os pares de terminais. Identifique C, S e R.",
      passos: ["Confira: 4,5 + 1,5 = 6,0 Ω ✓ (enrolamentos íntegros)", "O par de maior resistência (6,0 Ω) é S-R; o terceiro terminal é C", "Do comum, o menor valor (1,5 Ω) vai para R; o outro (4,5 Ω) para S"],
      resposta: "C = terminal fora do par de 6 Ω; C-R = 1,5 Ω; C-S = 4,5 Ω.",
    },
    quiz: [
      { p: "A partida estrela-triângulo reduz a corrente de partida para:", op: ["1/2", "1/3", "1/4", "Não reduz"], c: 1, ex: "Em estrela, cada bobina recebe U/√3, e a corrente de linha cai a ~1/3." },
      { p: "O soft-starter permite variar a velocidade em regime?", op: ["Sim", "Não", "Só em monofásicos", "Só com bypass aberto"], c: 1, ex: "Ele só controla a rampa de partida e de parada." },
      { p: "A partida part-winding é típica de:", op: ["Compressores semi-herméticos", "Splits monofásicos", "Ventiladores EC", "Bombas de dreno"], c: 0, ex: "Esses motores têm enrolamento dividido em duas metades." },
    ],
  },
  "refrigeracao/inversor": {
    exemplo: {
      enunciado: "Motor de 4 polos alimentado a 45 Hz: qual a rotação síncrona? E se um ventilador passar a 75 % da rotação, quanto cai a potência?",
      passos: ["n = 120 × f / p = 120 × 45 / 4 = 1 350 rpm (síncrona)", "Leis de afinidade: P ∝ n³", "0,75³ ≈ 0,42 → potência ≈ 42 % da original"],
      resposta: "1 350 rpm; economia de ~58 % na potência do ventilador.",
    },
    quiz: [
      { p: "Rotação síncrona de motor de 2 polos em 60 Hz:", op: ["1 800 rpm", "3 600 rpm", "1 200 rpm", "900 rpm"], c: 1, ex: "120 × 60 / 2 = 3 600 rpm." },
      { p: "O cabo entre inversor e motor deve ser:", op: ["Paralelo comum", "Blindado", "Sem aterramento", "O mais longo possível"], c: 1, ex: "Reduz a interferência gerada pelo PWM." },
      { p: "Em bombas e ventiladores, a potência varia com a rotação:", op: ["Linearmente", "Ao quadrado", "Ao cubo", "Não varia"], c: 2, ex: "Vazão ∝ n, pressão ∝ n², potência ∝ n³." },
    ],
  },
  "refrigeracao/chiller": {
    exemplo: {
      enunciado: "Chiller com vazão de água gelada de 36 m³/h, ida a 7 °C e retorno a 12 °C. Qual a capacidade em TR e kW?",
      passos: ["ΔT = 12 − 7 = 5 K", "TR ≈ vazão × ΔT / 3,02 = 36 × 5 / 3,02 ≈ 59,6 TR", "kW ≈ 1,163 × 36 × 5 ≈ 209 kW"],
      resposta: "≈ 60 TR ≈ 209 kW.",
    },
    quiz: [
      { p: "O PMOC em ambientes climatizados de uso coletivo é exigido pela:", op: ["NR-12", "Lei 13.589/2018", "NBR 5410", "NR-35"], c: 1, ex: "A lei torna o PMOC obrigatório; a Portaria MS 3.523/1998 e a RE ANVISA 9/2003 complementam." },
      { p: "Protocolo aberto muito usado em automação predial (BMS):", op: ["BACnet", "HART", "Profibus PA", "Foundation Fieldbus H1"], c: 0, ex: "BACnet foi criado para automação predial." },
      { p: "A chave de fluxo (flow switch) do chiller serve para:", op: ["Medir a vazão exata", "Impedir operação sem vazão de água", "Controlar a torre", "Ligar a bomba"], c: 1, ex: "Sem vazão, o evaporador pode congelar e romper." },
    ],
  },
  "refrigeracao/diagnostico": {
    tabela: {
      titulo: "Sintoma → causa → correção",
      cab: ["Sintoma", "Causa provável", "Correção"],
      linhas: [
        ["Descarga alta", "Condensador sujo ou ventilador parado", "Limpar condensador, testar motor e capacitor do ventilador"],
        ["Sucção baixa e SA alto", "Falta de fluido", "Localizar vazamento, reparar, vácuo e carga"],
        ["Evaporador em bloco de gelo", "Degelo falhando", "Medir resistências (Ω), sensor de fim de degelo e parâmetros"],
        ["Compressor desarmando no térmico", "Tensão baixa, desequilíbrio ou partida com carga", "Medir tensão e corrente por fase, conferir capacitor e relé"],
        ["Câmara não atinge o SP", "Porta, vedação, carga de produto ou sensor", "Revisar vedação e cortina, conferir offset e posição do sensor"],
      ],
    },
    exemplo: {
      enunciado: "Câmara de congelados está a −10 °C (SP −20 °C). Sucção baixa, SA de 18 K, SR de 1 K e corrente do compressor abaixo da nominal. Qual o diagnóstico?",
      passos: ["Sucção baixa + SA alto → evaporador com pouco fluido", "SR baixo → pouco líquido no condensador", "Corrente baixa → compressor bombeando pouca massa", "Conjunto aponta para falta de fluido"],
      resposta: "Vazamento: localizar e reparar, teste com N₂, vácuo ≤ 500 mícrons e carga correta.",
    },
    quiz: [
      { p: "Descarga alta com condensador sujo: a ação correta é:", op: ["Retirar fluido", "Limpar o condensador e conferir o ventilador", "Trocar a VET", "Aumentar o SP"], c: 1, ex: "Retirar fluido mascara o problema." },
      { p: "O vácuo recomendado antes da carga é de:", op: ["≤ 500 mícrons, com teste de subida", "≤ 5 000 mícrons", "−0,5 bar no manifold", "Basta 5 minutos de bomba"], c: 0, ex: "O vacuômetro em mícrons é a única forma de comprovar desidratação." },
      { p: "O desequilíbrio máximo de tensão entre fases recomendado para compressores é de cerca de:", op: ["2 %", "10 %", "20 %", "Não importa"], c: 0, ex: "Desequilíbrio maior aquece o motor e reduz sua vida útil." },
    ],
  },
};
