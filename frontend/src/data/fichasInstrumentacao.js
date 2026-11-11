// Fichas visuais de Instrumentação Industrial ("Meu Estudo").
// Cada ficha: ilustração com peças numeradas, cadeia funcional, exemplo numérico,
// alerta e ponto-chave. Valores típicos: confirme sempre no datasheet e na norma.
import { C, svg, t, pipeH, pipeV, flange, flangeH, tx, gauge, tank, valve, block, arrow, wave, mk } from "./fichasArte";

export const MODULOS = [
  "Fundamentos", "Sinais analógicos", "Pressão", "Temperatura", "Vazão",
  "Nível", "Válvulas de controle", "Controle de processo", "Automação e redes", "Calibração e segurança",
  "Analisadores", "Vazão II", "Nível II", "Atuadores e válvulas", "Instalação de campo", "Redes de campo",
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

  // ───────────── Módulo 11 · Analisadores ─────────────
  {
    id: "ph-industrial", mod: 10, titulo: "Medição de pH industrial", sub: "Eletrodo, referência e transmissor para controlar a acidez do processo.",
    arte: svg(
      pipeH(10, 310, 196, 40) + `<rect x="140" y="120" width="40" height="58" rx="4" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      `<rect x="150" y="70" width="20" height="132" rx="10" fill="#e8f1fb" stroke="${C.ink}" stroke-width="1.5"/><circle cx="160" cy="200" r="11" fill="#bfe0ff" stroke="${C.ink}" stroke-width="1.5"/>` +
      `<line x1="160" y1="80" x2="160" y2="192" stroke="${C.blue}" stroke-width="2"/><rect x="164" y="150" width="4" height="10" fill="${C.orange}"/>` +
      `<path d="M160 70 C160 40 200 30 226 40" fill="none" stroke="${C.ink}" stroke-width="3"/>` +
      `<rect x="226" y="20" width="76" height="52" rx="6" fill="${C.navy}"/>` + `<rect x="234" y="28" width="60" height="24" rx="3" fill="#0a0e13"/>` + t(264, 45, "7.02 pH", { s: 9.5, c: "#3ddc84" }) + t(264, 66, "4–20 mA", { s: 7.5, c: "#cfd6de" }) +
      t(60, 230, "processo", { s: 8, c: C.muted, w: 400 }) + arrow(20, 196, 60, 196, C.waterD, 2) +
      mk(1, 116, 208, 148, 202) + mk(2, 116, 150, 150, 150) + mk(3, 204, 160, 168, 156) + mk(4, 204, 124, 180, 132) + mk(5, 264, 92, 264, 72) + mk(6, 186, 30, 176, 46)
    ),
    partes: [
      ["Membrana de vidro", "Bulbo sensível a íons H⁺: gera tensão proporcional ao pH."],
      ["Referência", "Eletrólito (KCl) e junção que fecham o circuito com o processo."],
      ["Sensor de temperatura", "Compensa a inclinação, que muda com a temperatura."],
      ["Porta-sonda", "Fixo ou retrátil: o retrátil permite tirar o eletrodo sem parar o processo."],
      ["Transmissor", "Converte mV em pH, gera 4–20 mA e mostra diagnóstico do eletrodo."],
      ["Cabo de baixo ruído", "O sinal tem altíssima impedância: cabo curto e próprio do fabricante."],
    ],
    cadeia: [["Droplets", "Íons H⁺"], ["Zap", "mV"], ["Thermometer", "Compensação"], ["Cpu", "pH"], ["Activity", "4–20 mA"]],
    exemplo: [["Inclinação teórica (25 °C)", "59,16 mV/pH"], ["Tampão 7 / tampão 4", "−5 mV / +165 mV"], ["Inclinação medida", "≈ 56,7 mV/pH"], ["Eficiência", "≈ 96 % → aceitável"]],
    atencao: "Não deixe o eletrodo secar: guarde em solução de KCl 3 M, nunca em água destilada.",
    chave: "Calibre com dois tampões que envolvam a faixa de trabalho do processo.",
  },
  {
    id: "condutividade", mod: 10, titulo: "Medição de condutividade", sub: "Quanto a solução conduz corrente: pureza da água e concentração.",
    arte: svg(
      pipeH(10, 150, 170, 44) + pipeH(170, 310, 170, 44) +
      `<rect x="60" y="100" width="22" height="70" rx="4" fill="url(#fvStV)" stroke="${C.steelD}"/><rect x="62" y="160" width="6" height="22" fill="${C.ink}"/><rect x="74" y="160" width="6" height="22" fill="${C.ink}"/>` +
      `<path d="M71 100 V60" stroke="${C.ink}" stroke-width="3"/>` + block(36, 26, 70, 34, "2 eletrodos|água pura", C.paper, C.ink, 8) +
      `<rect x="226" y="100" width="22" height="66" rx="4" fill="url(#fvStV)" stroke="${C.steelD}"/><ellipse cx="237" cy="176" rx="16" ry="10" fill="none" stroke="${C.violet}" stroke-width="5"/>` +
      `<path d="M237 100 V60" stroke="${C.ink}" stroke-width="3"/>` + block(200, 26, 74, 34, "toroidal|meio sujo", C.paper, C.ink, 8) +
      `<line x1="160" y1="20" x2="160" y2="220" stroke="${C.steelL}" stroke-width="2"/>` + t(160, 226, "µS/cm · mS/cm", { s: 8, c: C.muted }) +
      mk(1, 34, 186, 60, 176) + mk(2, 280, 196, 252, 180) + mk(3, 108, 120, 84, 130) + mk(4, 280, 120, 250, 130) + mk(5, 140, 44, 108, 44)
    ),
    partes: [
      ["Célula de contato", "Dois (ou quatro) eletrodos: ideal para baixa condutividade, como água de caldeira."],
      ["Sensor toroidal", "Indutivo, sem eletrodo exposto: suporta ácidos, soda e sujeira."],
      ["Constante de célula (K)", "Relaciona a resistência medida à condutividade (em cm⁻¹)."],
      ["Compensação de temperatura", "Referência a 25 °C; em soluções salinas, ~2 % por °C."],
      ["Transmissor", "Mostra µS/cm ou mS/cm e pode calcular concentração."],
    ],
    cadeia: [["Droplets", "Solução"], ["Zap", "Resistência"], ["Calculator", "× constante K"], ["Thermometer", "Ref. 25 °C"], ["Monitor", "µS/cm"]],
    exemplo: [["Constante K", "0,1 cm⁻¹"], ["Resistência medida", "2 000 Ω"], ["κ = K / R", "0,1 / 2 000 = 5 × 10⁻⁵ S/cm"], ["Condutividade", "50 µS/cm"]],
    atencao: "Sem compensação de temperatura, a leitura muda cerca de 2 % por °C mesmo sem mudar o processo.",
    chave: "Água pura: célula de contato com K baixo. Meio agressivo ou sujo: toroidal.",
  },
  {
    id: "o2-zirconia", mod: 10, titulo: "Analisador de O₂ por zircônia", sub: "Oxigênio nos gases de combustão para ajustar o excesso de ar.",
    arte: svg(
      `<rect x="10" y="120" width="300" height="80" fill="#e9ecef" stroke="${C.steelD}"/>` + t(160, 214, "duto de gases de combustão", { s: 8, c: C.muted, w: 400 }) +
      [40, 120, 200, 270].map((x) => `<path d="M${x} 190 q6 -10 0 -20 q-6 -10 0 -20" fill="none" stroke="${C.orange}" stroke-width="2" opacity=".6"/>`).join("") +
      `<rect x="150" y="56" width="20" height="120" rx="4" fill="url(#fvStV)" stroke="${C.steelD}"/><rect x="150" y="150" width="20" height="26" rx="3" fill="#f5e3c8" stroke="${C.ink}"/>` +
      `<rect x="134" y="104" width="52" height="14" fill="url(#fvSt)" stroke="${C.steelD}"/>` +
      `<rect x="130" y="20" width="60" height="36" rx="6" fill="${C.navy}"/>` + t(160, 42, "3,0 % O₂", { s: 8.5, c: "#3ddc84" }) +
      `<path d="M190 38 H250" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="4 3"/>` + block(250, 24, 60, 30, "ar de|referência", C.paper, C.ink, 7.5) +
      `<circle cx="160" cy="163" r="5" fill="${C.red}"/>` +
      mk(1, 116, 168, 150, 166) + mk(2, 216, 86, 172, 90) + mk(3, 204, 168, 166, 166) + mk(4, 116, 110, 134, 110) + mk(5, 110, 36, 130, 36) + mk(6, 280, 70, 280, 54)
    ),
    partes: [
      ["Célula de zircônia", "Cerâmica (ZrO₂) aquecida a ~700 °C que conduz íons de oxigênio."],
      ["Aquecedor", "Mantém a célula na temperatura de trabalho, controlada por termopar."],
      ["Filtro de difusão", "Protege a célula da fuligem e das cinzas."],
      ["Flange de montagem", "Fixa a sonda no duto, no ponto representativo do gás."],
      ["Transmissor", "Calcula o % de O₂ pela equação de Nernst e gera 4–20 mA."],
      ["Ar de referência", "Ar ambiente (20,9 % O₂) do outro lado da célula."],
    ],
    cadeia: [["Flame", "Combustão"], ["Wind", "Gás no duto"], ["Zap", "Tensão de Nernst"], ["Cpu", "% O₂"], ["SlidersHorizontal", "Ajuste do ar"]],
    exemplo: [["O₂ medido", "3,0 %"], ["Excesso de ar ≈ O₂ / (21 − O₂)", "3 / 18"], ["Excesso de ar", "≈ 17 %"], ["Meta típica (gás natural)", "O₂ entre 2 e 3 %"]],
    atencao: "Entrada de ar falso no duto antes da sonda faz o O₂ parecer maior do que é.",
    chave: "O₂ na faixa certa economiza combustível sem gerar CO.",
  },

  // ───────────── Módulo 12 · Vazão II ─────────────
  {
    id: "vortex", mod: 11, titulo: "Medidor vórtex", sub: "Um obstáculo solta vórtices numa frequência proporcional à velocidade.",
    arte: svg(
      pipeH(10, 310, 140, 70) + flange(90, 140, 86) + flange(230, 140, 86) +
      `<path d="M150 108 h20 l-6 64 h-8 Z" fill="${C.ink}"/>` +
      [0, 1, 2].map((i) => `<path d="M${186 + i * 34} ${i % 2 ? 160 : 120} a10 10 0 1 1 0.1 0" fill="none" stroke="${C.orange}" stroke-width="2"/>`).join("") +
      [0, 1, 2].map((i) => `<path d="M${203 + i * 34} ${i % 2 ? 120 : 160} a10 10 0 1 0 0.1 0" fill="none" stroke="${C.blue}" stroke-width="2"/>`).join("") +
      arrow(24, 140, 80, 140, C.waterD, 2.5) + tx(160, 104, 1, "18.0") + `<rect x="156" y="100" width="8" height="10" fill="${C.green}"/>` +
      mk(1, 130, 196, 158, 168) + mk(2, 240, 196, 220, 168) + mk(3, 196, 90, 166, 104) + mk(4, 206, 50, 176, 62) + mk(5, 60, 196, 90, 182)
    ),
    partes: [
      ["Corpo gerador", "Obstáculo (bluff body) que divide o escoamento."],
      ["Vórtices de Von Kármán", "Redemoinhos que se soltam alternadamente de cada lado."],
      ["Sensor", "Piezoelétrico ou capacitivo: conta a frequência dos vórtices."],
      ["Conversor", "Transforma frequência em vazão (fator K) e gera 4–20 mA ou pulsos."],
      ["Trechos retos", "Exigem trecho reto a montante para perfil de velocidade estável."],
    ],
    cadeia: [["Waves", "Escoamento"], ["Target", "Obstáculo"], ["Activity", "Vórtices"], ["Timer", "Frequência"], ["Monitor", "m³/h"]],
    exemplo: [["Fator K", "10 pulsos/L"], ["Frequência", "50 Hz"], ["Vazão", "50 / 10 = 5 L/s"], ["Em m³/h", "18 m³/h"]],
    atencao: "Em baixa velocidade os vórtices ficam instáveis: o medidor tem vazão mínima de corte.",
    chave: "Sem partes móveis: serve para líquido, gás e vapor.",
  },
  {
    id: "ultrassonico-vazao", mod: 11, titulo: "Vazão por ultrassom (tempo de trânsito)", sub: "O som viaja mais rápido a favor do fluxo do que contra ele.",
    arte: svg(
      pipeH(10, 310, 130, 80) + arrow(24, 130, 74, 130, C.waterD, 2.5) +
      `<rect x="80" y="70" width="40" height="22" rx="4" fill="url(#fvBl)" stroke="${C.navy}"/><rect x="200" y="168" width="40" height="22" rx="4" fill="url(#fvBl)" stroke="${C.navy}"/>` +
      `<line x1="104" y1="92" x2="216" y2="168" stroke="${C.orange}" stroke-width="2.2" stroke-dasharray="6 3"/>` +
      arrow(130, 112, 170, 139, C.green, 1.6) + arrow(190, 152, 150, 125, C.red, 1.6) +
      `<path d="M100 70 V40 H240 M220 190 V214 H270 V60 H240" fill="none" stroke="${C.ink}" stroke-width="1.6"/>` +
      `<rect x="232" y="22" width="74" height="40" rx="6" fill="${C.navy}"/>` + t(269, 46, "170 m³/h", { s: 8.5, c: "#3ddc84" }) +
      mk(1, 60, 70, 80, 78) + mk(2, 180, 200, 200, 186) + mk(3, 160, 102, 152, 118) + mk(4, 206, 128, 176, 140) + mk(5, 140, 70, 120, 80) + mk(6, 216, 26, 232, 36)
    ),
    partes: [
      ["Transdutor A", "Emite e recebe pulsos no lado de montante."],
      ["Transdutor B", "Emite e recebe pulsos no lado de jusante."],
      ["Trajeto diagonal", "O som cruza o tubo em ângulo com o escoamento."],
      ["Diferença de tempo", "Δt entre os sentidos é proporcional à velocidade."],
      ["Acoplamento", "Gel ou almofada entre transdutor e tubo (clamp-on)."],
      ["Conversor", "Recebe diâmetro, espessura e material do tubo e calcula a vazão."],
    ],
    cadeia: [["Radio", "Pulso A → B"], ["Radio", "Pulso B → A"], ["Timer", "Δt"], ["Calculator", "Velocidade × área"], ["Monitor", "m³/h"]],
    exemplo: [["Tubo DN 200", "A ≈ 0,0314 m²"], ["Velocidade", "1,5 m/s"], ["Q = v · A", "0,0471 m³/s"], ["Vazão", "≈ 170 m³/h"]],
    atencao: "Bolhas e sólidos atrapalham o tempo de trânsito: em fluido sujo, use o princípio Doppler.",
    chave: "Clamp-on mede sem cortar o tubo: ideal para auditoria e medição temporária.",
  },
  {
    id: "rotametro", mod: 11, titulo: "Rotâmetro (área variável)", sub: "Indicação local simples, sem energia, para pequenas vazões.",
    arte: svg(
      pipeV(160, 200, 236, 14) + pipeV(160, 4, 36, 14) + flangeH(160, 200, 40) + flangeH(160, 36, 40) +
      `<path d="M146 196 L136 40 H184 L174 196 Z" fill="#e8f1fb" stroke="${C.ink}" stroke-width="1.5"/>` +
      Array.from({ length: 6 }, (_, i) => `<line x1="186" y1="${180 - i * 26}" x2="198" y2="${180 - i * 26}" stroke="${C.ink}"/>` + t(204, 183 - i * 26, String(i * 100), { s: 7.5, a: "start" })).join("") +
      `<path d="M150 100 h20 l-6 16 h-8 Z" fill="${C.orange}" stroke="${C.ink}"/>` + `<line x1="140" y1="100" x2="186" y2="100" stroke="${C.red}" stroke-dasharray="3 2"/>` +
      arrow(160, 236, 160, 210, C.waterD, 2) + t(250, 120, "L/h", { s: 9, c: C.muted }) +
      `<rect x="74" y="60" width="34" height="18" rx="4" fill="url(#fvSt)" stroke="${C.steelD}"/><path d="M108 69 h28" stroke="${C.ink}" stroke-width="2"/>` +
      mk(1, 116, 150, 142, 150) + mk(2, 112, 108, 150, 108) + mk(3, 240, 60, 210, 70) + mk(4, 120, 222, 152, 222) + mk(5, 60, 40, 80, 60)
    ),
    partes: [
      ["Tubo cônico", "Mais largo em cima: a área livre cresce com a altura."],
      ["Flutuador", "Sobe até equilibrar peso e força do escoamento."],
      ["Escala", "Lida na borda indicada pelo fabricante (topo ou meio do flutuador)."],
      ["Entrada por baixo", "Montagem sempre vertical, com fluxo de baixo para cima."],
      ["Válvula de agulha", "Ajuste fino de pequenas vazões (purgas, gases)."],
    ],
    cadeia: [["Waves", "Escoamento"], ["MoveVertical", "Flutuador sobe"], ["Ruler", "Área livre"], ["Eye", "Leitura na escala"]],
    exemplo: [["Escala", "0 a 500 L/h"], ["Leitura", "60 % da escala"], ["Vazão", "300 L/h"], ["Outro fluido", "aplicar fator de correção"]],
    atencao: "A escala vale para o fluido e a densidade de calibração: outro fluido exige fator de correção.",
    chave: "Indicação local sem energia, para pequenas vazões e purgas.",
  },

  // ───────────── Módulo 13 · Nível II ─────────────
  {
    id: "nivel-ultrassom", mod: 12, titulo: "Nível ultrassônico", sub: "O eco do som na superfície mede a distância até o produto.",
    arte: svg(
      tank(50, 40, 170, 186, 0.45) + `<rect x="118" y="22" width="34" height="22" rx="4" fill="url(#fvBl)" stroke="${C.navy}"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M${120 - i * 8} ${62 + i * 18} Q135 ${70 + i * 18} ${150 + i * 8} ${62 + i * 18}" fill="none" stroke="${C.orange}" stroke-width="1.8"/>`).join("") +
      arrow(176, 50, 176, 124, C.orange) + arrow(186, 124, 186, 50, C.green) +
      `<path d="M236 40 V222 M232 40 h8 M232 222 h8" stroke="${C.ink}"/>` + t(256, 134, "5,0 m", { s: 8 }) +
      `<rect x="56" y="48" width="158" height="10" fill="${C.red}" opacity=".12"/>` + `<circle cx="135" cy="36" r="2" fill="${C.yellow}"/>` +
      mk(1, 92, 22, 118, 30) + mk(2, 92, 92, 112, 84) + mk(3, 160, 146, 168, 124) + mk(4, 206, 88, 182, 88) + mk(5, 270, 90, 240, 90) + mk(6, 260, 52, 216, 54)
    ),
    partes: [
      ["Transdutor", "Emite o pulso sonoro e recebe o eco."],
      ["Pulso sonoro", "Abre em cone a partir do transdutor."],
      ["Eco", "Reflexão na superfície do líquido."],
      ["Distância", "d = v × t / 2 (som ≈ 343 m/s a 20 °C)."],
      ["Altura de referência", "Nível = altura total − distância medida."],
      ["Zona morta", "Faixa junto ao transdutor sem medição."],
    ],
    cadeia: [["Radio", "Emite"], ["Waves", "Reflete"], ["Timer", "Tempo de ida e volta"], ["Thermometer", "Compensa temperatura"], ["Monitor", "Nível"]],
    exemplo: [["Tempo de ida e volta", "20 ms"], ["Distância", "343 × 0,020 / 2 ≈ 3,43 m"], ["Altura do tanque", "5,0 m"], ["Nível", "≈ 1,57 m"]],
    atencao: "Espuma, vapor e poeira absorvem o som: nesses casos, prefira radar.",
    chave: "Barato e sem contato: ótimo para água e efluentes em tanque aberto.",
  },
  {
    id: "nivel-capacitivo", mod: 12, titulo: "Nível capacitivo", sub: "Sonda e parede do tanque formam um capacitor que muda com o nível.",
    arte: svg(
      tank(70, 30, 150, 196, 0.5) + `<rect x="139" y="14" width="12" height="196" rx="6" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      `<rect x="128" y="2" width="34" height="18" rx="4" fill="url(#fvBl)" stroke="${C.navy}"/>` +
      [70, 100, 130].map((y) => `<path d="M151 ${y + 70} H212" stroke="${C.violet}" stroke-width="1.2" stroke-dasharray="3 2"/>`).join("") +
      t(186, 132, "C", { s: 13, c: C.violet }) +
      block(236, 40, 76, 56, "vazio 50 pF|cheio 250 pF", C.paper, C.ink, 7.5) + `<path d="M162 11 H274 V40" fill="none" stroke="${C.ink}" stroke-width="1.4"/>` +
      mk(1, 116, 60, 139, 60) + mk(2, 236, 196, 216, 196) + mk(3, 104, 190, 120, 180) + mk(4, 110, 12, 128, 12) + mk(5, 274, 112, 274, 96)
    ),
    partes: [
      ["Sonda", "Haste isolada que funciona como uma das placas."],
      ["Parede do tanque", "A outra placa (ou um tubo de referência em tanque não metálico)."],
      ["Produto (dielétrico)", "Quanto mais produto entre as placas, maior a capacitância."],
      ["Eletrônica", "Mede a capacitância e gera o sinal de nível."],
      ["Calibração", "Ajuste de vazio (zero) e cheio (span) com o produto real."],
    ],
    cadeia: [["Droplets", "Nível sobe"], ["Layers", "Mais dielétrico"], ["Zap", "Capacitância"], ["Cpu", "Eletrônica"], ["Monitor", "% nível"]],
    exemplo: [["Tanque vazio", "50 pF"], ["Tanque cheio", "250 pF"], ["Medido", "150 pF"], ["Nível", "(150 − 50) / 200 = 50 %"]],
    atencao: "Produto que gruda na sonda ou muda de constante dielétrica altera a leitura.",
    chave: "Serve para líquidos e sólidos, mas exige calibração com o produto real.",
  },
  {
    id: "selo-remoto", mod: 12, titulo: "Selo remoto com capilar", sub: "Isola o transmissor de fluidos agressivos, viscosos, quentes ou sanitários.",
    arte: svg(
      tank(30, 30, 110, 196, 0.6) + `<rect x="140" y="176" width="14" height="26" fill="url(#fvStV)" stroke="${C.steelD}"/><rect x="140" y="50" width="14" height="26" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      `<rect x="150" y="180" width="6" height="18" fill="${C.orange}"/><rect x="150" y="54" width="6" height="18" fill="${C.orange}"/>` +
      `<path d="M156 189 C220 189 200 140 230 140" fill="none" stroke="${C.ink}" stroke-width="2"/><path d="M156 63 C240 63 200 120 250 128" fill="none" stroke="${C.ink}" stroke-width="2"/>` +
      `<rect x="222" y="124" width="70" height="30" rx="5" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(257, 143, "DP", { s: 10, c: "#fff" }) +
      `<path d="M172 63 V189" stroke="${C.muted}" stroke-dasharray="3 2"/>` + t(184, 130, "3 m", { s: 8, a: "start" }) +
      mk(1, 166, 212, 154, 196) + mk(2, 180, 86, 192, 72) + mk(3, 210, 100, 214, 92) + mk(4, 300, 170, 270, 154) + mk(5, 104, 14, 140, 56)
    ),
    partes: [
      ["Diafragma do selo", "Faceado com o processo: não entope nem acumula produto."],
      ["Fluido de enchimento", "Silicone, óleo sanitário etc.: transmite a pressão até a célula."],
      ["Capilar", "Tubo blindado que liga selo e transmissor."],
      ["Transmissor DP", "Mede a diferença entre os dois selos."],
      ["Flange de processo", "Fixa o selo no tanque ou na linha."],
    ],
    cadeia: [["Droplets", "Processo"], ["Layers", "Diafragma"], ["Cable", "Capilar com fluido"], ["Gauge", "Célula DP"], ["Monitor", "% nível"]],
    exemplo: [["Distância vertical entre selos", "3 m"], ["Densidade do fluido de enchimento", "930 kg/m³"], ["Coluna do capilar", "930 × 9,81 × 3 ≈ 27,4 kPa"], ["Zero do transmissor", "deslocado de −27,4 kPa"]],
    atencao: "Capilar ao sol muda de temperatura e gera erro: proteja e mantenha os dois capilares juntos.",
    chave: "O selo isola o transmissor; o capilar fixa uma coluna que precisa entrar no cálculo do zero.",
  },

  // ───────────── Módulo 14 · Atuadores e válvulas ─────────────
  {
    id: "solenoide", mod: 13, titulo: "Válvula solenoide", sub: "Abre ou fecha a passagem com um comando elétrico.",
    arte: svg(
      pipeH(10, 110, 180, 30) + pipeH(210, 310, 180, 30) + `<path d="M110 158 H210 V202 H110 Z" fill="url(#fvSt)" stroke="${C.steelD}"/>` +
      `<path d="M150 202 V180 H170 V158" fill="none" stroke="${C.ink}" stroke-width="3"/>` +
      `<rect x="136" y="50" width="48" height="90" rx="6" fill="#c9a227" stroke="${C.ink}"/>` + Array.from({ length: 7 }, (_, i) => `<line x1="136" y1="${60 + i * 11}" x2="184" y2="${60 + i * 11}" stroke="#8a6d10"/>`).join("") +
      `<rect x="152" y="70" width="16" height="78" rx="3" fill="url(#fvStV)" stroke="${C.steelD}"/>` + `<path d="M154 40 l6 -5 l6 5 l-6 5 z" fill="none"/>` +
      `<path d="M160 50 l-6 -4 l12 -4 l-12 -4 l12 -4 l-6 -4" fill="none" stroke="${C.ink}" stroke-width="1.5"/>` +
      `<rect x="192" y="80" width="40" height="30" rx="4" fill="${C.ink}"/>` + t(212, 99, "24 V", { s: 8, c: "#fff" }) + arrow(30, 180, 80, 180, C.waterD, 2.5) +
      mk(1, 110, 70, 136, 76) + mk(2, 110, 120, 152, 124) + mk(3, 186, 30, 166, 34) + mk(4, 190, 222, 168, 196) + mk(5, 70, 220, 112, 196) + mk(6, 256, 70, 232, 88)
    ),
    partes: [
      ["Bobina", "Energizada, cria o campo que puxa o núcleo."],
      ["Núcleo móvel", "Êmbolo que abre ou fecha o orifício."],
      ["Mola", "Devolve o núcleo à posição de repouso (NF ou NA)."],
      ["Orifício e sede", "Passagem do fluido; vedação na posição fechada."],
      ["Corpo", "Seta indica o sentido do fluxo."],
      ["Conector", "Plugue DIN; versões com LED e supressor de surto."],
    ],
    cadeia: [["Cpu", "Saída do CLP"], ["Zap", "Bobina"], ["MoveVertical", "Núcleo"], ["Droplets", "Abre/fecha"]],
    exemplo: [["Bobina", "24 Vcc · 8 W"], ["Corrente", "8 / 24 ≈ 0,33 A"], ["Saída do CLP", "≥ 0,5 A ou relé de interface"], ["Proteção em CC", "diodo de roda livre"]],
    atencao: "Servo-operada precisa de ΔP mínimo para abrir: sem pressão diferencial, ela não opera.",
    chave: "Solenoide é liga/desliga: para regular vazão, use válvula de controle.",
  },
  {
    id: "atuador-rotativo", mod: 13, titulo: "Atuador rotativo e chaves fim de curso", sub: "Válvulas de 90° automatizadas com confirmação de posição.",
    arte: svg(
      pipeH(10, 120, 190, 30) + pipeH(200, 310, 190, 30) + `<circle cx="160" cy="190" r="34" fill="url(#fvSt)" stroke="${C.steelD}" stroke-width="2"/><rect x="156" y="160" width="8" height="60" rx="3" fill="${C.ink}" transform="rotate(35 160 190)"/>` +
      `<rect x="154" y="140" width="12" height="16" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      `<rect x="100" y="96" width="120" height="44" rx="8" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(160, 122, "pinhão-cremalheira", { s: 7.5, c: "#fff" }) +
      `<rect x="134" y="60" width="52" height="36" rx="5" fill="${C.yellow}" stroke="${C.ink}"/>` + t(160, 82, "ZSO/ZSC", { s: 7.5 }) +
      `<path d="M150 56 L160 40 L170 56 Z" fill="${C.red}"/>` + `<rect x="226" y="104" width="40" height="28" rx="4" fill="${C.ink}"/>` + t(246, 122, "SOV", { s: 8, c: "#fff" }) +
      `<rect x="272" y="104" width="34" height="28" rx="4" fill="url(#fvSt)" stroke="${C.steelD}"/>` + t(289, 146, "ar", { s: 8, c: C.green }) +
      mk(1, 80, 118, 100, 118) + mk(2, 214, 226, 186, 206) + mk(3, 110, 66, 134, 74) + mk(4, 246, 84, 246, 104) + mk(5, 196, 36, 170, 46) + mk(6, 289, 84, 289, 104)
    ),
    partes: [
      ["Atuador pinhão-cremalheira", "Dupla ação ou simples ação (retorno por mola)."],
      ["Válvula de 90°", "Borboleta ou esfera, para bloqueio ou controle simples."],
      ["Caixa de chaves fim de curso", "ZSO (aberta) e ZSC (fechada) confirmam a posição ao CLP."],
      ["Solenoide (SOV)", "Montagem NAMUR direto no atuador: 3/2 (mola) ou 5/2 (dupla ação)."],
      ["Indicador visual", "Mostra no campo se a válvula está aberta ou fechada."],
      ["Filtro regulador", "Ar limpo, seco e na pressão da placa do atuador."],
    ],
    cadeia: [["Cpu", "DO do CLP"], ["Zap", "Solenoide"], ["Wind", "Ar no atuador"], ["Repeat", "Gira 90°"], ["ToggleRight", "ZSO confirma"]],
    exemplo: [["Comando", "abrir em t = 0"], ["Tempo de curso esperado", "≈ 3 s"], ["Supervisão no CLP", "alarme se ZSO > 5 s"], ["Alarme", "falha de abertura"]],
    atencao: "Dupla ação fica na última posição sem ar; só o retorno por mola garante posição segura.",
    chave: "A chave fim de curso prova ao CLP que a válvula realmente se moveu.",
  },
  {
    id: "cavitacao", mod: 13, titulo: "Cavitação e flashing", sub: "Quando a pressão na válvula cai abaixo da pressão de vapor do líquido.",
    arte: svg(
      `<path d="M20 110 H300 M20 110 V20" stroke="${C.ink}" stroke-width="1.2"/>` + t(14, 24, "P", { s: 9, a: "end" }) +
      `<line x1="20" y1="78" x2="300" y2="78" stroke="${C.red}" stroke-dasharray="5 3"/>` + t(296, 72, "Pv", { s: 9, c: C.red, a: "end" }) +
      `<path d="M20 30 H110 C140 30 140 96 160 96 C190 96 200 50 300 52" fill="none" stroke="${C.blue}" stroke-width="2.6"/>` + t(250, 46, "cavitação", { s: 8, c: C.blue }) +
      `<path d="M20 30 H110 C140 30 140 100 160 100 C190 100 200 90 300 92" fill="none" stroke="${C.orange}" stroke-width="2.6" stroke-dasharray="7 3"/>` + t(250, 104, "flashing", { s: 8, c: C.orange }) +
      pipeH(10, 120, 180, 26) + pipeH(200, 310, 180, 26) + valve(160, 180, 1.1) +
      [214, 230, 248, 266].map((x, i) => `<circle cx="${x}" cy="${176 + (i % 2) * 6}" r="${3 + (i % 2)}" fill="#fff" stroke="${C.blue}"/>`).join("") +
      mk(1, 60, 18, 60, 30) + mk(2, 160, 124, 160, 100) + mk(3, 120, 68, 120, 78) + mk(4, 276, 30, 276, 52) + mk(5, 238, 214, 238, 186) + mk(6, 286, 124, 276, 96)
    ),
    partes: [
      ["Pressão de entrada (P1)", "Pressão antes da válvula."],
      ["Vena contracta", "Ponto de maior velocidade e menor pressão dentro da válvula."],
      ["Pressão de vapor (Pv)", "Abaixo dela, o líquido ferve."],
      ["Recuperação", "Depois da vena, a pressão sobe de novo até P2."],
      ["Cavitação", "P2 volta acima de Pv: as bolhas implodem e arrancam metal."],
      ["Flashing", "P2 fica abaixo de Pv: o vapor segue na linha e erode por velocidade."],
    ],
    cadeia: [["Gauge", "P1"], ["Waves", "Vena contracta"], ["Thermometer", "Abaixo de Pv?"], ["TriangleAlert", "Bolhas"], ["Wrench", "Dano ao trim"]],
    exemplo: [["Água a 80 °C", "Pv ≈ 0,47 bar(a)"], ["P2 = 0,4 bar(a)", "flashing"], ["P2 = 2 bar(a), vena < Pv", "cavitação"], ["Solução", "trim anticavitação ou estágios"]],
    atencao: "Cavitação faz ruído de cascalho na linha, vibra e destrói o trim em pouco tempo.",
    chave: "Dividir a queda de pressão em estágios evita que a vena contracta caia abaixo de Pv.",
  },

  // ───────────── Módulo 15 · Instalação de campo ─────────────
  {
    id: "diagrama-malha", mod: 14, titulo: "Diagrama de malha", sub: "O caminho do sinal, borne por borne, do campo até o sistema.",
    arte: svg(
      tx(40, 200, 0.9, "PT") + block(80, 150, 56, 50, "JB-03|5 · 6", C.paper, C.ink, 8) + block(170, 140, 60, 70, "X1|21 · 22", "#e5e7eb", C.ink, 8) +
      `<rect x="256" y="120" width="48" height="100" rx="5" fill="${C.blue}"/>` + t(280, 160, "AI", { s: 10, c: "#fff" }) + t(280, 178, "R1 S4", { s: 7, c: "#fff" }) + t(280, 192, "CH2", { s: 7, c: "#fff" }) +
      `<path d="M52 166 H80 M52 172 H80" stroke="${C.red}" stroke-width="1.8"/><path d="M136 168 H170 M136 178 H170" stroke="${C.ink}" stroke-width="3"/><path d="M230 170 H256 M230 180 H256" stroke="${C.ink}" stroke-width="1.8"/>` +
      t(153, 196, "MC-03 par 3", { s: 7, c: C.muted }) + t(40, 230, "campo", { s: 8, c: C.muted, w: 400 }) + t(200, 230, "painel", { s: 8, c: C.muted, w: 400 }) +
      `<line x1="150" y1="40" x2="150" y2="224" stroke="${C.steelL}" stroke-width="2" stroke-dasharray="6 4"/>` +
      block(20, 26, 110, 40, "PT-101|pressão do vaso", C.navy, "#fff", 8) +
      mk(1, 40, 112, 40, 150) + mk(2, 108, 128, 108, 150) + mk(3, 153, 124, 153, 168) + mk(4, 200, 118, 200, 140) + mk(5, 280, 100, 280, 120) + mk(6, 260, 40)
    ),
    partes: [
      ["Instrumento de campo", "Tag (ex.: PT-101) e bornes + e −."],
      ["Caixa de junção (JB)", "Reúne os pares do campo em um cabo multivias."],
      ["Multicabo", "Identificado por número e par (ex.: MC-03, par 3)."],
      ["Painel de distribuição", "Bornes de interligação com o sistema (marshalling)."],
      ["Cartão de E/S", "Rack, slot e canal onde o sinal entra no CLP/SDCD."],
      ["Identificação", "Anilhas, plaquetas e tag no sistema iguais ao documento."],
    ],
    cadeia: [["Gauge", "Campo"], ["Plug", "Caixa de junção"], ["Cable", "Multicabo"], ["Layers", "Painel"], ["Cpu", "Cartão AI"]],
    exemplo: [["PT-101", "JB-03 bornes 5/6"], ["Cabo", "MC-03, par 3"], ["Painel", "X1:21/22"], ["Sistema", "AI rack 1, slot 4, canal 2"]],
    atencao: "Diagrama desatualizado custa horas de manutenção: atualize (as built) a cada alteração.",
    chave: "Com o diagrama de malha você segue o sinal do campo ao sistema sem abrir caixa por caixa.",
  },
  {
    id: "aterramento-blindagem", mod: 14, titulo: "Aterramento e blindagem de sinais", sub: "Torcer, blindar, separar e aterrar em um ponto só.",
    arte: svg(
      `<rect x="20" y="40" width="70" height="60" rx="6" fill="${C.paper}" stroke="${C.ink}"/>` + t(55, 74, "campo", { s: 9 }) +
      `<rect x="230" y="30" width="76" height="80" rx="6" fill="#e5e7eb" stroke="${C.ink}"/>` + t(268, 74, "painel", { s: 9 }) +
      `<rect x="90" y="60" width="140" height="20" rx="10" fill="#cfd8e3" stroke="${C.steelD}"/>` +
      wave(94, 226, 66, 3, 10, C.red, 1.6) + wave(99, 226, 74, 3, 10, C.ink, 1.6) +
      `<path d="M230 90 V150 M220 150 h20 M224 156 h12 M228 162 h4" stroke="${C.green}" stroke-width="2"/>` +
      `<path d="M90 92 V130" stroke="${C.red}" stroke-width="1.6" stroke-dasharray="3 2"/>` + t(90, 144, "não aterrar", { s: 8, c: C.red }) +
      `<rect x="20" y="186" width="130" height="16" rx="3" fill="#ffe1d6" stroke="${C.orange}"/>` + t(85, 198, "bandeja de potência", { s: 7.5, c: C.orange }) +
      `<rect x="170" y="186" width="130" height="16" rx="3" fill="#dbeafe" stroke="${C.blue}"/>` + t(235, 198, "bandeja de sinal", { s: 7.5, c: C.blue }) +
      mk(1, 160, 40, 160, 64) + mk(2, 160, 106, 160, 80) + mk(3, 262, 150, 236, 150) + mk(4, 60, 130, 88, 120) + mk(5, 160, 222, 160, 202)
    ),
    partes: [
      ["Par trançado", "A torção cancela o ruído induzido por campos magnéticos."],
      ["Blindagem", "Malha ou fita metálica que desvia o ruído elétrico."],
      ["Aterramento no painel", "Blindagem ligada à barra de terra de instrumentação em um só ponto."],
      ["Ponta do campo", "Blindagem isolada (cortada e protegida) no lado do instrumento."],
      ["Separação de bandejas", "Cabos de sinal longe dos cabos de potência e de inversores."],
    ],
    cadeia: [["Cable", "Torcer"], ["Shield", "Blindar"], ["Layers", "Separar"], ["Plug", "Aterrar em 1 ponto"]],
    exemplo: [["Sintoma", "4–20 mA oscilando ±0,3 mA"], ["Causa", "blindagem aterrada nas duas pontas"], ["Correção", "aterrar só no painel"], ["Resultado", "sinal estável"]],
    atencao: "Blindagem aterrada nas duas pontas forma laço de terra e injeta ruído no sinal.",
    chave: "Ruído se resolve na instalação; filtro no software só esconde o problema.",
  },
  {
    id: "barreira-ex-i", mod: 14, titulo: "Barreira de segurança intrínseca", sub: "Limita a energia que chega à área classificada.",
    arte: svg(
      `<rect x="10" y="20" width="140" height="210" rx="8" fill="${C.orange}" opacity=".12"/>` + t(80, 38, "área classificada", { s: 8.5, c: C.orange }) +
      `<rect x="170" y="20" width="140" height="210" rx="8" fill="${C.green}" opacity=".1"/>` + t(240, 38, "área segura", { s: 8.5, c: C.green }) +
      tx(70, 170, 1.1, "Ex i") + `<path d="M80 150 H196 M80 158 H196" stroke="#2f7de1" stroke-width="3"/>` +
      `<rect x="196" y="120" width="34" height="70" rx="4" fill="${C.yellow}" stroke="${C.ink}"/>` + t(213, 158, "BAR", { s: 7.5 }) +
      `<rect x="250" y="110" width="44" height="90" rx="4" fill="${C.blue}"/>` + t(272, 158, "AI", { s: 10, c: "#fff" }) +
      `<path d="M230 150 H250 M230 160 H250" stroke="${C.ink}" stroke-width="2"/>` +
      block(176, 60, 128, 40, "Uo 28 V · Io 93 mA|Co 83 nF", C.paper, C.ink, 7.5) +
      mk(1, 30, 120, 52, 130) + mk(2, 130, 136, 130, 150) + mk(3, 213, 210, 213, 190) + mk(4, 160, 216) + mk(5, 272, 220, 272, 200) + mk(6, 240, 112, 240, 100)
    ),
    partes: [
      ["Instrumento Ex i", "Certificado com seus parâmetros de entrada (Ui, Ii, Ci, Li)."],
      ["Cabo azul", "Identifica o circuito intrinsecamente seguro."],
      ["Barreira / isolador", "Limita tensão e corrente (Uo, Io) que vão ao campo."],
      ["Fronteira", "A barreira fica na área segura, na entrada do painel."],
      ["Cartão do CLP", "Recebe o sinal já isolado."],
      ["Parâmetros de entidade", "Uo ≤ Ui, Io ≤ Ii e Ci + C do cabo ≤ Co."],
    ],
    cadeia: [["Plug", "Painel"], ["Shield", "Barreira limita"], ["Cable", "Cabo azul"], ["Gauge", "Instrumento Ex i"]],
    exemplo: [["Barreira", "Uo 28 V · Io 93 mA · Co 83 nF"], ["Instrumento", "Ui 30 V · Ii 100 mA · Ci 5 nF"], ["Cabo 300 m (200 nF/km)", "60 nF"], ["5 + 60 = 65 nF ≤ 83 nF", "aprovado ✓"]],
    atencao: "Não misture circuitos Ex i com outros no mesmo borne ou multicabo sem a separação exigida.",
    chave: "Ex i é o tipo de proteção que permite manutenção com o circuito energizado.",
  },

  // ───────────── Módulo 16 · Redes de campo ─────────────
  {
    id: "fieldbus-segmento", mod: 15, titulo: "Segmento Fieldbus / Profibus PA", sub: "Vários instrumentos alimentados e comunicando no mesmo par de fios.",
    arte: svg(
      block(10, 30, 70, 44, "fonte /|condicionador", C.navy, "#fff", 8) + `<path d="M80 52 H300" stroke="${C.orange}" stroke-width="5"/>` +
      `<rect x="292" y="40" width="18" height="24" rx="3" fill="${C.yellow}" stroke="${C.ink}"/><rect x="82" y="40" width="18" height="24" rx="3" fill="${C.yellow}" stroke="${C.ink}"/>` +
      [130, 190, 250].map((x) => `<rect x="${x - 14}" y="70" width="28" height="18" rx="3" fill="#e5e7eb" stroke="${C.ink}"/><path d="M${x} 88 V150" stroke="${C.orange}" stroke-width="2.5"/>` + tx(x, 196, 0.85, "PA")).join("") +
      t(190, 230, "spurs (derivações)", { s: 8, c: C.muted }) + t(190, 44, "tronco", { s: 8, c: C.orange }) +
      mk(1, 44, 92, 44, 74) + mk(2, 220, 24, 220, 50) + mk(3, 104, 120, 128, 120) + mk(4, 300, 90, 300, 64) + mk(5, 276, 150, 258, 160) + mk(6, 160, 110, 144, 82)
    ),
    partes: [
      ["Fonte / condicionador", "Alimenta o segmento e isola a comunicação da fonte."],
      ["Tronco", "Cabo principal do segmento."],
      ["Derivações (spurs)", "Ligam cada instrumento ao tronco."],
      ["Terminadores", "Um em cada ponta do tronco (100 Ω + 1 µF)."],
      ["Instrumentos", "Até ~32 por segmento (menos em área classificada ou por consumo)."],
      ["Caixa de derivação", "Bloco com proteção contra curto em cada spur."],
    ],
    cadeia: [["Plug", "Fonte"], ["Cable", "Tronco"], ["Network", "Derivações"], ["Gauge", "Instrumentos"], ["Server", "Sistema"]],
    exemplo: [["Velocidade (H1/PA)", "31,25 kbit/s"], ["Comprimento total", "até 1 900 m"], ["Consumo: 10 × 20 mA", "200 mA ≤ 500 mA da fonte ✓"], ["Tensão mínima no instrumento", "9 V"]],
    atencao: "Falta de terminador ou terminador duplo derruba a comunicação do segmento inteiro.",
    chave: "Um par de fios leva energia e dados para vários instrumentos.",
  },
  {
    id: "modbus-rtu", mod: 15, titulo: "Modbus RTU em RS-485", sub: "Um mestre pergunta, cada escravo responde pelo seu endereço.",
    arte: svg(
      block(10, 96, 66, 50, "Mestre|CLP", C.navy, "#fff", 9) +
      `<path d="M76 112 H300 M76 128 H300" stroke="${C.ink}" stroke-width="2"/>` + t(290, 106, "A", { s: 8, a: "end" }) + t(290, 142, "B", { s: 8, a: "end" }) +
      [[130, 1], [200, 5], [270, 12]].map(([x, n]) => `<path d="M${x} 112 V170 M${x + 8} 128 V170" stroke="${C.ink}" stroke-width="1.5"/>` + block(x - 22, 170, 52, 40, `Escravo|end. ${n}`, C.paper, C.ink, 7.5)).join("") +
      `<rect x="80" y="104" width="10" height="32" rx="2" fill="${C.yellow}" stroke="${C.ink}"/><rect x="300" y="104" width="10" height="32" rx="2" fill="${C.yellow}" stroke="${C.ink}"/>` +
      block(100, 26, 150, 40, "03 · end. 5 · reg. 0 · 9 600 8N1", C.paper, C.blue, 7.5) + arrow(175, 66, 205, 104, C.blue, 1.2) +
      mk(1, 44, 80, 44, 96) + mk(2, 200, 230, 204, 210) + mk(3, 164, 84, 160, 110) + mk(4, 300, 160, 305, 136) + mk(5, 120, 154, 132, 140) + mk(6, 260, 40, 250, 46)
    ),
    partes: [
      ["Mestre", "CLP ou SCADA: é o único que inicia a comunicação."],
      ["Escravos", "Endereços de 1 a 247, sem repetir."],
      ["Par A/B", "Par trançado blindado, mais a referência comum."],
      ["Terminação", "Resistor de 120 Ω nas duas pontas do barramento."],
      ["Topologia", "Barramento em série (daisy-chain), sem estrela."],
      ["Quadro", "Função, endereço, registrador e parâmetros seriais."],
    ],
    cadeia: [["Cpu", "Mestre pergunta"], ["Cable", "RS-485"], ["Server", "Escravo responde"], ["Database", "Registradores"]],
    exemplo: [["Escravo", "endereço 5"], ["Função", "03 (holding registers)"], ["Registrador 40001", "endereço 0"], ["Serial", "9 600 bps, 8N1"]],
    atencao: "Todos no barramento precisam do mesmo baud rate e paridade, e endereços nunca podem se repetir.",
    chave: "Simples e universal: quase todo medidor, inversor e controlador fala Modbus.",
  },
  {
    id: "io-link", mod: 15, titulo: "IO-Link", sub: "Sensor inteligente com cabo comum: dado, parâmetro e diagnóstico.",
    arte: svg(
      `<rect x="110" y="20" width="100" height="70" rx="6" fill="${C.navy}"/>` + t(160, 46, "Mestre IO-Link", { s: 8.5, c: "#fff" }) +
      [0, 1, 2, 3].map((i) => `<circle cx="${126 + i * 22}" cy="72" r="6" fill="#cfd6de" stroke="#fff"/>`).join("") +
      `<path d="M160 20 V6 H300" fill="none" stroke="${C.green}" stroke-width="2.5"/>` + t(296, 18, "Profinet / EtherNet/IP", { s: 7.5, c: C.green, a: "end" }) +
      [[40, "sensor"], [120, "válvula"], [200, "sensor"], [280, "display"]].map(([x, l], i) => `<path d="M${126 + i * 22} 78 C${126 + i * 22} 130 ${x} 120 ${x} 168" fill="none" stroke="#3a4654" stroke-width="3"/>` +
        `<rect x="${x - 22}" y="168" width="44" height="34" rx="6" fill="url(#fvBl)" stroke="${C.navy}"/>` + t(x, 216, l, { s: 7.5 })).join("") +
      t(60, 156, "M12 · 3 fios · até 20 m", { s: 7.5, c: C.muted }) +
      mk(1, 92, 40, 110, 46) + mk(2, 74, 116, 70, 136) + mk(3, 40, 230, 40, 202) + mk(4, 236, 56, 210, 60) + mk(5, 186, 30, 186, 6) + mk(6, 280, 140, 280, 168)
    ),
    partes: [
      ["Mestre IO-Link", "Cada porta atende um dispositivo (ponto a ponto)."],
      ["Cabo M12 de 3 fios", "Cabo padrão, sem blindagem, até 20 m."],
      ["Dispositivo IO-Link", "Sensor ou atuador com dados de processo e diagnóstico."],
      ["Parâmetros (IODD)", "Arquivo que descreve o dispositivo e seus ajustes."],
      ["Rede superior", "O mestre entrega tudo ao CLP via Profinet, EtherNet/IP etc."],
      ["Backup de parâmetros", "Na troca do sensor, o mestre recarrega a configuração."],
    ],
    cadeia: [["Gauge", "Sensor"], ["Cable", "Cabo M12"], ["Cpu", "Mestre"], ["Network", "Rede industrial"], ["Monitor", "CLP"]],
    exemplo: [["COM1 / COM2 / COM3", "4,8 / 38,4 / 230,4 kbit/s"], ["Cabo", "até 20 m"], ["Troca de sensor", "parâmetros recarregados"], ["Sinal adicional", "diagnóstico e contador"]],
    atencao: "IO-Link não é rede: cada dispositivo ocupa uma porta do mestre.",
    chave: "Tira o sensor do modo “caixa-preta”: o CLP vê valor, parâmetro e estado.",
  },
];

export const FICHAS = F.map((f, i) => ({ ...f, num: i + 1 }));
