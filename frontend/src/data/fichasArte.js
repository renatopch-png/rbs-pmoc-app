// Primitivas de desenho (SVG) usadas nas ilustrações das fichas visuais.
// Todas as ilustrações usam viewBox 0 0 320 240.

export const C = {
  navy: "#12304F", blue: "#2b5c9e", steelD: "#5f6b78", steel: "#9aa5b1", steelL: "#e3e8ec",
  orange: "#d9480f", red: "#c0392b", green: "#0e8f6e", water: "#8fc1ee", waterD: "#3f84cc",
  yellow: "#ffd23f", ink: "#1b2430", muted: "#5b6573", paper: "#ffffff", violet: "#7b4fc9",
};

const DEFS = `<defs>
<linearGradient id="fvSt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f9"/><stop offset=".45" stop-color="#bcc6cf"/><stop offset="1" stop-color="#6c7884"/></linearGradient>
<linearGradient id="fvStV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a8693"/><stop offset=".45" stop-color="#f4f7f9"/><stop offset="1" stop-color="#7a8693"/></linearGradient>
<linearGradient id="fvBl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6c9ddc"/><stop offset="1" stop-color="#1d4c8c"/></linearGradient>
<linearGradient id="fvLq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d2f5"/><stop offset="1" stop-color="#3f84cc"/></linearGradient>
<radialGradient id="fvFace"><stop offset=".7" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe5ea"/></radialGradient>
</defs>`;

export const svg = (corpo) =>
  `<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" font-family="Arial,Helvetica,sans-serif">${DEFS}${corpo}</svg>`;

export const t = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.s || 9}" font-weight="${o.w || 700}" fill="${o.c || C.ink}" text-anchor="${o.a || "middle"}">${s}</text>`;

export const pipeH = (x1, x2, y, d = 16) => `<rect x="${x1}" y="${y - d / 2}" width="${x2 - x1}" height="${d}" fill="url(#fvSt)" stroke="${C.steelD}" stroke-width="1"/>`;
export const pipeV = (x, y1, y2, d = 16) => `<rect x="${x - d / 2}" y="${y1}" width="${d}" height="${y2 - y1}" fill="url(#fvStV)" stroke="${C.steelD}" stroke-width="1"/>`;
export const flange = (x, y, h = 26) => `<rect x="${x - 3}" y="${y - h / 2}" width="6" height="${h}" rx="1" fill="url(#fvStV)" stroke="${C.steelD}"/>`;
export const flangeH = (x, y, w = 26) => `<rect x="${x - w / 2}" y="${y - 3}" width="${w}" height="6" rx="1" fill="url(#fvSt)" stroke="${C.steelD}"/>`;

// Transmissor: (x, y) é o ponto de conexão ao processo; o corpo sobe a partir dele.
export const tx = (x, y, s = 1, tela = "5.25") => `<g transform="translate(${x} ${y}) scale(${s})">
<rect x="-6" y="-9" width="12" height="9" fill="url(#fvStV)" stroke="${C.steelD}"/>
<rect x="-4" y="-26" width="8" height="17" fill="url(#fvStV)" stroke="${C.steelD}"/>
<rect x="-19" y="-48" width="8" height="16" rx="2" fill="url(#fvBl)" stroke="${C.navy}"/>
<rect x="11" y="-48" width="8" height="16" rx="2" fill="url(#fvBl)" stroke="${C.navy}"/>
<circle cx="0" cy="-40" r="15" fill="url(#fvBl)" stroke="${C.navy}" stroke-width="1.2"/>
<circle cx="0" cy="-40" r="10" fill="#e8f1fb" stroke="${C.navy}"/>
<text x="0" y="-37" font-size="6.5" font-weight="700" text-anchor="middle" fill="${C.navy}">${tela}</text></g>`;

