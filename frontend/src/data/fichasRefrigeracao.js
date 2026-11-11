// Fichas visuais de Automação de Refrigeração ("Meu Estudo").
// Mesmo formato das fichas de instrumentação. Valores típicos: confirme no datasheet do fabricante.
import { C, svg, t, pipeH, pipeV, flange, tx, gauge, tank, valve, block, arrow, wave, mk } from "./fichasArte";

export const MODULOS = [
  "Ciclo frigorífico", "Sensores", "Expansão", "Proteções",
  "Controle de câmara", "Quadro e motores", "Inversor e HVAC", "Diagnóstico e serviço",
];

// Serpentina (condensador/evaporador) em zigue-zague.
const coil = (x1, x2, y, a, c) => {
  let d = `M${x1} ${y}`, s = 1;
  for (let x = x1 + 12; x <= x2; x += 12) { d += ` L${x} ${y + a * s}`; s *= -1; }
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`;
};
const compressor = (x, y, r = 22) => `<ellipse cx="${x}" cy="${y + r * 0.9}" rx="${r}" ry="${r * 0.35}" fill="#7a8693"/><rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 1.9}" rx="${r * 0.8}" fill="url(#fvStV)" stroke="${C.steelD}"/>` + t(x, y + 4, "C", { s: 12 });
const fan = (x, y, r = 16) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#eef2f5" stroke="${C.steelD}"/>` +
  [0, 120, 240].map((a) => `<ellipse cx="${x}" cy="${y - r * 0.45}" rx="${r * 0.22}" ry="${r * 0.48}" fill="${C.steelD}" transform="rotate(${a} ${x} ${y})"/>`).join("") + `<circle cx="${x}" cy="${y}" r="2.5" fill="${C.ink}"/>`;
const display = (x, y, w, txt, cor = "#ff5640") => `<rect x="${x}" y="${y}" width="${w}" height="${w * 0.42}" rx="4" fill="#0a0e13" stroke="${C.ink}"/>` + t(x + w / 2, y + w * 0.3, txt, { s: w * 0.22, c: cor });

const F = [
  // ───────────── Módulo 1 · Ciclo frigorífico ─────────────
  {
    id: "ciclo", mod: 0, titulo: "Ciclo de refrigeração", sub: "Quatro componentes movem o calor de dentro para fora.",
    arte: svg(
      `<path d="M262 96 V36 H230" fill="none" stroke="${C.red}" stroke-width="4"/>` + coil(70, 230, 36, 8, C.red) + `<path d="M70 36 H40 V100" fill="none" stroke="${C.red}" stroke-width="4"/>` +
      `<path d="M40 140 V204 H70" fill="none" stroke="${C.blue}" stroke-width="4"/>` + coil(70, 230, 204, 8, C.blue) + `<path d="M230 204 H262 V150" fill="none" stroke="${C.blue}" stroke-width="4"/>` +
      `<path d="M28 100 H52 L40 120 Z M28 140 H52 L40 120 Z" fill="${C.orange}" stroke="${C.ink}"/>` + compressor(262, 122, 24) +
      fan(150, 70, 14) + fan(150, 172, 14) + arrow(150, 54, 150, 20, C.red, 1.4) + arrow(150, 226, 150, 192, C.blue, 1.4) +
      t(206, 104, "alta pressão", { s: 8, c: C.red }) + t(110, 146, "baixa pressão", { s: 8, c: C.blue }) +
      mk(1, 300, 100, 284, 112) + mk(2, 110, 14, 110, 36) + mk(3, 70, 120, 50, 120) + mk(4, 110, 230, 110, 206) + mk(5, 210, 70, 166, 70)
    ),
    partes: [
      ["Compressor", "Aspira vapor a baixa pressão e o descarrega a alta pressão e alta temperatura."],
      ["Condensador", "Rejeita o calor ao ar externo; o vapor vira líquido."],
      ["Dispositivo de expansão", "Derruba a pressão; parte do líquido evapora (flash)."],
      ["Evaporador", "O fluido evapora e retira calor do ambiente refrigerado."],
      ["Ventiladores", "Forçam o ar pelas serpentinas e definem a troca de calor."],
    ],
    cadeia: [["Gauge", "Comprimir"], ["Wind", "Condensar"], ["SlidersHorizontal", "Expandir"], ["Thermometer", "Evaporar"], ["Repeat", "Repetir"]],
    exemplo: [["Carga térmica", "24,4 kW"], ["Em TR", "≈ 6,9 TR"], ["Potência elétrica", "8 kW"], ["COP", "≈ 3,0"]],
    atencao: "Pressão sozinha não diz nada: converta na tabela P×T do fluido para saber a temperatura de saturação.",
    chave: "O calor entra no evaporador e sai no condensador; o compressor faz o transporte.",
  },
  {
    id: "sa-sr", mod: 0, titulo: "Superaquecimento e sub-resfriamento", sub: "As duas medidas que dizem como o ciclo está carregado.",
    arte: svg(
      gauge(70, 70, 26, -60) + t(70, 118, "sucção 8,3 bar", { s: 8.5, c: C.blue }) + t(70, 130, "T sat = +5 °C", { s: 8.5, c: C.blue }) +
      gauge(250, 70, 26, 20) + t(250, 118, "alta 26,3 bar", { s: 8.5, c: C.red }) + t(250, 130, "T sat = +45 °C", { s: 8.5, c: C.red }) +
      pipeH(20, 140, 170, 14) + `<rect x="74" y="160" width="18" height="20" rx="3" fill="${C.orange}" stroke="${C.ink}"/>` + t(83, 196, "tubo +12 °C", { s: 8.5, c: C.orange }) +
      pipeH(180, 300, 170, 10) + `<rect x="232" y="160" width="18" height="20" rx="3" fill="${C.orange}" stroke="${C.ink}"/>` + t(241, 196, "líquido +39 °C", { s: 8.5, c: C.orange }) +
      block(40, 208, 100, 24, "SA = 12 − 5 = 7 K", C.navy, "#fff", 9) + block(180, 208, 110, 24, "SR = 45 − 39 = 6 K", C.navy, "#fff", 9) +
      mk(1, 30, 40, 46, 56) + mk(2, 116, 160, 94, 168) + mk(3, 290, 40, 274, 56) + mk(4, 274, 160, 252, 168) + mk(5, 160, 220)
    ),
    partes: [
      ["Pressão de sucção", "Convertida na tabela P×T: temperatura de evaporação."],
      ["Temperatura da sucção", "Medida no tubo, na saída do evaporador."],
      ["Pressão de descarga", "Convertida: temperatura de condensação."],
      ["Temperatura do líquido", "Medida na saída do condensador."],
      ["Resultado", "SA protege o compressor; SR garante líquido na expansão."],
    ],
    cadeia: [["Gauge", "Ler pressão"], ["BookOpen", "Tabela P×T"], ["Thermometer", "Ler tubo"], ["Calculator", "Subtrair"], ["Target", "Diagnosticar"]],
    exemplo: [["SA alto + SR baixo", "falta de fluido"], ["SA alto + SR alto", "restrição"], ["SA baixo + SR alto", "excesso de fluido"], ["SA típico (VET)", "~3 a 7 K"]],
    atencao: "Fluido com glide (R-407C, R-448A): use ponto de orvalho no SA e ponto de bolha no SR.",
    chave: "Capilar: carga pelo SA. VET ou EEV: carga pelo SR.",
  },

  // ───────────── Módulo 2 · Sensores ─────────────
  {
    id: "ntc", mod: 1, titulo: "Sensor NTC e onde instalar", sub: "O sensor mais usado nos controladores de câmara.",
    arte: svg(
      `<rect x="20" y="20" width="200" height="120" rx="6" fill="#e9f2fb" stroke="${C.steelD}"/>` + t(120, 36, "evaporador", { s: 8, c: C.muted }) +
      Array.from({ length: 15 }, (_, i) => `<line x1="${34 + i * 12}" y1="44" x2="${34 + i * 12}" y2="128" stroke="#9bbad8" stroke-width="2"/>`).join("") +
      fan(250, 80, 24) + arrow(290, 80, 316, 80, C.blue, 1.6) +
      `<rect x="84" y="78" width="40" height="9" rx="4" fill="${C.ink}"/>` + `<rect x="228" y="150" width="40" height="9" rx="4" fill="${C.ink}"/>` +
      pipeH(20, 200, 196, 12) + `<rect x="150" y="186" width="34" height="9" rx="4" fill="${C.ink}"/><path d="M146 200 h42" stroke="${C.ink}" stroke-width="3" stroke-dasharray="2 2"/>` +
      `<circle cx="300" cy="196" r="12" fill="none" stroke="${C.ink}"/><circle cx="300" cy="184" r="3" fill="${C.ink}"/>` + t(300, 222, "12 h", { s: 8 }) +
      mk(1, 104, 64, 104, 78) + mk(2, 248, 176, 248, 160) + mk(3, 166, 222, 166, 200) + mk(4, 296, 156, 300, 180) + mk(5, 50, 170)
    ),
    partes: [
      ["Sensor de fim de degelo", "Entre as aletas, no ponto que derrete por último."],
      ["Sensor ambiente", "No retorno de ar do evaporador, longe da porta."],
      ["Sensor de sucção", "Bem preso ao tubo e isolado termicamente."],
      ["Posição no tubo", "Tubo < 7/8″: às 12 h. Maior: às 4 ou 8 h."],
      ["Tipo NTC", "10 kΩ a 25 °C; a resistência cai quando a temperatura sobe."],
    ],
    cadeia: [["Thermometer", "Temperatura"], ["Zap", "Resistência"], ["Cpu", "Controlador"], ["Monitor", "Indicação"]],
    exemplo: [["NTC 10 kΩ a 25 °C", "10 kΩ"], ["A 0 °C", "~27 a 33 kΩ (conforme o B)"], ["Infinito", "sensor aberto"], ["Perto de 0 Ω", "sensor em curto"]],
    atencao: "Meça o sensor desligado do controlador e compare com a tabela R×T do fabricante.",
    chave: "Sensor no lugar errado é a causa mais comum de “controlador com defeito”.",
  },
  {
    id: "transdutor", mod: 1, titulo: "Transdutor de pressão", sub: "Sinal ratiométrico ou 4–20 mA para controladores e drivers.",
    arte: svg(
      pipeH(10, 310, 200, 18) + tx(130, 191, 2.2, "15.0") +
      `<path d="M150 106 C190 90 210 60 250 50" fill="none" stroke="${C.ink}" stroke-width="3"/>` +
      `<rect x="250" y="30" width="56" height="40" rx="4" fill="${C.navy}"/>` + t(278, 54, "driver", { s: 8.5, c: "#fff" }) +
      `<path d="M30 160 H100 M30 160 V100" stroke="${C.ink}" stroke-width="1.2"/><line x1="30" y1="150" x2="96" y2="106" stroke="${C.blue}" stroke-width="2.5"/>` +
      t(26, 154, "0,5", { s: 7, a: "end" }) + t(26, 110, "4,5", { s: 7, a: "end" }) + t(65, 174, "0 → 30 bar", { s: 7.5 }) +
      `<path d="M150 70 h20 M150 78 h20 M150 86 h20" stroke="${C.red}" stroke-width="2"/>` +
      mk(1, 104, 214, 130, 204) + mk(2, 170, 160, 142, 160) + mk(3, 218, 98, 172, 80) + mk(4, 278, 92, 278, 70) + mk(5, 66, 92, 66, 126)
    ),
    partes: [
      ["Conexão", "Rosca (ex.: 7/16″ UNF) na válvula de serviço ou tomada."],
      ["Instalação", "Em cima do tubo: embaixo acumula óleo e a leitura erra."],
      ["Ligação de 3 fios", "+5 V, sinal e 0 V (ratiométrico)."],
      ["Destino do sinal", "Controlador, driver de válvula eletrônica ou CLP."],
      ["Curva", "0,5 V = início da faixa; 4,5 V = fim da faixa."],
    ],
    cadeia: [["Gauge", "Pressão"], ["Zap", "Tensão 0,5–4,5 V"], ["Cpu", "Driver"], ["Calculator", "T saturação"]],
    exemplo: [["Faixa", "0 a 30 bar"], ["Sinal lido", "2,5 V"], ["Fração", "(2,5 − 0,5) / 4 = 0,5"], ["Pressão", "15 bar"]],
    atencao: "Abaixo de 0,5 V ou acima de 4,5 V: suspeite de cabo, alimentação ou transdutor.",
    chave: "Escolha a faixa para o lado (alta ou baixa) e para o fluido do sistema.",
  },

  // ───────────── Módulo 3 · Expansão ─────────────
  {
    id: "vet", mod: 2, titulo: "Válvula de expansão termostática", sub: "O bulbo lê a sucção e a válvula mantém o superaquecimento.",
    arte: svg(
      pipeH(10, 120, 120, 14) + pipeH(200, 300, 120, 14) + `<rect x="120" y="100" width="80" height="44" rx="6" fill="#d8b24a" stroke="${C.ink}"/>` + t(160, 127, "VET", { s: 11 }) +
      `<path d="M128 100 Q160 56 192 100 Z" fill="url(#fvSt)" stroke="${C.ink}"/>` + `<path d="M160 70 C160 30 250 24 270 60 V180" fill="none" stroke="${C.ink}" stroke-width="1.8"/>` +
      pipeH(200, 310, 196, 16) + `<rect x="256" y="180" width="26" height="12" rx="5" fill="#b8c0ca" stroke="${C.ink}"/>` +
      `<path d="M210 144 V170 H238" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="4 2"/>` + `<rect x="152" y="144" width="16" height="16" fill="url(#fvStV)" stroke="${C.steelD}"/>` +
      t(50, 106, "líquido", { s: 8, c: C.red }) + t(250, 106, "para o evaporador", { s: 8, c: C.blue }) + t(170, 220, "sucção (saída do evaporador)", { s: 8, c: C.blue }) +
      mk(1, 160, 36, 160, 70) + mk(2, 300, 160, 282, 184) + mk(3, 100, 160, 124, 136) + mk(4, 190, 176, 168, 156) + mk(5, 238, 150, 214, 156)
    ),
    partes: [
      ["Cabeçote e diafragma", "Recebem a pressão do bulbo contra a mola."],
      ["Bulbo", "Preso à sucção: sente a temperatura de saída do evaporador."],
      ["Orifício", "Define a capacidade; troca conforme o fluido e a carga."],
      ["Haste de ajuste", "Gira para aumentar ou reduzir o superaquecimento."],
      ["Equalização externa", "Usada com distribuidor ou grande perda de carga no evaporador."],
    ],
    cadeia: [["Thermometer", "Bulbo sente"], ["Gauge", "Pressão no diafragma"], ["MoveVertical", "Agulha move"], ["Droplets", "Ajusta o fluxo"]],
    exemplo: [["SA medido", "14 K"], ["Filtro secador", "ΔT de 4 K"], ["Diagnóstico", "filtro obstruído"], ["Ação", "trocar filtro, refazer vácuo"]],
    atencao: "Não mexa no ajuste antes de medir o SA e conferir o filtro: a maioria das “VET ruins” é falta de fluido.",
    chave: "Bulbo mal preso ou sem isolamento faz a válvula alimentar demais.",
  },
  {
    id: "eev", mod: 2, titulo: "Válvula de expansão eletrônica", sub: "Driver, sensores e motor de passo controlam o superaquecimento.",
    arte: svg(
      pipeH(10, 130, 160, 14) + pipeH(190, 310, 160, 14) + `<rect x="130" y="140" width="60" height="40" rx="6" fill="url(#fvSt)" stroke="${C.steelD}"/>` +
      `<rect x="140" y="80" width="40" height="60" rx="6" fill="${C.ink}"/>` + t(160, 114, "M", { s: 13, c: "#fff" }) +
      `<rect x="20" y="20" width="96" height="62" rx="6" fill="${C.navy}"/>` + display(32, 30, 72, "6.2 K", "#3ddc84") +
      `<path d="M116 52 H160 V80" fill="none" stroke="${C.ink}" stroke-width="2"/>` +
      pipeH(190, 310, 216, 14) + tx(240, 207, 0.8, "4.1") + `<rect x="276" y="206" width="22" height="9" rx="4" fill="${C.ink}"/>` +
      `<path d="M240 160 V170 M116 72 H226 V166" fill="none" stroke="${C.blue}" stroke-width="1.4" stroke-dasharray="4 3"/>` + `<path d="M116 64 H300 V206" fill="none" stroke="${C.orange}" stroke-width="1.4" stroke-dasharray="4 3"/>` +
      mk(1, 68, 104, 68, 82) + mk(2, 200, 100, 180, 106) + mk(3, 98, 196, 132, 172) + mk(4, 216, 236, 236, 214) + mk(5, 288, 236, 288, 214)
    ),
    partes: [
      ["Driver", "Calcula o SA e comanda a abertura da válvula."],
      ["Motor de passo", "Move a agulha em centenas de passos com precisão."],
      ["Corpo da válvula", "Orifício modulante na linha de líquido."],
      ["Transdutor de pressão", "Na sucção: dá a temperatura de saturação."],
      ["Sensor de temperatura", "Na sucção: dá a temperatura real do vapor."],
    ],
    cadeia: [["Gauge", "Pressão"], ["Thermometer", "Temperatura"], ["Cpu", "Driver calcula SA"], ["Settings", "Motor de passo"], ["Droplets", "Fluxo"]],
    exemplo: [["T saturação", "−10 °C"], ["T sucção", "−4 °C"], ["SA", "6 K"], ["SP do driver", "6 K → mantém abertura"]],
    atencao: "Sem bateria ou capacitor de reserva, a válvula pode ficar aberta numa queda de energia: use solenoide.",
    chave: "SA menor e estável = evaporador mais cheio e mais eficiência.",
  },

  // ───────────── Módulo 4 · Proteções ─────────────
  {
    id: "pressostatos", mod: 3, titulo: "Pressostatos de alta e de baixa", sub: "Desligam o compressor quando a pressão sai da faixa segura.",
    arte: svg(
      [[80, "LP", C.blue, "auto"], [240, "HP", C.red, "manual"]].map(([x, l, c, r]) =>
        `<rect x="${x - 50}" y="30" width="100" height="120" rx="8" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.5"/>` +
        `<rect x="${x - 38}" y="44" width="76" height="14" rx="3" fill="${c}" opacity=".3"/><path d="M${x + 10} 40 V62" stroke="${C.ink}" stroke-width="2.5"/>` +
        t(x, 100, l, { s: 24, c, w: 900 }) + t(x, 124, `rearme ${r}`, { s: 8.5, c: C.muted }) +
        `<path d="M${x} 150 q-8 10 0 20 t0 20 t0 20" fill="none" stroke="${C.ink}" stroke-width="2"/>`).join("") +
      `<circle cx="266" cy="136" r="7" fill="${C.red}" stroke="${C.ink}"/>` + t(80, 228, "sucção", { s: 8.5, c: C.blue }) + t(240, 228, "descarga", { s: 8.5, c: C.red }) +
      mk(1, 18, 90, 30, 90) + mk(2, 302, 90, 290, 90) + mk(3, 300, 136, 274, 136) + mk(4, 120, 52, 92, 52) + mk(5, 108, 196, 84, 196)
    ),
    partes: [
      ["Pressostato de baixa (LP)", "Desliga com sucção baixa (falta de fluido, gelo); usado no pump-down."],
      ["Pressostato de alta (HP)", "Desliga com descarga alta (condensador sujo, ventilador parado)."],
      ["Rearme manual", "Na alta: alguém precisa verificar a causa antes de religar."],
      ["Escala e diferencial", "Ponto de corte e diferencial evitam partidas curtas."],
      ["Capilar", "Liga o pressostato à tomada de pressão; sem vibração e sem dobras."],
    ],
    cadeia: [["Gauge", "Pressão sai da faixa"], ["ToggleRight", "Contato abre"], ["Zap", "Comando cai"], ["ShieldAlert", "Compressor para"]],
    exemplo: [["Ligação", "em série no comando"], ["HP", "abaixo da pressão máx. do sistema"], ["LP no pump-down", "corta após recolher o fluido"], ["Teste", "simular e registrar"]],
    atencao: "Nunca faça jumper em pressostato de alta para “testar”: o sistema fica sem proteção.",
    chave: "Pressostato desarmando é sintoma: procure a causa.",
  },
  {
    id: "protecoes", mod: 3, titulo: "Proteções elétricas do compressor", sub: "Fase, tensão, corrente e tempo entre partidas.",
    arte: svg(
      `<rect x="20" y="20" width="280" height="150" rx="8" fill="#e5e7eb" stroke="${C.steelD}"/>` +
      `<rect x="36" y="40" width="40" height="60" rx="4" fill="${C.paper}" stroke="${C.ink}"/>` + t(56, 74, "DM", { s: 10 }) +
      `<rect x="92" y="40" width="44" height="60" rx="4" fill="#374151"/>` + t(114, 74, "K1", { s: 10, c: "#fff" }) +
      `<rect x="152" y="40" width="40" height="60" rx="4" fill="${C.blue}"/>` + t(172, 66, "RFS", { s: 9, c: "#fff" }) + `<circle cx="172" cy="84" r="4" fill="#3ddc84"/>` +
      `<rect x="208" y="40" width="40" height="60" rx="4" fill="${C.paper}" stroke="${C.ink}"/>` + t(228, 66, "T", { s: 11 }) + t(228, 84, "3 min", { s: 7.5 }) +
      `<rect x="258" y="40" width="30" height="60" rx="4" fill="${C.orange}"/>` + t(273, 74, "DPS", { s: 7.5, c: "#fff" }) +
      `<path d="M56 100 V140 M114 100 V190" stroke="${C.ink}" stroke-width="2"/>` + compressor(114, 208, 20) +
      t(160, 156, "R  S  T", { s: 9, c: C.muted }) +
      mk(1, 56, 124) + mk(2, 92, 124, 108, 104) + mk(3, 172, 124, 172, 102) + mk(4, 228, 124, 228, 102) + mk(5, 274, 124, 274, 102) + mk(6, 158, 210, 136, 208)
    ),
    partes: [
      ["Disjuntor-motor", "Curto-circuito e sobrecarga, ajustado pela corrente nominal (RLA)."],
      ["Contator", "Liga e desliga o compressor pelo comando."],
      ["Relé de falta e sequência de fase", "Impede o scroll de girar ao contrário e protege contra falta de fase."],
      ["Temporizador anti-reciclagem", "3 a 5 min entre partidas: pressões equalizam."],
      ["DPS", "Protege contra surtos da rede."],
      ["Protetor interno", "Klixon ou módulo com PTC no enrolamento."],
    ],
    cadeia: [["Plug", "Rede"], ["Shield", "Proteções"], ["ToggleRight", "Contator"], ["Gauge", "Compressor"]],
    exemplo: [["Desequilíbrio de tensão", "≤ 2 %"], ["Tensão", "±10 % da nominal"], ["Partidas/hora", "conforme fabricante"], ["Isolação", "medir com megômetro"]],
    atencao: "Scroll girando ao contrário faz barulho, não bombeia e esquenta: use relé de sequência de fase.",
    chave: "Antes de condenar o compressor, meça tensão, corrente e isolação.",
  },

  // ───────────── Módulo 5 · Controle de câmara ─────────────
  {
    id: "controlador", mod: 4, titulo: "Controlador digital de câmara", sub: "Termostato, degelo, ventiladores e alarmes num só aparelho.",
    arte: svg(
      `<rect x="40" y="40" width="240" height="120" rx="12" fill="${C.ink}"/>` + display(60, 56, 130, "2.0 °C") +
      [["COMP", "#3ddc84", 74], ["DEG", "#3a4654", 94], ["VENT", "#3ddc84", 114], ["ALM", "#3a4654", 134]].map(([l, c, y]) => `<circle cx="214" cy="${y - 4}" r="4.5" fill="${c}"/>` + t(224, y, l, { s: 8, c: "#cfd6de", a: "start" })).join("") +
      [80, 120, 160].map((x) => `<circle cx="${x}" cy="138" r="9" fill="#3a4654" stroke="#9aa5b1"/>`).join("") +
      `<path d="M60 160 V200 M120 160 V200 M180 160 V200 M240 160 V200" stroke="${C.ink}" stroke-width="2"/>` +
      t(60, 214, "sensores", { s: 8 }) + t(120, 214, "compressor", { s: 8 }) + t(180, 214, "degelo", { s: 8 }) + t(240, 214, "ventilador", { s: 8 }) +
      mk(1, 30, 70, 58, 74) + mk(2, 300, 90, 270, 90) + mk(3, 120, 116, 120, 130) + mk(4, 60, 232) + mk(5, 120, 232) + mk(6, 300, 150, 270, 140)
    ),
    partes: [
      ["Display", "Mostra a temperatura da câmara e os códigos de alarme."],
      ["Sinalizadores", "Compressor, degelo, ventilador e alarme ligados ou não."],
      ["Teclas", "Acesso a setpoint e parâmetros (com senha)."],
      ["Entradas", "Sensor ambiente, fim de degelo, porta."],
      ["Saídas", "Relés para compressor (ou solenoide), degelo e ventiladores."],
      ["Alarme", "Alta e baixa temperatura com atraso; saída para sirene ou supervisório."],
    ],
    cadeia: [["Thermometer", "Sensor"], ["Cpu", "Controlador"], ["ToggleRight", "Relé"], ["Zap", "Contator"], ["Gauge", "Compressor"]],
    exemplo: [["Setpoint", "2 °C"], ["Diferencial", "2 K (acima do SP)"], ["Liga em", "4 °C"], ["Desliga em", "2 °C"]],
    atencao: "Relé interno tem limite de corrente: acima dele, acione um contator.",
    chave: "Configure o modo de emergência para falha de sensor: o produto não fica sem frio.",
  },
  {
    id: "degelo", mod: 4, titulo: "Degelo elétrico", sub: "Remove o gelo do evaporador sem deixar a câmara esquentar.",
    arte: svg(
      `<rect x="30" y="20" width="260" height="120" rx="6" fill="#dbeafe" stroke="${C.steelD}"/>` +
      Array.from({ length: 21 }, (_, i) => `<line x1="${42 + i * 12}" y1="24" x2="${42 + i * 12}" y2="136" stroke="#9bbad8" stroke-width="2"/>`).join("") +
      coil(36, 284, 60, 8, C.red) + coil(36, 284, 104, 8, C.red) +
      `<path d="M30 150 H290 L274 176 H46 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.5"/>` + `<path d="M40 160 H280" stroke="${C.red}" stroke-width="2.5" stroke-dasharray="6 3"/>` +
      `<path d="M160 176 V226" stroke="${C.ink}" stroke-width="5"/><path d="M160 180 V224" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
      `<rect x="196" y="40" width="26" height="9" rx="4" fill="${C.ink}"/>` + [90, 150, 230].map((x) => `<path d="M${x} 140 q-4 6 0 9 q4 -3 0 -9 z" fill="${C.blue}"/>`).join("") +
      mk(1, 18, 60, 36, 60) + mk(2, 300, 160, 280, 160) + mk(3, 190, 214, 162, 210) + mk(4, 209, 14, 209, 40) + mk(5, 120, 196)
    ),
    partes: [
      ["Resistências do evaporador", "Aquecem as aletas e derretem o gelo."],
      ["Resistência da bandeja", "Evita que a água congele antes de escoar."],
      ["Resistência do dreno", "Obrigatória em câmara negativa."],
      ["Sensor de fim de degelo", "Termina o degelo pela temperatura (~+8 a +12 °C)."],
      ["Gotejamento", "Pausa antes de religar os ventiladores."],
    ],
    cadeia: [["Timer", "Início (tempo/demanda)"], ["Flame", "Resistências"], ["Thermometer", "Fim por temperatura"], ["Droplets", "Gotejamento"], ["Wind", "Ventiladores"]],
    exemplo: [["3 resistências", "800 W cada, 220 V"], ["R de cada", "220² / 800 ≈ 60 Ω"], ["Corrente total", "2 400 / 220 ≈ 11 A"], ["Contator", "AC-1 acima de 11 A"]],
    atencao: "Resistência aberta (infinito no ohmímetro) deixa gelo só em parte do evaporador.",
    chave: "Degelo termina por temperatura; o tempo máximo é só segurança.",
  },

  // ───────────── Módulo 6 · Quadro e motores ─────────────
  {
    id: "quadro", mod: 5, titulo: "Quadro de comando de câmara fria", sub: "Potência, comando, sinalização e intertravamentos.",
    arte: svg(
      `<rect x="70" y="10" width="180" height="220" rx="6" fill="#e5e7eb" stroke="${C.ink}" stroke-width="1.5"/>` +
      `<line x1="80" y1="44" x2="240" y2="44" stroke="#9aa5b1" stroke-width="4"/><line x1="80" y1="104" x2="240" y2="104" stroke="#9aa5b1" stroke-width="4"/>` +
      Array.from({ length: 7 }, (_, i) => `<rect x="${84 + i * 22}" y="28" width="18" height="32" rx="2" fill="${C.paper}" stroke="${C.ink}"/><rect x="${89 + i * 22}" y="36" width="8" height="10" fill="${i ? C.ink : C.red}"/>`).join("") +
      [0, 1, 2, 3].map((i) => `<rect x="${86 + i * 40}" y="84" width="32" height="42" rx="3" fill="#374151"/><rect x="${92 + i * 40}" y="92" width="20" height="8" fill="#9aa5b1"/>`).join("") +
      display(90, 146, 80, "-18.0") + [[200, "#3ddc84"], [218, "#f5a524"], [236, C.red]].map(([x, c]) => `<circle cx="${x}" cy="160" r="6" fill="${c}" stroke="${C.ink}"/>`).join("") +
      `<circle cx="160" cy="206" r="13" fill="${C.red}" stroke="${C.ink}" stroke-width="2"/><rect x="152" y="202" width="16" height="8" fill="#fff"/>` +
      mk(1, 50, 44, 82, 44) + mk(2, 50, 104, 84, 104) + mk(3, 50, 160, 88, 160) + mk(4, 280, 160, 244, 160) + mk(5, 200, 214, 176, 208) + mk(6, 280, 60)
    ),
    partes: [
      ["Disjuntores", "Geral e por circuito; disjuntor-motor no compressor."],
      ["Contatores", "Compressor, ventiladores, degelo e solenoide."],
      ["Controlador", "Cérebro do quadro: temperatura e degelo."],
      ["Sinalização", "Ligado, degelo e falha."],
      ["Emergência", "Botão de parada e alarme de pessoa presa na câmara."],
      ["Documentação", "Diagrama de força e comando, bornes identificados e ART."],
    ],
    cadeia: [["Plug", "Alimentação"], ["Shield", "Proteção"], ["Cpu", "Comando"], ["ToggleRight", "Contatores"], ["Factory", "Câmara"]],
    exemplo: [["Compressor 7,5 kW, 220 V", "I ≈ 26 A"], ["Cabo inicial", "6 mm² (B1)"], ["Queda de tensão", "≤ 4 % no terminal"], ["IDR", "30 mA em tomadas/iluminação"]],
    atencao: "Dimensione cabos e proteções pela NBR 5410 e pela RLA do compressor, não só pela potência.",
    chave: "Pressostatos e relé de fase ficam em série no comando do compressor.",
  },
  {
    id: "compressor-mono", mod: 5, titulo: "Compressor monofásico: C, S e R", sub: "Identificar terminais e testar capacitores e relé.",
    arte: svg(
      `<circle cx="100" cy="120" r="70" fill="url(#fvSt)" stroke="${C.steelD}" stroke-width="2"/>` +
      [[100, 82, "C"], [70, 140, "S"], [130, 140, "R"]].map(([x, y, l]) => `<circle cx="${x}" cy="${y}" r="13" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/>` + t(x, y + 4, l, { s: 12 })).join("") +
      `<path d="M100 95 L73 128 M100 95 L127 128 M83 140 H117" stroke="${C.orange}" stroke-width="2" stroke-dasharray="4 2"/>` +
      t(74, 110, "4,5 Ω", { s: 8, c: C.orange, a: "end" }) + t(126, 110, "1,5 Ω", { s: 8, c: C.orange, a: "start" }) + t(100, 160, "6,0 Ω", { s: 8, c: C.orange }) +
      `<rect x="210" y="40" width="44" height="70" rx="20" fill="${C.blue}" stroke="${C.ink}"/>` + t(232, 80, "CR", { s: 10, c: "#fff" }) +
      `<rect x="264" y="40" width="40" height="70" rx="6" fill="${C.ink}"/>` + t(284, 80, "CP", { s: 10, c: "#fff" }) +
      `<rect x="214" y="140" width="80" height="40" rx="6" fill="${C.paper}" stroke="${C.ink}"/>` + t(254, 164, "relé / PTC", { s: 9 }) +
      mk(1, 100, 36, 100, 68) + mk(2, 40, 176, 62, 150) + mk(3, 160, 176, 138, 150) + mk(4, 232, 24, 232, 40) + mk(5, 284, 24, 284, 40) + mk(6, 254, 204, 254, 180)
    ),
    partes: [
      ["Comum (C)", "Ligação comum dos dois enrolamentos."],
      ["Partida (S)", "Enrolamento auxiliar, de maior resistência."],
      ["Marcha (R)", "Enrolamento principal, de menor resistência."],
      ["Capacitor de marcha", "Permanente: melhora torque e fator de potência."],
      ["Capacitor de partida", "Atua só na partida, desligado pelo relé."],
      ["Relé de partida", "Potencial ou PTC: tira o auxiliar após a partida."],
    ],
    cadeia: [["Zap", "Medir 3 pares"], ["Calculator", "Maior = S-R"], ["Target", "Sobra = C"], ["ClipboardCheck", "Conferir soma"]],
    exemplo: [["C-S + C-R", "4,5 + 1,5 = 6,0 Ω"], ["S-R medido", "6,0 Ω ✓"], ["Terra", "infinito (megômetro)"], ["Capacitor", "±5 % do µF nominal"]],
    atencao: "Descarregue o capacitor antes de medir. Capacitor estufado: troque.",
    chave: "R(C-S) + R(C-R) = R(S-R). Se não fecha, há enrolamento aberto ou em curto.",
  },

  // ───────────── Módulo 7 · Inversor e HVAC ─────────────
  {
    id: "inversor", mod: 6, titulo: "Inversor de frequência", sub: "Velocidade variável em compressores, bombas e ventiladores.",
    arte: svg(
      wave(10, 74, 50, 14, 22, C.blue, 2.4) + t(42, 84, "rede 60 Hz", { s: 8, c: C.blue }) +
      `<rect x="86" y="18" width="110" height="74" rx="8" fill="${C.ink}"/>` + display(100, 28, 82, "45 Hz", "#3ddc84") +
      t(116, 84, "AC→CC", { s: 7, c: "#cfd6de" }) + t(166, 84, "CC→PWM", { s: 7, c: "#cfd6de" }) +
      `<path d="M206 52 h5 v-16 h7 v16 h4 v-16 h10 v16 h4 v-16 h7 v16 h4 v-16 h5 v16 h6" fill="none" stroke="${C.red}" stroke-width="2.4"/>` + t(240, 84, "PWM", { s: 8, c: C.red }) +
      `<path d="M141 92 V130" stroke="${C.ink}" stroke-width="3"/><circle cx="141" cy="168" r="38" fill="url(#fvSt)" stroke="${C.steelD}" stroke-width="2"/>` + t(141, 166, "M", { s: 18 }) + t(141, 184, "3~", { s: 10 }) +
      fan(250, 168, 30) +
      mk(1, 42, 22) + mk(2, 116, 108, 116, 92) + mk(3, 232, 22) + mk(4, 90, 168, 104, 168) + mk(5, 300, 140, 276, 150)
    ),
    partes: [
      ["Entrada da rede", "Tensão e frequência fixas (60 Hz)."],
      ["Retificador e barramento CC", "Converte em corrente contínua filtrada."],
      ["Saída PWM", "Pulsos que formam tensão e frequência variáveis."],
      ["Motor", "Rotação proporcional à frequência: n = 120·f / p."],
      ["Carga", "Ventilador ou bomba: potência ∝ rotação³."],
    ],
    cadeia: [["Plug", "Rede"], ["Zap", "Barramento CC"], ["Activity", "PWM"], ["Gauge", "Motor"], ["Fan", "Carga"]],
    exemplo: [["Motor 4 polos a 45 Hz", "1 350 rpm (síncrona)"], ["Ventilador a 75 %", "0,75³ ≈ 42 % da potência"], ["Economia", "≈ 58 %"], ["Rampa", "conforme a carga"]],
    atencao: "Use cabo blindado entre inversor e motor e aterramento curto: o PWM gera interferência.",
    chave: "Em bombas e ventiladores, pouca redução de rotação dá muita economia.",
  },
  {
    id: "chiller", mod: 6, titulo: "Chiller e água gelada", sub: "Produz água fria que circula até os fan coils.",
    arte: svg(
      `<rect x="16" y="80" width="120" height="90" rx="6" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.5"/>` + fan(46, 80, 16) + fan(106, 80, 16) + t(76, 132, "CHILLER", { s: 11 }) +
      `<path d="M136 110 H280 V60" fill="none" stroke="${C.blue}" stroke-width="6"/><path d="M136 150 H300 V60" fill="none" stroke="${C.red}" stroke-width="6"/>` +
      `<circle cx="196" cy="150" r="13" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/><path d="M190 144 l12 6 l-12 6 z" fill="${C.ink}"/>` +
      `<rect x="250" y="20" width="64" height="40" rx="5" fill="${C.paper}" stroke="${C.ink}"/>` + t(282, 44, "fan coil", { s: 8.5 }) +
      `<rect x="232" y="104" width="12" height="12" fill="${C.yellow}" stroke="${C.ink}"/>` +
      t(210, 102, "7 °C", { s: 10, c: C.blue }) + t(240, 172, "12 °C", { s: 10, c: C.red }) +
      mk(1, 76, 196, 76, 170) + mk(2, 160, 92, 160, 110) + mk(3, 160, 176, 160, 152) + mk(4, 196, 196, 196, 164) + mk(5, 238, 82, 238, 104) + mk(6, 282, 6, 282, 20)
    ),
    partes: [
      ["Chiller", "Ciclo frigorífico que resfria água no evaporador."],
      ["Água gelada (ida)", "Típico 7 °C para os fan coils."],
      ["Retorno", "Típico 12 °C: ΔT de 5 K."],
      ["Bomba", "Circula a água; pode ter inversor."],
      ["Chave de fluxo", "Impede o chiller de operar sem vazão (congelamento)."],
      ["Fan coil", "Válvula + ventilador climatizam o ambiente."],
    ],
    cadeia: [["Gauge", "Chiller"], ["Droplets", "Água 7 °C"], ["Fan", "Fan coil"], ["Thermometer", "Retorno 12 °C"], ["Repeat", "Bomba"]],
    exemplo: [["Vazão", "36 m³/h"], ["ΔT", "5 K"], ["Capacidade", "≈ 59,6 TR"], ["Em kW", "≈ 209 kW"]],
    atencao: "ΔT muito baixo (ex.: 2 K) indica vazão excessiva: energia desperdiçada no bombeamento.",
    chave: "TR ≈ vazão (m³/h) × ΔT / 3,02.",
  },

  // ───────────── Módulo 8 · Diagnóstico e serviço ─────────────
  {
    id: "manifold-diag", mod: 7, titulo: "Manifold e diagnóstico", sub: "Do sintoma à causa com pressão, temperatura e corrente.",
    arte: svg(
      `<rect x="70" y="110" width="180" height="34" rx="10" fill="#b8c0ca" stroke="${C.ink}"/>` + gauge(110, 70, 30, -70) + gauge(210, 70, 30, 10) +
      t(110, 120, "LO", { s: 8, c: C.blue }) + t(210, 120, "HI", { s: 8, c: C.red }) +
      `<g fill="none" stroke-width="6" stroke-linecap="round"><path d="M100 144 Q90 200 30 210" stroke="${C.blue}"/><path d="M160 144 V224" stroke="#e0b100"/><path d="M220 144 Q230 200 290 210" stroke="${C.red}"/></g>` +
      `<circle cx="80" cy="127" r="7" fill="${C.blue}" stroke="${C.ink}"/><circle cx="240" cy="127" r="7" fill="${C.red}" stroke="${C.ink}"/>` +
      mk(1, 60, 40, 84, 56) + mk(2, 262, 40, 236, 56) + mk(3, 30, 186, 50, 204) + mk(4, 180, 214, 162, 210) + mk(5, 290, 186, 270, 204) + mk(6, 160, 96, 160, 112)
    ),
    partes: [
      ["Manômetro de baixa", "Pressão de sucção (azul)."],
      ["Manômetro de alta", "Pressão de descarga (vermelho)."],
      ["Mangueira azul", "Na válvula de serviço da sucção."],
      ["Mangueira central", "Vácuo, recolhimento ou carga."],
      ["Mangueira vermelha", "Na linha de alta ou de líquido."],
      ["Registros", "Abrem e fecham cada lado do manifold."],
    ],
    cadeia: [["Eye", "Sintoma"], ["Gauge", "Pressões"], ["Thermometer", "SA e SR"], ["Zap", "Corrente"], ["Target", "Causa"]],
    exemplo: [["Câmara a −10 °C (SP −20)", "sucção baixa"], ["SA / SR", "18 K / 1 K"], ["Corrente", "abaixo da nominal"], ["Diagnóstico", "falta de fluido"]],
    atencao: "Descarga alta com condensador sujo: limpe e confira o ventilador. Não retire fluido.",
    chave: "Pressão, SA, SR e corrente juntos apontam a causa; um número sozinho engana.",
  },
  {
    id: "vacuo-carga", mod: 7, titulo: "Vácuo e carga de fluido", sub: "Sistema seco, estanque e com a carga certa.",
    arte: svg(
      `<rect x="20" y="150" width="90" height="60" rx="8" fill="${C.orange}" stroke="${C.ink}"/>` + t(65, 186, "bomba", { s: 10, c: "#fff" }) +
      `<rect x="130" y="30" width="70" height="60" rx="8" fill="#f5a524" stroke="${C.ink}"/>` + display(138, 40, 54, "350 µ", "#3ddc84") + t(165, 84, "vacuômetro", { s: 7.5 }) +
      `<path d="M110 176 H165 V90" fill="none" stroke="#e0b100" stroke-width="5"/><path d="M165 176 H250" stroke="#e0b100" stroke-width="5"/>` +
      `<rect x="232" y="100" width="56" height="96" rx="20" fill="#5aa0e0" stroke="${C.ink}"/>` + t(260, 152, "R-32", { s: 10, c: "#fff" }) +
      `<rect x="220" y="198" width="80" height="16" rx="3" fill="${C.ink}"/>` + display(236, 200, 48, "1,25 kg", "#3ddc84") +
      `<rect x="30" y="40" width="70" height="40" rx="6" fill="#cfe3f5" stroke="${C.ink}"/>` + t(65, 64, "N₂", { s: 13, c: C.navy }) +
      mk(1, 65, 226, 65, 210) + mk(2, 216, 40, 200, 50) + mk(3, 104, 40, 100, 52) + mk(4, 300, 120, 288, 130) + mk(5, 196, 226, 222, 210)
    ),
    partes: [
      ["Bomba de vácuo", "Retira ar e umidade do sistema."],
      ["Vacuômetro", "Mede em mícrons: único modo de comprovar a desidratação."],
      ["Nitrogênio", "Na brasagem (evita oxidação) e no teste de estanqueidade."],
      ["Cilindro de fluido", "Mistura zeotrópica: carga sempre como líquido."],
      ["Balança", "Carga pelo peso indicado na etiqueta da unidade."],
    ],
    cadeia: [["Wind", "Teste com N₂"], ["Gauge", "Vácuo"], ["Timer", "Teste de subida"], ["Scale", "Carga por peso"], ["Thermometer", "Conferir SA/SR"]],
    exemplo: [["Vácuo final", "≤ 500 mícrons"], ["Subida em 10 min", "estável (sem vazamento/umidade)"], ["Carga de fábrica", "conforme etiqueta"], ["Linha extra", "g/m do fabricante"]],
    atencao: "R-32 e R-290 são inflamáveis: ventilação, ferramentas adequadas e sem fontes de ignição.",
    chave: "Sem vácuo bem feito, a umidade forma ácido e queima o compressor.",
  },
];

export const FICHAS = F.map((f, i) => ({ ...f, num: i + 1 }));
