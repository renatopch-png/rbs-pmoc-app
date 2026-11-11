// Fichas visuais de Instrumentação Industrial ("Meu Estudo").
// Cada ficha: ilustração com peças numeradas, cadeia funcional, exemplo numérico,
// alerta e ponto-chave. Valores típicos: confirme sempre no datasheet e na norma.
import { C, svg, t, pipeH, pipeV, flange, flangeH, tx, gauge, tank, valve, block, arrow, wave, mk } from "./fichasArte";

export const MODULOS = [
  "Fundamentos", "Sinais analógicos", "Pressão", "Temperatura", "Vazão",
  "Nível", "Válvulas de controle", "Controle de processo", "Automação e redes", "Calibração e segurança",
];

const F = [
  // ───────────── Módulo 1 · Fundamentos ─────────────
  {
    id: "variaveis", mod: 0, titulo: "As 5 variáveis de processo", sub: "Pressão, temperatura, nível, vazão e análise aparecem em quase toda planta.",
    arte: svg(
      tank(28, 52, 78, 128, 0.55) + tx(67, 52, 0.85, "62%") + pipeV(67, 180, 204) + pipeH(28, 306, 204) +
      gauge(146, 172, 15, -60) + tx(200, 196, 0.85, "84°C") +
      `<rect x="240" y="190" width="34" height="28" rx="4" fill="url(#fvBl)" stroke="${C.navy}"/>` + tx(257, 190, 0.8, "12.4") +
      block(250, 34, 56, 34, "pH|7,02", C.navy, "#fff", 9) + `<line x1="292" y1="68" x2="292" y2="196" stroke="${C.green}" stroke-width="2" stroke-dasharray="4 3"/>` +
      arrow(36, 230, 300, 230, C.waterD, 1.4) + t(168, 226, "fluxo do processo", { s: 7, c: C.muted, w: 400 }) +
      mk(1, 146, 132, 146, 156) + mk(2, 200, 120, 200, 140) + mk(3, 22, 30, 52, 30) + mk(4, 257, 116, 257, 136) + mk(5, 236, 24)
    ),
    partes: [
      ["Pressão (P)", "Força por área. Unidades: bar, kPa, psi, kgf/cm²."],
      ["Temperatura (T)", "Estado térmico do fluido. Unidades: °C, K."],
      ["Nível (L)", "Altura ou volume no recipiente. Unidades: %, mm, m."],
      ["Vazão (F)", "Quanto passa por tempo: m³/h (volumétrica) ou kg/h (mássica)."],
      ["Analítica (A)", "Composição e qualidade: pH, condutividade, O₂, turbidez."],
    ],
    cadeia: [["Factory", "Processo"], ["Target", "Variável"], ["Gauge", "Sensor"], ["Activity", "Sinal"], ["Cpu", "Controle"]],
    exemplo: [["Caldeira", "P = 10 bar(man.)"], ["Vapor saturado", "T ≈ 184 °C"], ["Tubulão", "L = 50 %"], ["Produção", "F = 2 t/h"]],
    atencao: "Antes de escolher o instrumento, defina qual variável medir, em que unidade e com que exatidão.",
    chave: "Quase todo instrumento de campo mede uma dessas cinco grandezas.",
  },
  {
    id: "malha", mod: 0, titulo: "Malha de controle fechada", sub: "Medir, comparar com o setpoint e corrigir, sem parar.",
    arte: svg(
      tank(24, 70, 92, 120, 0.6) + `<path d="M36 170 h68" stroke="${C.red}" stroke-width="3" stroke-dasharray="6 3"/>` +
      pipeH(116, 196, 112, 12) + tx(150, 106, 0.8, "76°C") + block(180, 20, 62, 34, "TIC|SP 80 °C", C.navy, "#fff", 8.5) +
      `<path d="M150 58 V37 H180" fill="none" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="5 3"/>` +
      `<path d="M242 37 H272 V122" fill="none" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="5 3"/>` +
      pipeH(116, 306, 190, 14) + valve(272, 190, 0.85) + t(292, 216, "vapor", { s: 7.5, c: C.muted, w: 400 }) +
      mk(1, 128, 150, 140, 112) + mk(2, 168, 70, 156, 76) + mk(3, 211, 72) + mk(4, 300, 150, 280, 160) + mk(5, 44, 52, 60, 80) + mk(6, 250, 64, 230, 50)
    ),
    partes: [
      ["Elemento primário", "Sensor em contato com o processo (ex.: Pt100 no poço)."],
      ["Transmissor", "Converte a medição em 4–20 mA ou sinal digital."],
      ["Controlador", "Compara PV com SP e calcula a saída (PID)."],
      ["Elemento final", "Válvula, inversor ou damper que age no processo."],
      ["Processo", "Tanque aquecido: a variável que queremos manter."],
      ["Setpoint (SP)", "Valor desejado, definido pela operação."],
    ],
    cadeia: [["Gauge", "Medir"], ["Scale", "Comparar"], ["Cpu", "Decidir"], ["SlidersHorizontal", "Atuar"], ["Repeat", "Realimentar"]],
    exemplo: [["SP", "80 °C"], ["PV", "76 °C"], ["Erro", "+4 °C"], ["Saída", "62 % (válvula abre)"]],
    atencao: "Em manual (malha aberta), ninguém corrige os distúrbios: a variável deriva.",
    chave: "Toda malha fechada mede, compara com o SP e corrige continuamente.",
  },
  {
    id: "range-span", mod: 0, titulo: "Range, span e exatidão", sub: "A linguagem para especificar e conferir qualquer instrumento.",
    arte: svg(
      `<rect x="30" y="92" width="260" height="22" rx="4" fill="${C.steelL}" stroke="${C.steelD}"/>` +
      `<rect x="30" y="92" width="130" height="22" rx="4" fill="${C.water}"/>` +
      Array.from({ length: 11 }, (_, i) => `<line x1="${30 + i * 26}" y1="114" x2="${30 + i * 26}" y2="${i % 5 ? 120 : 126}" stroke="${C.ink}"/>`).join("") +
      t(30, 138, "−20 °C", { s: 9 }) + t(290, 138, "180 °C", { s: 9 }) + t(160, 138, "80 °C", { s: 8, c: C.muted }) +
      arrow(160, 60, 32, 60, C.green) + arrow(160, 60, 288, 60, C.green) + t(160, 54, "SPAN = 200 °C", { s: 10, c: C.green }) +
      `<rect x="150" y="160" width="20" height="40" fill="${C.orange}" opacity=".18"/><line x1="160" y1="156" x2="160" y2="204" stroke="${C.orange}" stroke-width="2"/>` +
      t(160, 218, "±0,5 °C", { s: 9, c: C.orange }) + `<path d="M30 180 H290" stroke="${C.ink}" stroke-width="1"/>` +
      mk(1, 30, 166, 30, 116) + mk(2, 290, 166, 290, 116) + mk(3, 230, 36) + mk(4, 196, 190, 172, 186)
    ),
    partes: [
      ["LRV", "Valor inferior da faixa (4 mA). Aqui, −20 °C."],
      ["URV", "Valor superior da faixa (20 mA). Aqui, 180 °C."],
      ["Span", "Largura da faixa: URV − LRV = 200 °C."],
      ["Erro admissível", "Exatidão de ±0,25 % do span = ±0,5 °C em qualquer ponto."],
    ],
    cadeia: [["Ruler", "Definir range"], ["Calculator", "Calcular span"], ["Target", "Aplicar exatidão"], ["ClipboardCheck", "Conferir leitura"]],
    exemplo: [["Range", "−20 a 180 °C"], ["Span", "200 °C"], ["Exatidão", "±0,25 % do span"], ["Erro máximo", "±0,5 °C"]],
    atencao: "% do span não é % da leitura: em leituras baixas o erro relativo fica grande.",
    chave: "Range diz onde a faixa começa e termina; span diz o tamanho dela.",
  },

  // ───────────── Módulo 2 · Sinais analógicos ─────────────
  {
    id: "curva-4-20", mod: 1, titulo: "Curva de transferência 4–20 mA", sub: "Uma reta liga o valor do processo à corrente da malha.",
    arte: svg(
      `<path d="M50 200 H300 M50 200 V20" stroke="${C.ink}" stroke-width="1.6"/>` +
      `<rect x="50" y="200" width="250" height="20" fill="${C.red}" opacity=".08"/>` +
      `<line x1="50" y1="170" x2="290" y2="40" stroke="${C.blue}" stroke-width="3.5"/>` +
      [["4", 170], ["12", 105], ["20", 40]].map(([v, y]) => t(42, y + 3, v, { s: 9, a: "end" }) + `<line x1="50" y1="${y}" x2="290" y2="${y}" stroke="${C.steelL}"/>`).join("") +
      `<line x1="50" y1="184" x2="290" y2="184" stroke="${C.red}" stroke-dasharray="4 3"/>` + t(296, 187, "3,6", { s: 8, c: C.red, a: "start" }) +
      `<line x1="50" y1="32" x2="290" y2="32" stroke="${C.red}" stroke-dasharray="4 3"/>` + t(296, 35, "21", { s: 8, c: C.red, a: "start" }) +
      `<path d="M170 105 H50 M170 105 V200" stroke="${C.orange}" stroke-dasharray="4 3"/><circle cx="170" cy="105" r="5" fill="${C.orange}"/>` +
      t(50, 214, "0 %", { s: 8 }) + t(170, 214, "50 %", { s: 8 }) + t(290, 214, "100 %", { s: 8 }) + t(18, 110, "mA", { s: 8, c: C.muted }) +
      mk(1, 74, 150, 54, 168) + mk(2, 268, 62, 288, 42) + mk(3, 200, 120, 190, 94) + mk(4, 120, 230, 120, 190) + mk(5, 140, 22, 140, 32)
    ),
    partes: [
      ["Zero vivo", "4 mA = 0 % = LRV. Corrente mínima mantém o transmissor alimentado."],
      ["Fim de escala", "20 mA = 100 % = URV."],
      ["Reta", "I = 4 + 16 × (% / 100)."],
      ["Falha baixa", "≤ 3,6 mA (NAMUR NE 43): cabo rompido ou transmissor com defeito."],
      ["Falha alta", "≥ 21 mA: falha detectada pelo próprio transmissor."],
    ],
    cadeia: [["Gauge", "Valor do processo"], ["Calculator", "% da faixa"], ["Activity", "mA na malha"], ["Cpu", "Cartão AI"], ["Monitor", "Engenharia"]],
    exemplo: [["Range", "0 a 10 bar"], ["Pressão", "5 bar"], ["Posição", "50 %"], ["Saída", "12 mA"]],
    atencao: "O 0–20 mA não diferencia “zero” de “fio rompido”. Por isso a indústria adota 4–20 mA.",
    chave: "% = (mA − 4) / 16. Ex.: 8 mA = 25 %.",
  },
  {
    id: "loop-2-4-fios", mod: 1, titulo: "Ligação a 2 fios e a 4 fios", sub: "Quem alimenta o transmissor muda a forma de ligar.",
    arte: svg(
      block(16, 30, 60, 40, "Fonte|24 Vcc", C.navy, "#fff") + block(16, 140, 60, 40, "Cartão AI|250 Ω", C.paper) +
      tx(150, 112, 0.9, "12.0") + `<path d="M76 44 H130 V60 M76 160 H150 V112" fill="none" stroke="${C.red}" stroke-width="2"/>` +
      `<path d="M76 56 H100 V150 H76" fill="none" stroke="${C.ink}" stroke-width="2"/>` + t(150, 132, "2 fios", { s: 9, c: C.blue }) +
      `<line x1="196" y1="20" x2="196" y2="220" stroke="${C.steelL}" stroke-width="2"/>` +
      tx(258, 112, 0.9, "12.0") + block(222, 150, 70, 30, "Rede 220 V", C.yellow, C.ink) + `<path d="M258 150 V124" stroke="${C.ink}" stroke-width="2"/>` +
      block(222, 24, 70, 30, "Cartão AI", C.paper) + `<path d="M246 54 V60 M270 54 V60" stroke="${C.red}" stroke-width="2"/>` + t(258, 206, "4 fios", { s: 9, c: C.blue }) +
      mk(1, 46, 16) + mk(2, 172, 50, 162, 70) + mk(3, 46, 196) + mk(4, 300, 92, 276, 92) + mk(5, 300, 14)
    ),
    partes: [
      ["Fonte 24 Vcc", "Alimenta a malha. Pode estar no próprio cartão (entrada ativa)."],
      ["Transmissor 2 fios", "Os mesmos dois fios levam energia e sinal (alimentado pela malha)."],
      ["Entrada analógica", "Lê a corrente; o resistor de 250 Ω converte em 1–5 V."],
      ["Transmissor 4 fios", "Alimentação separada (rede) e saída 4–20 mA própria."],
      ["Ativa × passiva", "Saída ativa (que fornece corrente) só vai em entrada passiva."],
    ],
    cadeia: [["Plug", "Fonte"], ["Gauge", "Transmissor"], ["Cable", "Cabo"], ["Cpu", "Cartão AI"], ["Monitor", "Supervisório"]],
    exemplo: [["Fonte", "24 V"], ["Carga", "250 Ω + 50 Ω de cabo"], ["Queda a 20 mA", "6 V"], ["Sobra", "18 V ≥ 12 V mín. ✓"]],
    atencao: "Não alimente a mesma malha duas vezes: saída ativa em entrada ativa pode danificar o cartão.",
    chave: "No 2 fios, a corrente que mede é a mesma que alimenta o transmissor.",
  },
  {
    id: "hart", mod: 1, titulo: "Protocolo HART", sub: "Comunicação digital sobreposta ao 4–20 mA, no mesmo par de fios.",
    arte: svg(
      `<path d="M20 120 H300" stroke="${C.blue}" stroke-width="5" opacity=".35"/>` + wave(30, 300, 120, 9, 16, C.orange, 2) +
      t(160, 98, "1 200 Hz = 1 · 2 200 Hz = 0", { s: 8.5, c: C.orange }) + t(40, 144, "12 mA (analógico)", { s: 8, c: C.blue, a: "start" }) +
      tx(250, 210, 0.95, "PV") + block(20, 168, 66, 42, "Comunicador|HART", C.navy, "#fff") +
      `<rect x="110" y="178" width="40" height="14" rx="2" fill="#f5e3c8" stroke="${C.ink}"/>` + t(130, 188, "250 Ω", { s: 7.5 }) +
      `<path d="M86 189 H110 M150 189 H228" stroke="${C.ink}" stroke-width="1.6"/>` +
      block(200, 22, 104, 48, "PV vazão|SV densidade|TV temperatura", C.paper, C.ink, 8) +
      mk(1, 30, 150) + mk(2, 140, 82) + mk(3, 130, 212, 130, 192) + mk(4, 54, 152) + mk(5, 186, 34)
    ),
    partes: [
      ["Sinal analógico", "A corrente 4–20 mA continua levando a variável principal (PV)."],
      ["FSK", "Tons de 1 200 Hz (bit 1) e 2 200 Hz (bit 0) sobrepostos ao sinal."],
      ["Resistor ≥ 250 Ω", "Sem essa carga na malha não há comunicação."],
      ["Comunicador", "Ligado em paralelo: configura range, tag, diagnóstico."],
      ["Variáveis", "PV, SV, TV e QV: um transmissor, várias medições."],
    ],
    cadeia: [["Radio", "Comunicador"], ["Activity", "FSK na malha"], ["Gauge", "Transmissor"], ["Database", "Resposta digital"]],
    exemplo: [["Medidor", "Coriolis"], ["PV (mA)", "Vazão mássica"], ["SV", "Densidade"], ["TV", "Temperatura"]],
    atencao: "Sem cerca de 250 Ω na malha, o comunicador não conversa com o transmissor.",
    chave: "O FSK tem média zero: não altera a leitura do 4–20 mA.",
  },

  // ───────────── Módulo 3 · Pressão ─────────────
  {
    id: "transmissor-pressao", mod: 2, titulo: "Transmissor de pressão", sub: "Do contato com o processo ao sinal que chega ao sistema.",
    arte: svg(
      tx(150, 214, 3.4, "5.25") +
      `<rect x="134" y="194" width="32" height="6" fill="${C.orange}" opacity=".85"/>` +
      `<rect x="138" y="165" width="24" height="16" fill="#fff6d6" stroke="${C.ink}" stroke-width=".8"/>` + t(150, 176, "sensor", { s: 6.5 }) +
      `<rect x="96" y="66" width="22" height="34" fill="#2e7d4f" stroke="${C.ink}" stroke-width=".8"/>` +
      Array.from({ length: 4 }, (_, i) => `<rect x="100" y="${70 + i * 8}" width="14" height="4" fill="#c9a227"/>`).join("") +
      mk(1, 104, 222, 140, 220) + mk(2, 196, 200, 166, 197) + mk(3, 206, 168, 162, 173) + mk(4, 70, 84, 96, 84) + mk(5, 226, 82, 214, 82) + mk(6, 182, 30, 162, 60)
    ),
    partes: [
      ["Conexão ao processo", "Rosca (ex.: ½″ NPT) ou flange por onde a pressão chega."],
      ["Diafragma isolador", "Separa o fluido do processo; o óleo de enchimento transmite a pressão."],
      ["Sensor", "Capacitivo ou piezorresistivo: pressão vira grandeza elétrica."],
      ["Eletrônica", "Linearização, compensação de temperatura e diagnóstico."],
      ["Saída", "4–20 mA + HART ou rede digital (Profibus PA, Fieldbus)."],
      ["Indicador local", "Display com o valor em unidade de engenharia."],
    ],
    cadeia: [["Gauge", "Pressão"], ["Layers", "Diafragma"], ["Zap", "Sensor"], ["Cpu", "Eletrônica"], ["Activity", "4–20 mA"], ["Monitor", "CLP/SDCD"]],
    exemplo: [["Range", "0 a 16 bar"], ["Pressão real", "4 bar"], ["Posição", "25 %"], ["Saída", "8 mA"]],
    atencao: "Pressão acima do limite de sobrepressão deforma o diafragma e deixa erro permanente.",
    chave: "O sensor sente a pressão; a eletrônica a traduz em sinal padrão.",
  },
  {
    id: "bourdon", mod: 2, titulo: "Manômetro de Bourdon", sub: "Indicação local robusta, sem energia elétrica.",
    arte: svg(
      `<circle cx="160" cy="104" r="86" fill="url(#fvSt)" stroke="${C.steelD}" stroke-width="1.5"/><circle cx="160" cy="104" r="78" fill="url(#fvFace)" stroke="${C.steelD}"/>` +
      `<path d="M118 178 C70 160 70 60 140 50 C200 44 222 90 210 120" fill="none" stroke="#c9a227" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M210 120 L180 112" stroke="${C.ink}" stroke-width="2.5"/><path d="M168 96 A16 16 0 0 1 184 116" fill="none" stroke="${C.ink}" stroke-width="4"/>` +
      `<line x1="160" y1="104" x2="112" y2="62" stroke="${C.orange}" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="104" r="5" fill="${C.ink}"/>` +
      `<rect x="146" y="186" width="28" height="44" fill="url(#fvStV)" stroke="${C.steelD}"/>` + t(160, 160, "bar", { s: 10, c: C.muted }) +
      mk(1, 52, 120, 76, 120) + mk(2, 238, 140, 205, 116) + mk(3, 214, 70, 178, 106) + mk(4, 270, 40, 228, 64) + mk(5, 206, 216, 174, 214) + mk(6, 110, 30, 128, 44)
    ),
    partes: [
      ["Tubo de Bourdon", "Tubo curvo e achatado que tende a se abrir com a pressão."],
      ["Articulação", "Liga a ponta do tubo ao setor dentado."],
      ["Setor e pinhão", "Amplificam o pequeno movimento do tubo."],
      ["Mostrador", "Escala na unidade (bar, kgf/cm², psi)."],
      ["Soquete", "Rosca de conexão ao processo."],
      ["Ponteiro", "Indica a pressão; com glicerina, vibra menos."],
    ],
    cadeia: [["Gauge", "Pressão"], ["Spline", "Tubo abre"], ["Settings", "Setor gira"], ["Eye", "Ponteiro indica"]],
    exemplo: [["Escala", "0 a 16 bar"], ["Operação normal", "4 a 12 bar"], ["Faixa ideal", "25 % a 75 % da escala"], ["Prova hidrostática", "use outro manômetro"]],
    atencao: "Ponteiro vibrando: use glicerina ou amortecedor. Vapor: sempre com sifão.",
    chave: "Escolha a escala para operar perto do meio do mostrador.",
  },
  {
    id: "manifold", mod: 2, titulo: "Manifold de 3 e 5 vias", sub: "Válvulas que isolam, equalizam e drenam a célula DP.",
    arte: svg(
      `<rect x="70" y="80" width="180" height="70" rx="6" fill="url(#fvSt)" stroke="${C.steelD}" stroke-width="1.2"/>` +
      [[100, C.red, "H"], [160, C.yellow, "EQ"], [220, C.blue, "L"]].map(([x, c, l]) =>
        `<rect x="${x - 5}" y="44" width="10" height="36" fill="url(#fvStV)" stroke="${C.steelD}"/><rect x="${x - 20}" y="36" width="40" height="10" rx="4" fill="${c}" stroke="${C.ink}"/>` + t(x, 30, l, { s: 9 })).join("") +
      `<rect x="96" y="150" width="128" height="40" rx="6" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(160, 175, "célula DP", { s: 9, c: "#fff" }) +
      pipeV(100, 190, 236, 10) + pipeV(220, 190, 236, 10) + t(84, 230, "alta", { s: 8, c: C.red }) + t(240, 230, "baixa", { s: 8, c: C.blue }) +
      `<path d="M100 120 H220" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="3 2"/>` +
      mk(1, 52, 40, 80, 40) + mk(2, 268, 40, 240, 40) + mk(3, 196, 22, 182, 38) + mk(4, 270, 112, 250, 112) + mk(5, 52, 170, 96, 170)
    ),
    partes: [
      ["Bloqueio de alta (H)", "Isola o lado de alta pressão."],
      ["Bloqueio de baixa (L)", "Isola o lado de baixa pressão."],
      ["Equalizadora", "Liga alta e baixa: ΔP = 0 para zerar e para proteger a célula."],
      ["Dreno / vent (5 vias)", "Alivia e drena para manutenção e calibração."],
      ["Célula DP", "Transmissor de pressão diferencial."],
    ],
    cadeia: [["ToggleRight", "Equalizadora aberta"], ["ToggleRight", "Abrir bloqueio H"], ["ToggleRight", "Fechar equalizadora"], ["ToggleRight", "Abrir bloqueio L"]],
    exemplo: [["Teste de zero", "bloqueios fechados"], ["Equalizadora", "aberta → ΔP = 0"], ["Saída esperada", "4,00 mA"], ["Lido 4,08 mA", "erro de zero 0,5 %"]],
    atencao: "Equalizadora aberta com os bloqueios abertos faz by-pass: a leitura cai a zero.",
    chave: "A equalizadora evita sobrepressão de um lado só na célula.",
  },

  // ───────────── Módulo 4 · Temperatura ─────────────
  {
    id: "termopar-rtd", mod: 3, titulo: "Termopar × RTD", sub: "Dois princípios diferentes para medir a mesma variável.",
    arte: svg(
      `<line x1="160" y1="16" x2="160" y2="224" stroke="${C.steelL}" stroke-width="2"/>` + t(80, 22, "TERMOPAR", { s: 10, c: C.orange }) + t(240, 22, "RTD (Pt100)", { s: 10, c: C.blue }) +
      tx(80, 130, 1.05, "mV") + `<rect x="74" y="130" width="12" height="80" rx="5" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      `<path d="M78 136 V204 M82 136 V204" stroke="${C.red}" stroke-width="1.4"/><path d="M82 136 V204" stroke="${C.blue}" stroke-width="1.4"/><circle cx="80" cy="206" r="3" fill="${C.orange}"/>` +
      tx(240, 130, 1.05, "Ω") + `<rect x="234" y="130" width="12" height="80" rx="5" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      `<path d="M240 178 l-3 4 l6 4 l-6 4 l6 4 l-6 4 l3 4" fill="none" stroke="${C.blue}" stroke-width="1.6"/>` +
      mk(1, 40, 206, 76, 206) + mk(2, 30, 120) + mk(3, 120, 60, 96, 76) + mk(4, 280, 196, 246, 194) + mk(5, 290, 120) + mk(6, 200, 60, 226, 76)
    ),
    partes: [
      ["Junção quente", "Dois metais diferentes unidos geram mV (efeito Seebeck)."],
      ["Faixa ampla", "Tipos K, S, R, B chegam a 1 250–1 700 °C."],
      ["Junta fria", "O transmissor compensa a temperatura da junção de referência."],
      ["Elemento de platina", "Resistência varia com a temperatura (100 Ω a 0 °C)."],
      ["Exatidão", "RTD é mais exato e estável, até ~600 °C."],
      ["Resposta", "Termopar de junta exposta responde mais rápido."],
    ],
    cadeia: [["Thermometer", "Temperatura"], ["Zap", "mV ou Ω"], ["Cpu", "Transmissor"], ["Activity", "4–20 mA"]],
    exemplo: [["Forno a 900 °C", "Termopar tipo K"], ["Água gelada 7 °C", "Pt100 classe A"], ["Tolerância classe A a 7 °C", "±0,16 °C"], ["Mancal de motor", "Pt100 3 fios"]],
    atencao: "Cabo comum no termopar cria novas junções e erro: use cabo de extensão ou compensação do mesmo tipo.",
    chave: "Temperatura alta: termopar. Exatidão: RTD.",
  },
  {
    id: "pt100-fios", mod: 3, titulo: "Pt100 a 2, 3 e 4 fios", sub: "Como o cabo entra (ou não) na medição.",
    arte: svg(
      [[50, 2], [160, 3], [270, 4]].map(([x, n]) => {
        const fios = Array.from({ length: n }, (_, i) => x - (n - 1) * 7 + i * 14);
        return `<rect x="${x - 34}" y="150" width="68" height="40" rx="6" fill="${C.paper}" stroke="${C.navy}"/>` + t(x, 174, `${n} fios`, { s: 10, c: C.navy }) +
          `<path d="M${x - 6} 40 l-4 5 l8 5 l-8 5 l8 5 l-8 5 l4 5" fill="none" stroke="${C.blue}" stroke-width="2"/>` +
          fios.map((fx, i) => `<path d="M${fx} 150 V${i < n / 2 ? 34 : 76} H${x}" fill="none" stroke="${i < Math.ceil(n / 2) ? C.red : "#f2f2f2"}" stroke-width="2.4"/><path d="M${fx} 150 V${i < n / 2 ? 34 : 76} H${x}" fill="none" stroke="${C.ink}" stroke-width=".5"/>`).join("");
      }).join("") +
      t(160, 214, "vermelho = um lado do sensor · branco = outro lado (IEC 60751)", { s: 7.5, c: C.muted, w: 400 }) +
      mk(1, 50, 128) + mk(2, 160, 128) + mk(3, 270, 128) + mk(4, 300, 214)
    ),
    partes: [
      ["2 fios", "A resistência do cabo soma ao sensor: erro proporcional ao comprimento."],
      ["3 fios", "O 3º fio permite descontar o cabo (exige condutores iguais)."],
      ["4 fios", "Corrente por um par, medição por outro: cabo não interfere."],
      ["Cores", "Vermelho de um lado do elemento, branco do outro."],
    ],
    cadeia: [["Zap", "Corrente de excitação"], ["Activity", "Queda de tensão"], ["Calculator", "R → °C"], ["Monitor", "Indicação"]],
    exemplo: [["Cabo 2 × 10 m de 0,5 mm²", "≈ 0,70 Ω"], ["Sensibilidade Pt100", "0,385 Ω/°C"], ["Erro a 2 fios", "≈ +1,8 °C"], ["A 3 fios", "≈ 0 (compensado)"]],
    atencao: "No 3 fios, os três condutores precisam ter a mesma bitola e o mesmo comprimento.",
    chave: "Cada ohm de cabo no 2 fios vale cerca de 2,6 °C de erro.",
  },
  {
    id: "poco", mod: 3, titulo: "Poço termométrico", sub: "Protege o sensor e permite trocá-lo com o processo em operação.",
    arte: svg(
      pipeH(10, 310, 170, 70) + t(40, 214, "fluxo →", { s: 8, c: C.muted, w: 400 }) +
      `<rect x="134" y="108" width="52" height="10" fill="url(#fvSt)" stroke="${C.steelD}"/>` +
      `<path d="M150 118 V188 Q160 198 170 188 V118 Z" fill="url(#fvStV)" stroke="${C.steelD}"/>` + `<line x1="160" y1="96" x2="160" y2="186" stroke="${C.orange}" stroke-width="2"/>` +
      `<rect x="154" y="70" width="12" height="38" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      `<rect x="136" y="34" width="48" height="36" rx="8" fill="url(#fvBl)" stroke="${C.navy}"/>` +
      mk(1, 110, 50, 136, 50) + mk(2, 210, 86, 166, 86) + mk(3, 214, 112, 186, 112) + mk(4, 110, 150, 150, 150) + mk(5, 214, 192, 166, 190) + mk(6, 214, 150, 162, 150)
    ),
    partes: [
      ["Cabeçote", "Abriga bornes ou transmissor de cabeça."],
      ["Extensão", "Afasta o cabeçote do calor do processo."],
      ["Conexão", "Rosca ou flange de fixação na tubulação."],
      ["Haste do poço", "Barra usinada que fica imersa no fluido."],
      ["Ponta", "Região sensível: deve ficar no meio do fluxo."],
      ["Sensor", "Pt100 ou termopar encostado no fundo do poço."],
    ],
    cadeia: [["Droplets", "Fluido"], ["Shield", "Parede do poço"], ["Layers", "Contato / óleo"], ["Thermometer", "Sensor"]],
    exemplo: [["Bainha do sensor", "6 mm"], ["Imersão mínima", "≈ 10 × 6 = 60 mm"], ["Tubulação DN 100", "ponta perto do centro"], ["Folga sensor-poço", "mínima (resposta)"]],
    atencao: "Poço longo em alta velocidade pode vibrar e romper: verifique pela ASME PTC 19.3 TW.",
    chave: "O poço troca segurança por tempo de resposta: escolha com critério.",
  },

  // ───────────── Módulo 5 · Vazão ─────────────
  {
    id: "placa-orificio", mod: 4, titulo: "Placa de orifício", sub: "Uma restrição cria pressão diferencial proporcional à vazão.",
    arte: svg(
      pipeH(10, 310, 150, 60) + `<rect x="156" y="112" width="8" height="24" fill="${C.ink}"/><rect x="156" y="164" width="8" height="24" fill="${C.ink}"/>` +
      `<path d="M20 136 C120 136 150 140 160 140 C200 140 210 146 300 136 M20 164 C120 164 150 160 160 160 C200 160 210 154 300 164" fill="none" stroke="${C.waterD}" stroke-width="1.5"/>` +
      arrow(24, 150, 70, 150, C.waterD, 2) + `<path d="M120 120 V70 H140 M200 120 V70 H180" fill="none" stroke="${C.ink}" stroke-width="2"/>` +
      `<rect x="134" y="50" width="52" height="30" rx="5" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(160, 69, "ΔP", { s: 11, c: "#fff" }) +
      t(250, 210, "perda de carga", { s: 8, c: C.red }) + `<path d="M220 200 Q250 190 290 196" fill="none" stroke="${C.red}" stroke-dasharray="3 2"/>` +
      mk(1, 160, 210, 160, 190) + mk(2, 98, 96, 118, 110) + mk(3, 222, 96, 202, 110) + mk(4, 206, 130, 196, 146) + mk(5, 210, 54, 188, 62) + mk(6, 276, 222)
    ),
    partes: [
      ["Placa", "Disco com furo calibrado; β = d / D."],
      ["Tomada de alta", "Antes da placa (montante)."],
      ["Tomada de baixa", "Depois da placa (jusante)."],
      ["Vena contracta", "Ponto de menor área do jato e menor pressão."],
      ["Transmissor DP", "Mede ΔP; a vazão sai pela raiz quadrada."],
      ["Perda permanente", "Parte da pressão não se recupera: custo de energia."],
    ],
    cadeia: [["Waves", "Vazão"], ["Target", "Restrição"], ["Gauge", "ΔP"], ["Sigma", "Raiz quadrada"], ["Monitor", "m³/h"]],
    exemplo: [["ΔP máx", "2 500 mmH₂O = 100 m³/h"], ["ΔP lido", "625 mmH₂O (25 %)"], ["√0,25", "0,5"], ["Vazão", "50 m³/h"]],
    atencao: "Placa invertida (chanfro do lado errado) gera erro grande. Confira a marcação de montante.",
    chave: "Q ∝ √ΔP: metade da vazão dá só um quarto do ΔP.",
  },
  {
    id: "magnetico", mod: 4, titulo: "Medidor eletromagnético", sub: "A lei de Faraday transforma velocidade do líquido em tensão.",
    arte: svg(
      pipeH(10, 70, 140, 50) + pipeH(250, 310, 140, 50) + flange(72, 140, 66) + flange(248, 140, 66) +
      `<rect x="75" y="104" width="170" height="72" rx="4" fill="url(#fvBl)" stroke="${C.navy}"/>` +
      `<rect x="80" y="116" width="160" height="48" fill="#dbe9f7"/>` + arrow(90, 140, 140, 140, C.waterD, 2.5) +
      `<ellipse cx="160" cy="104" rx="26" ry="8" fill="#c9a227" stroke="${C.ink}"/><ellipse cx="160" cy="176" rx="26" ry="8" fill="#c9a227" stroke="${C.ink}"/>` +
      `<line x1="160" y1="114" x2="160" y2="166" stroke="${C.violet}" stroke-width="1.5" stroke-dasharray="3 2"/>` + t(172, 144, "B", { s: 11, c: C.violet }) +
      `<circle cx="196" cy="128" r="4" fill="${C.ink}"/><circle cx="196" cy="152" r="4" fill="${C.ink}"/>` +
      tx(160, 96, 0.95, "56.5") +
      mk(1, 110, 196, 140, 178) + mk(2, 226, 196, 198, 154) + mk(3, 110, 84, 100, 116) + mk(4, 40, 196, 70, 172) + mk(5, 206, 40, 176, 56)
    ),
    partes: [
      ["Bobinas", "Criam o campo magnético B através do tubo."],
      ["Eletrodos", "Captam a tensão induzida: U = k · B · v · D."],
      ["Revestimento", "Interno isolante (PTFE, borracha) para não curto-circuitar o sinal."],
      ["Aterramento", "Anéis ou eletrodo de terra: referência do fluido."],
      ["Conversor", "Calcula a vazão e gera 4–20 mA, pulsos, rede."],
    ],
    cadeia: [["Droplets", "Líquido condutivo"], ["Magnet", "Campo B"], ["Zap", "Tensão induzida"], ["Cpu", "Conversor"], ["Monitor", "m³/h"]],
    exemplo: [["Tubo DN 100", "A ≈ 0,00785 m²"], ["Velocidade", "2 m/s"], ["Q = v · A", "0,0157 m³/s"], ["Vazão", "≈ 56,5 m³/h"]],
    atencao: "Tubo parcialmente cheio ou fluido não condutivo (óleo) dão leitura errada.",
    chave: "Sem partes móveis e sem perda de carga.",
  },
  {
    id: "coriolis", mod: 4, titulo: "Medidor Coriolis", sub: "Mede massa diretamente a partir da torção de tubos vibrando.",
    arte: svg(
      pipeH(10, 80, 196, 26) + pipeH(240, 310, 196, 26) + flange(82, 196, 40) + flange(238, 196, 40) +
      `<path d="M86 192 C100 60 220 60 234 192" fill="none" stroke="url(#fvSt)" stroke-width="12"/><path d="M86 192 C100 60 220 60 234 192" fill="none" stroke="${C.steelD}" stroke-width="1"/>` +
      `<path d="M96 192 C110 82 210 82 224 192" fill="none" stroke="url(#fvSt)" stroke-width="12"/><path d="M96 192 C110 82 210 82 224 192" fill="none" stroke="${C.steelD}" stroke-width="1"/>` +
      `<rect x="150" y="72" width="20" height="14" fill="${C.orange}" stroke="${C.ink}"/>` +
      `<rect x="104" y="112" width="14" height="12" fill="${C.green}" stroke="${C.ink}"/><rect x="202" y="112" width="14" height="12" fill="${C.green}" stroke="${C.ink}"/>` +
      `<circle cx="190" cy="168" r="5" fill="${C.yellow}" stroke="${C.ink}"/>` + arrow(20, 196, 66, 196, C.waterD, 2.5) +
      mk(1, 60, 110, 92, 130) + mk(2, 160, 44, 160, 72) + mk(3, 76, 152, 104, 124) + mk(4, 250, 112, 216, 118) + mk(5, 270, 64) + mk(6, 216, 214, 192, 172)
    ),
    partes: [
      ["Tubos de medição", "Vibram na frequência natural."],
      ["Bobina excitadora", "Mantém a vibração dos tubos."],
      ["Sensor de entrada", "Pick-off que lê o movimento no lado da entrada."],
      ["Sensor de saída", "A defasagem entre os sensores é proporcional à vazão mássica."],
      ["Frequência", "Varia com a densidade do fluido."],
      ["RTD", "Mede a temperatura para compensar o tubo."],
    ],
    cadeia: [["Waves", "Fluxo"], ["Activity", "Tubos torcem"], ["Timer", "Defasagem"], ["Scale", "kg/h"]],
    exemplo: [["Vazão mássica", "12 000 kg/h"], ["Densidade", "800 kg/m³"], ["Volumétrica", "15 m³/h"], ["Exatidão típica", "±0,1 %"]],
    atencao: "Gás arrastado no líquido e vibração da tubulação prejudicam a medição.",
    chave: "Mede massa direto, sem compensar pressão e temperatura.",
  },

  // ───────────── Módulo 6 · Nível ─────────────
  {
    id: "nivel-dp", mod: 5, titulo: "Nível por pressão diferencial", sub: "A coluna de líquido vira ΔP: P = ρ · g · h.",
    arte: svg(
      tank(30, 30, 120, 186, 0.55) + `<path d="M150 200 H200 V178" fill="none" stroke="${C.red}" stroke-width="2.5"/><path d="M150 46 H240 V178" fill="none" stroke="${C.blue}" stroke-width="2.5"/>` +
      `<rect x="186" y="178" width="68" height="34" rx="5" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(220, 199, "DP", { s: 11, c: "#fff" }) +
      t(206, 172, "H", { s: 9, c: C.red }) + t(248, 172, "L", { s: 9, c: C.blue }) +
      `<path d="M20 214 V114" stroke="${C.ink}"/><path d="M16 114 h8 M16 214 h8" stroke="${C.ink}"/>` + t(12, 168, "h", { s: 11 }) +
      `<path d="M150 70 H178" stroke="${C.muted}" stroke-dasharray="3 2"/>` +
      mk(1, 166, 222, 166, 200) + mk(2, 270, 46, 240, 46) + mk(3, 278, 120, 242, 120) + mk(4, 60, 14) + mk(5, 284, 196, 254, 196)
    ),
    partes: [
      ["Tomada de alta", "No fundo do tanque: sente a coluna + a pressão do topo."],
      ["Tomada de baixa", "No topo: desconta a pressão do espaço de vapor."],
      ["Perna seca", "Linha de baixa sem líquido (gás não condensável)."],
      ["Perna úmida / selos", "Linha cheia ou selo remoto: exige elevação ou supressão de zero."],
      ["Transmissor DP", "Converte ΔP em % de nível."],
    ],
    cadeia: [["Droplets", "Coluna de líquido"], ["Calculator", "ΔP = ρ·g·h"], ["Gauge", "Transmissor DP"], ["Monitor", "% nível"]],
    exemplo: [["Água, h máx", "2 m"], ["ΔP máx", "≈ 19,6 kPa"], ["ΔP lido", "9,8 kPa"], ["Nível", "50 %"]],
    atencao: "Com perna úmida, o zero fica deslocado: recalcule a elevação ou supressão.",
    chave: "Mudou a densidade, mudou o nível medido.",
  },
  {
    id: "radar", mod: 5, titulo: "Medição de nível por radar", sub: "O tempo de ida e volta da micro-onda dá a distância até o produto.",
    arte: svg(
      tank(50, 40, 160, 186, 0.62) + tx(130, 40, 1, "6.50") + `<path d="M118 40 L112 62 H148 L142 40 Z" fill="url(#fvSt)" stroke="${C.steelD}"/>` +
      [0, 1, 2].map((i) => `<path d="M${116 - i * 10} ${80 + i * 14} Q130 ${88 + i * 14} ${144 + i * 10} ${80 + i * 14}" fill="none" stroke="${C.orange}" stroke-width="1.8"/>`).join("") +
      arrow(150, 74, 150, 104, C.orange) + arrow(160, 104, 160, 74, C.green) +
      `<path d="M226 40 V222 M222 40 h8 M222 222 h8" stroke="${C.ink}"/>` + t(244, 134, "ref.", { s: 8 }) +
      `<path d="M200 62 V108 M196 62 h8 M196 108 h8" stroke="${C.orange}"/>` + t(196, 120, "d", { s: 10, c: C.orange }) +
      `<rect x="56" y="62" width="148" height="10" fill="${C.red}" opacity=".12"/>` +
      mk(1, 80, 32, 116, 50) + mk(2, 92, 104, 116, 96) + mk(3, 180, 136, 170, 112) + mk(4, 266, 90, 204, 86) + mk(5, 266, 160, 230, 160) + mk(6, 280, 60, 206, 66)
    ),
    partes: [
      ["Antena", "Cone, haste ou parabólica: direciona o feixe."],
      ["Pulso", "Micro-onda (ou FMCW) emitida em direção ao produto."],
      ["Eco", "Reflexão na superfície do líquido."],
      ["Distância", "d = c × t / 2."],
      ["Nível", "Nível = altura de referência − distância."],
      ["Zona morta", "Faixa junto à antena onde não há medição confiável."],
    ],
    cadeia: [["Antenna", "Emite"], ["Waves", "Reflete"], ["Timer", "Tempo de voo"], ["Calculator", "Distância"], ["Monitor", "Nível"]],
    exemplo: [["Altura de referência", "10,0 m"], ["Distância medida", "3,5 m"], ["Nível", "6,5 m"], ["Em %", "65 %"]],
    atencao: "Escadas, serpentinas e agitadores geram ecos falsos: faça o mapeamento de ecos.",
    chave: "Sem contato e pouco afetado por vapor, pressão e temperatura.",
  },
  {
    id: "chaves-nivel", mod: 5, titulo: "Chaves de nível", sub: "Pontos de liga/desliga para alarme e intertravamento.",
    arte: svg(
      tank(70, 20, 150, 206, 0.5) +
      [[44, "LSHH", C.red], [80, "LSH", C.orange], [168, "LSL", C.orange], [204, "LSLL", C.red]].map(([y, l, c]) =>
        `<rect x="220" y="${y - 5}" width="22" height="10" fill="url(#fvSt)" stroke="${C.steelD}"/><path d="M220 ${y} H196" stroke="${C.ink}" stroke-width="3"/><circle cx="192" cy="${y}" r="6" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.5"/>` +
        t(250, y + 3, l, { s: 9, c, a: "start" })).join("") +
      pipeH(10, 76, 214, 14) + `<circle cx="36" cy="214" r="14" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(36, 218, "M", { s: 10, c: "#fff" }) +
      mk(1, 300, 44) + mk(2, 300, 80) + mk(3, 300, 168) + mk(4, 300, 204) + mk(5, 36, 180, 36, 200)
    ),
    partes: [
      ["LSHH", "Nível muito alto: intertravamento (corta a alimentação)."],
      ["LSH", "Nível alto: alarme ao operador."],
      ["LSL", "Nível baixo: alarme ao operador."],
      ["LSLL", "Nível muito baixo: desliga a bomba (evita operar a seco)."],
      ["Bomba protegida", "Recebe o comando do intertravamento."],
    ],
    cadeia: [["Droplets", "Nível atinge o ponto"], ["ToggleRight", "Chave muda de estado"], ["Cpu", "CLP"], ["Siren", "Alarme / desarme"]],
    exemplo: [["Tipos", "boia, vibratória, condutiva"], ["Contato", "NF que abre em alarme"], ["Fio rompido", "também gera alarme"], ["Teste", "periódico, com registro"]],
    atencao: "Use lógica de falha segura: contato que abre em alarme denuncia também cabo rompido.",
    chave: "Chave dá um ponto (liga/desliga); transmissor dá valor contínuo.",
  },

  // ───────────── Módulo 7 · Válvulas de controle ─────────────
  {
    id: "valvula-anatomia", mod: 6, titulo: "Anatomia da válvula de controle", sub: "As partes que transformam sinal em vazão.",
    arte: svg(
      pipeH(10, 104, 190, 30) + pipeH(216, 310, 190, 30) + flange(106, 190, 50) + flange(214, 190, 50) + valve(160, 190, 2.4) +
      `<path d="M150 196 L160 182 L170 196 Z" fill="${C.orange}"/>` +
      mk(1, 250, 40, 210, 50) + mk(2, 218, 110, 162, 118) + mk(3, 104, 126, 150, 134) + mk(4, 104, 150, 146, 150) + mk(5, 230, 222, 166, 194) + mk(6, 96, 226, 130, 206)
    ),
    partes: [
      ["Atuador", "Diafragma e mola: o ar move a haste contra a mola."],
      ["Haste", "Transmite o movimento ao obturador."],
      ["Gaxetas", "Vedam a haste sem prender o movimento."],
      ["Castelo", "Une o corpo ao atuador e guia a haste."],
      ["Obturador e sede (trim)", "Definem a característica e a capacidade (Cv)."],
      ["Corpo", "Parte que suporta a pressão do processo."],
    ],
    cadeia: [["Activity", "4–20 mA"], ["Cpu", "Posicionador"], ["Wind", "Ar no atuador"], ["MoveVertical", "Haste"], ["Waves", "Vazão"]],
    exemplo: [["Curso total", "20 mm"], ["Sinal", "12 mA = 50 %"], ["Posição", "10 mm"], ["Vazamento classe", "IV (ANSI/FCI 70-2)"]],
    atencao: "Gaxeta apertada demais causa agarramento (stiction) e oscilação da malha.",
    chave: "O trim define a característica e a capacidade (Cv).",
  },
  {
    id: "posicionador", mod: 6, titulo: "Posicionador", sub: "Garante que a haste esteja exatamente onde o controlador pediu.",
    arte: svg(
      valve(110, 200, 1.6) + pipeH(10, 74, 200, 18) + pipeH(146, 220, 200, 18) +
      `<rect x="180" y="70" width="70" height="60" rx="6" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(215, 104, "POS", { s: 11, c: "#fff" }) +
      `<path d="M110 150 L180 118" stroke="${C.ink}" stroke-width="3"/>` + `<path d="M180 90 H150 V124" fill="none" stroke="${C.green}" stroke-width="3"/>` +
      `<path d="M250 84 H300" stroke="${C.blue}" stroke-width="2" stroke-dasharray="5 3"/>` + t(290, 76, "4–20 mA", { s: 8, c: C.blue }) +
      `<path d="M250 116 H286 V170" stroke="${C.green}" stroke-width="3" fill="none"/><rect x="272" y="170" width="28" height="30" rx="4" fill="url(#fvSt)" stroke="${C.steelD}"/>` + t(286, 214, "ar", { s: 8, c: C.green }) +
      mk(1, 296, 100) + mk(2, 196, 52, 206, 74) + mk(3, 236, 52, 230, 74) + mk(4, 144, 152, 146, 134) + mk(5, 262, 196, 272, 186) + mk(6, 140, 76, 150, 100)
    ),
    partes: [
      ["Entrada 4–20 mA", "Sinal do controlador (posição desejada)."],
      ["Conversor I/P", "Transforma o sinal elétrico em pressão piloto."],
      ["Relé pneumático", "Amplifica a vazão de ar para o atuador."],
      ["Braço de realimentação", "Lê a posição real da haste."],
      ["Suprimento de ar", "Ar limpo e seco, via filtro regulador."],
      ["Saída ao atuador", "Ar que move o diafragma até a posição correta."],
    ],
    cadeia: [["Activity", "Sinal"], ["Scale", "Compara com posição"], ["Wind", "Ajusta o ar"], ["MoveVertical", "Haste move"], ["Repeat", "Realimenta"]],
    exemplo: [["Sinal", "8 mA = 25 %"], ["Posição esperada", "25 % do curso"], ["Posição lida", "20 %"], ["Suspeita", "atrito ou ar insuficiente"]],
    atencao: "Ar com óleo ou água trava o relé: mantenha o filtro regulador drenado.",
    chave: "O posicionador garante a posição; o PID garante a variável.",
  },
  {
    id: "acao-falha", mod: 6, titulo: "Ação em falha: FC × FO", sub: "Para onde a válvula vai quando falta ar ou sinal.",
    arte: svg(
      `<line x1="160" y1="16" x2="160" y2="224" stroke="${C.steelL}" stroke-width="2"/>` +
      valve(80, 180, 1.5) + valve(240, 180, 1.5) + t(80, 30, "FC · ar para abrir", { s: 9.5, c: C.red }) + t(240, 30, "FO · ar para fechar", { s: 9.5, c: C.green }) +
      `<path d="M70 80 l6 -5 l-12 -5 l12 -5 l-12 -5 l6 -5" fill="none" stroke="${C.ink}" stroke-width="1.5"/>` + arrow(96, 70, 96, 100, C.red) +
      `<path d="M230 80 l6 -5 l-12 -5 l12 -5 l-12 -5 l6 -5" fill="none" stroke="${C.ink}" stroke-width="1.5"/>` + arrow(256, 100, 256, 70, C.green) +
      t(80, 222, "falta de ar → FECHA", { s: 8.5 }) + t(240, 222, "falta de ar → ABRE", { s: 8.5 }) +
      mk(1, 30, 60) + mk(2, 196, 60) + mk(3, 120, 60, 82, 66) + mk(4, 30, 196, 56, 182) + mk(5, 290, 196)
    ),
    partes: [
      ["FC (falha fecha)", "A mola fecha; o ar abre."],
      ["FO (falha abre)", "A mola abre; o ar fecha."],
      ["Mola", "É ela que define a posição de falha."],
      ["Solenoide de desarme", "Corta o ar para levar a válvula à posição segura."],
      ["Critério", "Escolhe-se pela segurança do processo, não por conveniência."],
    ],
    cadeia: [["TriangleAlert", "Falta ar/sinal"], ["Spline", "Mola atua"], ["ShieldAlert", "Posição segura"]],
    exemplo: [["Combustível do forno", "FC"], ["Resfriamento de reator", "FO"], ["Alívio para tocha", "FO"], ["Alimentação de tanque", "FC (evita transbordo)"]],
    atencao: "Inverter a ação no CLP não muda a posição de falha: ela é física, da mola.",
    chave: "Pergunte: se tudo faltar, o processo fica seguro com a válvula aberta ou fechada?",
  },

  // ───────────── Módulo 8 · Controle de processo ─────────────
  {
    id: "pid-acoes", mod: 7, titulo: "Ações P, I e D", sub: "Como cada termo do controlador responde ao erro.",
    arte: svg(
      `<path d="M30 210 H300 M30 210 V20" stroke="${C.ink}" stroke-width="1.5"/>` + `<line x1="30" y1="80" x2="300" y2="80" stroke="${C.orange}" stroke-dasharray="6 4"/>` + t(296, 74, "SP", { s: 9, c: C.orange, a: "end" }) +
      `<path d="M30 200 C70 200 80 100 120 104 C160 108 200 104 300 104" fill="none" stroke="${C.red}" stroke-width="2.4"/>` +
      `<path d="M30 200 C60 200 70 40 100 50 C130 60 140 96 170 86 C200 78 230 80 300 80" fill="none" stroke="${C.blue}" stroke-width="2.4"/>` +
      `<path d="M30 200 C66 200 76 64 108 70 C140 76 160 82 300 80" fill="none" stroke="${C.green}" stroke-width="2.4"/>` +
      `<path d="M240 82 V102" stroke="${C.red}" stroke-width="1.2"/>` + t(30, 226, "tempo →", { s: 8, c: C.muted, a: "start", w: 400 }) +
      mk(1, 140, 128, 140, 106) + mk(2, 262, 128, 242, 98) + mk(3, 196, 60, 182, 82) + mk(4, 80, 92, 92, 72) + mk(5, 100, 28, 100, 46) + mk(6, 230, 40)
    ),
    partes: [
      ["P (vermelho)", "Saída proporcional ao erro: reage rápido."],
      ["Offset", "Só com P, sobra um erro residual."],
      ["PI (azul)", "A integral acumula o erro até zerá-lo."],
      ["PID (verde)", "A derivativa antecipa e reduz o sobressinal."],
      ["Sobressinal", "Quanto a PV passa do SP antes de estabilizar."],
      ["Acomodação", "Tempo até a PV ficar dentro da faixa aceitável."],
    ],
    cadeia: [["Scale", "Erro = SP − PV"], ["Sigma", "P + I + D"], ["SlidersHorizontal", "Saída"], ["Factory", "Processo"]],
    exemplo: [["BP", "50 % → Kp = 2"], ["Erro", "5 %"], ["Parcela P", "2 × 5 = 10 %"], ["Ti", "2 min/rep"]],
    atencao: "Derivativa em sinal ruidoso (vazão) faz a válvula tremer.",
    chave: "P olha o presente, I o passado e D a tendência.",
  },
  {
    id: "cascata", mod: 7, titulo: "Controle em cascata", sub: "Uma malha rápida dentro de uma lenta para rejeitar distúrbios.",
    arte: svg(
      block(20, 30, 80, 44, "TIC|mestre", C.navy, "#fff", 9) + block(130, 30, 80, 44, "FIC|escrava", C.blue, "#fff", 9) +
      arrow(100, 52, 130, 52, C.ink) + t(115, 44, "SP", { s: 7.5 }) + `<path d="M210 52 H262 V150" fill="none" stroke="${C.blue}" stroke-width="1.8" stroke-dasharray="5 3"/>` +
      pipeH(120, 310, 176, 14) + valve(262, 176, 0.8) + `<rect x="166" y="166" width="22" height="20" rx="3" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(177, 202, "FT", { s: 8 }) +
      `<path d="M177 166 V74" stroke="${C.blue}" stroke-dasharray="4 3"/>` + tank(20, 120, 80, 100, 0.5) + `<path d="M120 176 H100" stroke="${C.ink}"/>` +
      `<path d="M60 120 V74" stroke="${C.red}" stroke-dasharray="4 3"/>` + t(300, 166, "vapor", { s: 8, c: C.muted, a: "end", w: 400 }) +
      t(220, 224, "queda de pressão do vapor", { s: 7.5, c: C.red }) + arrow(220, 214, 220, 186, C.red) +
      mk(1, 60, 16) + mk(2, 170, 16) + mk(3, 115, 80) + mk(4, 296, 130, 274, 140) + mk(5, 190, 224)
    ),
    partes: [
      ["Malha mestre", "Controla a variável principal (temperatura do tanque)."],
      ["Malha escrava", "Controla a vazão de vapor, bem mais rápida."],
      ["SP remoto", "A saída da mestre vira o setpoint da escrava."],
      ["Válvula", "Recebe o sinal da escrava."],
      ["Distúrbio", "Queda de pressão corrigida pela escrava antes de afetar a temperatura."],
    ],
    cadeia: [["Thermometer", "TIC calcula"], ["Target", "SP da escrava"], ["Waves", "FIC ajusta vazão"], ["Factory", "Temperatura estável"]],
    exemplo: [["TIC pede", "1 200 kg/h de vapor"], ["Pressão cai", "vazão tenderia a cair"], ["FIC reage", "abre a válvula em segundos"], ["Temperatura", "nem percebe"]],
    atencao: "A escrava deve ser de 3 a 5 vezes mais rápida que a mestre.",
    chave: "Sintonize primeiro a escrava, depois a mestre.",
  },
  {
    id: "sintonia", mod: 7, titulo: "Sintonia na prática", sub: "Do teste em degrau aos parâmetros do PID.",
    arte: svg(
      `<path d="M30 110 H300 M30 110 V16" stroke="${C.ink}" stroke-width="1.3"/>` + `<path d="M30 96 H80 V40 H300" fill="none" stroke="${C.orange}" stroke-width="2"/>` +
      `<path d="M30 96 H110 C140 96 160 40 300 42" fill="none" stroke="${C.blue}" stroke-width="2.4"/>` + `<path d="M80 102 H110" stroke="${C.red}" stroke-width="3"/>` +
      t(30, 128, "malha aberta: degrau na saída", { s: 8, c: C.muted, a: "start", w: 400 }) +
      `<path d="M30 220 H300 M30 220 V140" stroke="${C.ink}" stroke-width="1.3"/>` + wave(36, 296, 180, 26, 52, C.green, 2.4) +
      `<path d="M62 152 V140 M114 152 V140" stroke="${C.ink}"/>` + arrow(62, 146, 114, 146, C.ink, 1) + t(88, 140, "Pu", { s: 9 }) +
      t(30, 236, "malha fechada: oscilação sustentada (Ku)", { s: 8, c: C.muted, a: "start", w: 400 }) +
      mk(1, 60, 26, 78, 42) + mk(2, 96, 80, 96, 100) + mk(3, 180, 66, 170, 52) + mk(4, 280, 24, 270, 40) + mk(5, 200, 150, 196, 160)
    ),
    partes: [
      ["Degrau", "Com a malha em manual, muda-se a saída de uma vez (ex.: +10 %)."],
      ["Tempo morto", "Atraso até a PV começar a reagir."],
      ["Constante de tempo", "Tempo até 63 % da variação final."],
      ["Ganho do processo", "Variação da PV ÷ variação da saída."],
      ["Ku e Pu", "Ganho e período na oscilação sustentada (Ziegler–Nichols)."],
    ],
    cadeia: [["Hand", "Manual"], ["Activity", "Degrau"], ["Timer", "Registrar"], ["Calculator", "Calcular"], ["SlidersHorizontal", "Ajuste fino"]],
    exemplo: [["Ku / Pu", "4 / 2 min"], ["Kp = 0,6·Ku", "2,4"], ["Ti = Pu/2", "1 min"], ["Td = Pu/8", "0,25 min"]],
    atencao: "Faça testes com o processo estável e com autorização da operação.",
    chave: "Comece conservador e aperte aos poucos.",
  },

  // ───────────── Módulo 9 · Automação e redes ─────────────
  {
    id: "clp-io", mod: 8, titulo: "CLP e cartões de E/S", sub: "Como o controlador lê o campo e comanda os atuadores.",
    arte: svg(
      `<rect x="16" y="40" width="288" height="120" rx="6" fill="#e7ebef" stroke="${C.steelD}"/>` +
      [["PS", C.steelD], ["CPU", C.navy], ["DI", C.green], ["DO", C.orange], ["AI", C.blue], ["AO", C.violet]].map(([l, c], i) =>
        `<rect x="${26 + i * 46}" y="50" width="40" height="100" rx="4" fill="${c}" stroke="${C.ink}"/>` + t(46 + i * 46, 72, l, { s: 10, c: "#fff" }) +
        Array.from({ length: 4 }, (_, k) => `<circle cx="${38 + i * 46}" cy="${88 + k * 14}" r="2.5" fill="${i > 1 ? "#3ddc84" : "#ffffff"}"/>`).join("")).join("") +
      `<path d="M138 150 V190 M184 150 V190 M230 150 V190 M276 150 V190" stroke="${C.ink}" stroke-width="1.5"/>` +
      t(138, 204, "botão", { s: 7.5 }) + t(184, 204, "contator", { s: 7.5 }) + t(230, 204, "4–20 mA", { s: 7.5 }) + t(276, 204, "válvula", { s: 7.5 }) +
      mk(1, 46, 24) + mk(2, 92, 24) + mk(3, 138, 224) + mk(4, 184, 224) + mk(5, 230, 224) + mk(6, 276, 224)
    ),
    partes: [
      ["Fonte (PS)", "Alimenta o rack e os cartões."],
      ["CPU", "Executa o programa em ciclos de varredura."],
      ["DI", "Entradas digitais: botões, chaves, contatos auxiliares."],
      ["DO", "Saídas digitais: contatores, solenoides, sinaleiros."],
      ["AI", "Entradas analógicas: transmissores 4–20 mA, Pt100."],
      ["AO", "Saídas analógicas: válvulas de controle, referência de inversores."],
    ],
    cadeia: [["Eye", "Ler entradas"], ["Cpu", "Executar programa"], ["Zap", "Atualizar saídas"], ["Repeat", "Repetir (scan)"]],
    exemplo: [["AI 4–20 mA (S7)", "0 a 27 648"], ["Valor bruto", "13 824"], ["Posição", "50 %"], ["Range 0–10 bar", "5,0 bar"]],
    atencao: "Saída digital a transistor não aciona carga em corrente alternada: use relé de interface.",
    chave: "O CLP lê, executa e escreve a cada ciclo de varredura.",
  },
  {
    id: "piramide-redes", mod: 8, titulo: "Pirâmide da automação e redes", sub: "Do sensor ao ERP: cada nível com sua rede.",
    arte: svg(
      [["ERP", C.violet], ["MES", C.blue], ["Supervisão", C.green], ["Controle", C.orange], ["Campo", C.navy]].map(([l, c], i) => {
        const y = 20 + i * 42, w = 60 + i * 52;
        return `<path d="M${160 - w / 2} ${y + 40} L${160 - w / 2 + 12} ${y} H${160 + w / 2 - 12} L${160 + w / 2} ${y + 40} Z" fill="${c}" stroke="#fff" stroke-width="2"/>` + t(160, y + 25, l, { s: 10, c: "#fff" });
      }).join("") +
      mk(1, 270, 200) + mk(2, 258, 158) + mk(3, 246, 116) + mk(4, 234, 74) + mk(5, 222, 32)
    ),
    partes: [
      ["Campo", "Sensores e atuadores: 4–20 mA, HART, IO-Link, Profibus PA."],
      ["Controle", "CLP e SDCD: Profinet, EtherNet/IP, Modbus."],
      ["Supervisão", "SCADA e IHM: OPC UA, históricos, alarmes."],
      ["MES", "Gestão da produção: ordens, rastreabilidade, OEE."],
      ["ERP", "Gestão da empresa: compras, estoque, custos."],
    ],
    cadeia: [["Gauge", "Sensor"], ["Cpu", "CLP"], ["Monitor", "SCADA"], ["Factory", "MES"], ["Database", "ERP"]],
    exemplo: [["Modbus RTU (RS-485)", "até 32 nós por segmento"], ["Distância", "até ~1 200 m"], ["Terminação", "120 Ω nas pontas"], ["Cabo", "par trançado blindado"]],
    atencao: "RS-485 sem resistor de terminação nas duas pontas gera erros de comunicação.",
    chave: "Quanto mais alto na pirâmide, mais dados e menos tempo real.",
  },
  {
    id: "scada", mod: 8, titulo: "IHM, SCADA e SDCD", sub: "Onde o operador vê, decide e age.",
    arte: svg(
      `<rect x="30" y="160" width="260" height="14" fill="#c9b79c"/>` +
      [0, 1, 2].map((i) => `<rect x="${44 + i * 84}" y="70" width="76" height="52" rx="4" fill="${C.ink}"/><rect x="${48 + i * 84}" y="74" width="68" height="44" fill="#13315a"/>` +
        `<path d="M${52 + i * 84} 108 l12 -10 l10 6 l14 -16 l14 8" fill="none" stroke="#3ddc84" stroke-width="1.5"/><rect x="${78 + i * 84}" y="122" width="16" height="38" fill="${C.steelD}"/>`).join("") +
      `<rect x="232" y="78" width="12" height="8" fill="${C.red}"/>` + `<rect x="250" y="20" width="56" height="40" rx="4" fill="url(#fvSt)" stroke="${C.steelD}"/>` + t(278, 44, "servidor", { s: 8 }) +
      `<circle cx="160" cy="214" r="14" fill="${C.blue}"/><rect x="146" y="226" width="28" height="14" rx="6" fill="${C.blue}"/>` +
      mk(1, 24, 60) + mk(2, 160, 52) + mk(3, 120, 192) + mk(4, 296, 76, 280, 60) + mk(5, 238, 104, 238, 86)
    ),
    partes: [
      ["IHM local", "Tela junto à máquina para operar e ajustar."],
      ["SCADA", "Supervisão de várias áreas, telas e históricos."],
      ["SDCD", "Controle distribuído em processos contínuos."],
      ["Historiador", "Guarda dados para tendências e relatórios."],
      ["Alarmes", "Avisam desvios que exigem ação do operador (ISA-18.2)."],
    ],
    cadeia: [["Gauge", "Campo"], ["Cpu", "Controlador"], ["Server", "Servidor"], ["Monitor", "Telas e alarmes"], ["Hand", "Operador"]],
    exemplo: [["Referência", "~6 alarmes/h por operador"], ["Inundação", "> 10 em 10 min"], ["Prioridades", "alta, média, baixa"], ["Revisão", "racionalização periódica"]],
    atencao: "Alarme demais vira ruído: o operador deixa de ver o importante.",
    chave: "O SCADA supervisiona; o controle fica no CLP ou no SDCD.",
  },

  // ───────────── Módulo 10 · Calibração e segurança ─────────────
  {
    id: "calibracao-5", mod: 9, titulo: "Calibração em 5 pontos", sub: "Montagem de bancada para transmissor de pressão.",
    arte: svg(
      tx(200, 150, 1.4, "12.10") + `<rect x="30" y="150" width="70" height="30" rx="5" fill="url(#fvSt)" stroke="${C.steelD}"/>` + t(65, 170, "bomba", { s: 8 }) +
      `<path d="M100 165 H200 V150" fill="none" stroke="${C.ink}" stroke-width="3"/>` + gauge(140, 120, 18, -90) + `<path d="M140 150 V165" stroke="${C.ink}" stroke-width="3"/>` +
      `<rect x="232" y="40" width="70" height="90" rx="8" fill="#f5a524" stroke="${C.ink}"/><rect x="240" y="50" width="54" height="26" fill="#1b2430"/>` + t(267, 68, "12.10 mA", { s: 8.5, c: "#3ddc84" }) +
      `<path d="M218 92 H232 M218 100 H232" stroke="${C.red}" stroke-width="2"/>` +
      `<rect x="30" y="196" width="190" height="34" fill="${C.paper}" stroke="${C.navy}"/>` + ["0", "25", "50", "75", "100%"].map((p, i) => t(48 + i * 38, 210, p, { s: 7.5 }) + t(48 + i * 38, 224, ["4", "8", "12", "16", "20"][i], { s: 7.5, c: C.blue })).join("") +
      mk(1, 30, 130, 50, 150) + mk(2, 120, 86, 132, 104) + mk(3, 186, 64, 196, 86) + mk(4, 312, 140, 296, 128) + mk(5, 236, 214, 220, 214)
    ),
    partes: [
      ["Bomba de calibração", "Gera a pressão aplicada."],
      ["Padrão", "Manômetro digital ou módulo de pressão rastreável."],
      ["Transmissor em teste", "Recebe a pressão e responde em mA."],
      ["Calibrador de processo", "Alimenta a malha (24 V) e lê a corrente."],
      ["Registro", "Tabela com pontos de 0 a 100 %, subida e descida."],
    ],
    cadeia: [["Gauge", "Aplicar"], ["Eye", "Ler"], ["Calculator", "Calcular erro"], ["Wrench", "Ajustar"], ["ClipboardCheck", "Registrar"]],
    exemplo: [["50 % de 0–10 bar", "5,000 bar"], ["Esperado", "12,00 mA"], ["Lido", "12,10 mA"], ["Erro", "0,625 % do span"]],
    atencao: "Anote o “como encontrado” antes de ajustar: é ele que mostra se o processo foi afetado.",
    chave: "Zero primeiro, span depois, e repita os pontos.",
  },
  {
    id: "areas-ex", mod: 9, titulo: "Áreas classificadas", sub: "Onde pode haver atmosfera explosiva e como proteger o equipamento.",
    arte: svg(
      `<rect x="40" y="20" width="240" height="200" rx="14" fill="${C.green}" opacity=".12"/>` + t(260, 40, "Zona 2", { s: 9, c: C.green, a: "end" }) +
      `<circle cx="160" cy="70" r="56" fill="${C.orange}" opacity=".22"/>` + t(214, 40, "Zona 1", { s: 9, c: C.orange, a: "end" }) +
      tank(110, 80, 100, 130, 0.5) + `<rect x="114" y="84" width="92" height="56" fill="${C.red}" opacity=".25"/>` + t(160, 116, "Zona 0", { s: 9, c: C.red }) +
      pipeV(160, 50, 80, 10) + `<path d="M150 50 h20" stroke="${C.steelD}" stroke-width="3"/>` +
      `<path d="M234 140 l12 -7 h14 l12 7 l-12 7 h-14 Z" fill="${C.yellow}" stroke="${C.ink}"/>` + t(252, 143, "Ex", { s: 8 }) +
      mk(1, 92, 116, 116, 112) + mk(2, 100, 40, 128, 54) + mk(3, 56, 200) + mk(4, 296, 140, 272, 140) + mk(5, 252, 180, 248, 150)
    ),
    partes: [
      ["Zona 0", "Atmosfera explosiva contínua (dentro do tanque)."],
      ["Zona 1", "Provável em operação normal (perto do respiro)."],
      ["Zona 2", "Rara e de curta duração (envoltória)."],
      ["Marcação Ex", "Tipo de proteção, grupo de gás, classe T e EPL."],
      ["Prensa-cabo certificado", "Mantém a proteção do invólucro."],
    ],
    cadeia: [["Flame", "Fonte de risco"], ["Layers", "Zona"], ["Shield", "Tipo de proteção"], ["BookOpen", "Certificado Inmetro"]],
    exemplo: [["Marcação", "Ex db IIC T4 Gb"], ["db", "à prova de explosão"], ["IIC / T4", "todos os gases · ≤ 135 °C"], ["Gb", "adequado à Zona 1"]],
    atencao: "Prensa-cabo comum num invólucro Ex d anula a certificação.",
    chave: "A zona define o nível de proteção exigido do equipamento.",
  },
  {
    id: "sis-sil", mod: 9, titulo: "SIS e SIL", sub: "Camadas de proteção e o sistema instrumentado de segurança.",
    arte: svg(
      [["Emergência", "#e9ecef", 110], ["Alívio (PSV)", "#d7e3f4", 92], ["SIS", "#ffd9c7", 74], ["Alarmes + operador", "#fff1bf", 56], ["Controle (BPCS)", "#d5f0e6", 38], ["Processo", C.navy, 20]].map(([l, c, r], i) =>
        `<circle cx="160" cy="120" r="${r}" fill="${c}" stroke="#fff" stroke-width="2"/>` + (i < 5 ? t(160, 120 - r + 12, l, { s: 7.5, c: C.ink }) : t(160, 124, l, { s: 7.5, c: "#fff" }))).join("") +
      mk(1, 300, 120, 182, 120) + mk(2, 30, 90, 124, 90) + mk(3, 30, 140, 108, 140) + mk(4, 290, 60, 216, 72) + mk(5, 290, 180, 236, 170) + mk(6, 40, 220, 96, 200)
    ),
    partes: [
      ["Processo", "Projeto inerentemente seguro."],
      ["Controle básico (BPCS)", "Mantém o processo dentro da faixa normal."],
      ["Alarmes e operador", "Ação humana em tempo hábil."],
      ["SIS", "Sensor, lógica e elemento final dedicados levam ao estado seguro."],
      ["Alívio", "Válvula de segurança (PSV) e disco de ruptura."],
      ["Emergência", "Contenção, combate e plano de emergência."],
    ],
    cadeia: [["Gauge", "Sensor dedicado"], ["Cpu", "Lógica de segurança"], ["ToggleRight", "Elemento final"], ["ShieldAlert", "Estado seguro"]],
    exemplo: [["SIL 1", "PFDavg 10⁻² a 10⁻¹"], ["SIL 2", "PFDavg 10⁻³ a 10⁻²"], ["Redução de risco SIL 2", "100 a 1 000×"], ["Norma", "IEC 61511"]],
    atencao: "O SIS deve ser independente do controle: não compartilhe o mesmo transmissor.",
    chave: "Cada camada reduz o risco; o SIS é a camada instrumentada.",
  },
];

export const FICHAS = F.map((f, i) => ({ ...f, num: i + 1 }));