export const gauge = (x, y, r = 16, ang = -40) => {
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const a = ((-225 + i * 33.75) * Math.PI) / 180;
    return `<line x1="${x + (r - 3) * Math.cos(a)}" y1="${y + (r - 3) * Math.sin(a)}" x2="${x + (r - 6) * Math.cos(a)}" y2="${y + (r - 6) * Math.sin(a)}" stroke="${C.ink}" stroke-width="1"/>`;
  }).join("");
  const a = (ang * Math.PI) / 180;
  return `<rect x="${x - 4}" y="${y + r - 2}" width="8" height="12" fill="url(#fvStV)" stroke="${C.steelD}"/>
<circle cx="${x}" cy="${y}" r="${r + 3}" fill="url(#fvSt)" stroke="${C.steelD}"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#fvFace)" stroke="${C.steelD}" stroke-width=".8"/>
<path d="M${x + (r - 4) * Math.cos(Math.PI * 0.25)} ${y + (r - 4) * Math.sin(Math.PI * 0.25)} A${r - 4} ${r - 4} 0 0 0 ${x + (r - 4) * Math.cos(-Math.PI * 0.1)} ${y + (r - 4) * Math.sin(-Math.PI * 0.1)}" fill="none" stroke="${C.red}" stroke-width="2"/>
${ticks}<line x1="${x}" y1="${y}" x2="${x + (r - 4) * Math.cos(a)}" y2="${y + (r - 4) * Math.sin(a)}" stroke="${C.orange}" stroke-width="1.8" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="2" fill="${C.ink}"/>`;
};

export const tank = (x, y, w, h, nivel = 0.5, liq = "url(#fvLq)") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#fvStV)" stroke="${C.steelD}" stroke-width="1.2"/>
<rect x="${x + 4}" y="${y + h - (h - 8) * nivel - 4}" width="${w - 8}" height="${(h - 8) * nivel}" rx="6" fill="${liq}" opacity=".9"/>
<line x1="${x + 4}" y1="${y + h - (h - 8) * nivel - 4}" x2="${x + w - 4}" y2="${y + h - (h - 8) * nivel - 4}" stroke="${C.waterD}" stroke-width="1.2"/>`;

// Válvula globo com atuador; (x, y) é o centro do corpo.
export const valve = (x, y, s = 1, cor = "url(#fvBl)") => `<g transform="translate(${x} ${y}) scale(${s})">
<path d="M-22 -12 L0 0 L-22 12 Z M22 -12 L0 0 L22 12 Z" fill="url(#fvSt)" stroke="${C.steelD}" stroke-linejoin="round"/>
<rect x="-7" y="-20" width="14" height="10" fill="url(#fvStV)" stroke="${C.steelD}"/>
<path d="M-12 -20 L-8 -46 M12 -20 L8 -46" stroke="${C.steelD}" stroke-width="2.5"/>
<line x1="0" y1="-20" x2="0" y2="-48" stroke="${C.ink}" stroke-width="2"/>
<path d="M-24 -48 Q0 -80 24 -48 Z" fill="${cor}" stroke="${C.navy}" stroke-width="1.2"/><line x1="-26" y1="-48" x2="26" y2="-48" stroke="${C.navy}" stroke-width="2.5"/></g>`;

export const block = (x, y, w, h, label, fill = C.paper, tc = C.ink, s = 8.5) => {
  const linhas = String(label).split("|");
  const y0 = y + h / 2 - ((linhas.length - 1) * (s + 1.5)) / 2 + s / 3;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${C.navy}" stroke-width="1.1"/>` +
    linhas.map((l, i) => t(x + w / 2, y0 + i * (s + 1.5), l, { s, c: tc })).join("");
};

export const arrow = (x1, y1, x2, y2, c = C.navy, w = 1.6) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 6;
  const p1 = [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)], p2 = [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)];
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/><path d="M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z" fill="${c}"/>`;
};

export const wave = (x1, x2, y, a = 5, p = 14, c = C.orange, w = 1.6) => {
  let d = `M${x1} ${y}`;
  for (let x = x1; x < x2; x += p) d += ` q${p / 4} ${-a} ${p / 2} 0 t${p / 2} 0`;
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
};

// Marcador numerado (interativo): círculo com o número e linha-guia opcional até (lx, ly).
export const mk = (n, x, y, lx, ly) => `<g data-n="${n}" class="fv-mk">${lx !== undefined ? `<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" stroke="${C.navy}" stroke-width="1" stroke-dasharray="2.5 2"/><circle cx="${lx}" cy="${ly}" r="2" fill="${C.navy}"/>` : ""}<circle cx="${x}" cy="${y}" r="8.5" fill="${C.navy}" stroke="#fff" stroke-width="1.5"/>${t(x, y + 3.2, String(n).padStart(2, "0"), { s: 8, c: "#fff" })}</g>`;
