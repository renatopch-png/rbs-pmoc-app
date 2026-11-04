// Catálogo de serviços e materiais de refrigeração/climatização com valores
// MÉDIOS DE REFERÊNCIA (mercado do Rio de Janeiro, 2026). São pontos de partida:
// revise conforme sua região, distância, acesso (altura/andaime) e complexidade
// da alvenaria. Para usar seus próprios valores, importe o catálogo na
// Tabela de Preços e ajuste lá.
const MO = "Mão de Obra";
const MAT = "Material";

export const CATALOGO = [
  // ---------------- Instalação ----------------
  { cat: "Instalação", nome: "Instalação de split hi-wall até 12.000 BTU/h (até 3 m de tubulação)", tipo: MO, unidade: "un", preco: 600 },
  { cat: "Instalação", nome: "Instalação de split hi-wall 18.000 a 24.000 BTU/h (até 3 m de tubulação)", tipo: MO, unidade: "un", preco: 800 },
  { cat: "Instalação", nome: "Instalação de split hi-wall 30.000 a 36.000 BTU/h (até 3 m de tubulação)", tipo: MO, unidade: "un", preco: 1100 },
  { cat: "Instalação", nome: "Instalação de piso-teto até 36.000 BTU/h", tipo: MO, unidade: "un", preco: 1300 },
  { cat: "Instalação", nome: "Instalação de piso-teto 48.000 a 60.000 BTU/h", tipo: MO, unidade: "un", preco: 1700 },
  { cat: "Instalação", nome: "Instalação de cassete até 36.000 BTU/h", tipo: MO, unidade: "un", preco: 1500 },
  { cat: "Instalação", nome: "Instalação de cassete 48.000 a 60.000 BTU/h", tipo: MO, unidade: "un", preco: 1900 },
  { cat: "Instalação", nome: "Metro adicional de tubulação frigorígena (mão de obra)", tipo: MO, unidade: "m", preco: 90 },
  { cat: "Instalação", nome: "Infraestrutura embutida — rasgo em alvenaria e fechamento", tipo: MO, unidade: "m", preco: 120 },
  { cat: "Instalação", nome: "Instalação de bomba de condensado", tipo: MO, unidade: "un", preco: 250 },
  { cat: "Instalação", nome: "Desinstalação de split até 24.000 BTU/h (com recolhimento de gás)", tipo: MO, unidade: "un", preco: 250 },
  { cat: "Instalação", nome: "Desinstalação de split acima de 24.000 BTU/h (com recolhimento de gás)", tipo: MO, unidade: "un", preco: 350 },

  // ---------------- Manutenção preventiva / PMOC ----------------
  { cat: "Preventiva / PMOC", nome: "Limpeza e higienização de split até 12.000 BTU/h", tipo: MO, unidade: "un", preco: 200 },
  { cat: "Preventiva / PMOC", nome: "Limpeza e higienização de split 18.000 a 24.000 BTU/h", tipo: MO, unidade: "un", preco: 250 },
  { cat: "Preventiva / PMOC", nome: "Limpeza e higienização de split 30.000 a 36.000 BTU/h", tipo: MO, unidade: "un", preco: 300 },
  { cat: "Preventiva / PMOC", nome: "Higienização de piso-teto ou cassete", tipo: MO, unidade: "un", preco: 350 },
  { cat: "Preventiva / PMOC", nome: "Limpeza completa com desmontagem da evaporadora (bolsa coletora)", tipo: MO, unidade: "un", preco: 350 },
  { cat: "Preventiva / PMOC", nome: "Lavagem de serpentina da condensadora", tipo: MO, unidade: "un", preco: 120 },
  { cat: "Preventiva / PMOC", nome: "Manutenção preventiva PMOC por equipamento (visita mensal)", tipo: MO, unidade: "un/mês", preco: 90 },
  { cat: "Preventiva / PMOC", nome: "Elaboração do PMOC com ART do responsável técnico", tipo: MO, unidade: "un", preco: 900 },
  { cat: "Preventiva / PMOC", nome: "Visita técnica / diagnóstico", tipo: MO, unidade: "un", preco: 150 },

  // ---------------- Corretiva ----------------
  { cat: "Corretiva", nome: "Carga de gás completa com vácuo — até 12.000 BTU/h", tipo: MO, unidade: "un", preco: 450 },
  { cat: "Corretiva", nome: "Carga de gás completa com vácuo — 18.000 a 24.000 BTU/h", tipo: MO, unidade: "un", preco: 600 },
  { cat: "Corretiva", nome: "Localização e reparo de vazamento (solda)", tipo: MO, unidade: "un", preco: 350 },
  { cat: "Corretiva", nome: "Pressurização com nitrogênio e vácuo", tipo: MO, unidade: "un", preco: 250 },
  { cat: "Corretiva", nome: "Recolhimento de gás refrigerante", tipo: MO, unidade: "un", preco: 150 },
  { cat: "Corretiva", nome: "Troca de capacitor (mão de obra)", tipo: MO, unidade: "un", preco: 150 },
  { cat: "Corretiva", nome: "Troca de motor ventilador (mão de obra)", tipo: MO, unidade: "un", preco: 300 },
  { cat: "Corretiva", nome: "Troca de placa eletrônica (mão de obra)", tipo: MO, unidade: "un", preco: 250 },
  { cat: "Corretiva", nome: "Troca de compressor até 24.000 BTU/h (mão de obra)", tipo: MO, unidade: "un", preco: 900 },
  { cat: "Corretiva", nome: "Troca de válvula de serviço / reversora (mão de obra)", tipo: MO, unidade: "un", preco: 400 },

  // ---------------- Refrigeração comercial ----------------
  { cat: "Refrigeração comercial", nome: "Manutenção preventiva de câmara fria", tipo: MO, unidade: "un", preco: 450 },
  { cat: "Refrigeração comercial", nome: "Carga de gás em câmara fria (com vácuo)", tipo: MO, unidade: "un", preco: 900 },
  { cat: "Refrigeração comercial", nome: "Troca de compressor hermético até 5 HP (mão de obra)", tipo: MO, unidade: "un", preco: 1500 },
  { cat: "Refrigeração comercial", nome: "Instalação de controlador digital de temperatura", tipo: MO, unidade: "un", preco: 250 },
  { cat: "Refrigeração comercial", nome: "Ajuste de degelo e parâmetros do controlador", tipo: MO, unidade: "un", preco: 200 },
  { cat: "Refrigeração comercial", nome: "Manutenção de balcão / expositor refrigerado", tipo: MO, unidade: "un", preco: 300 },

  // ---------------- Elétrica ----------------
  { cat: "Elétrica", nome: "Circuito dedicado para ar-condicionado (até 10 m, NBR 5410)", tipo: MO, unidade: "un", preco: 350 },
  { cat: "Elétrica", nome: "Instalação de disjuntor e DPS no quadro", tipo: MO, unidade: "un", preco: 120 },
  { cat: "Elétrica", nome: "Aterramento — haste e conexão ao equipamento", tipo: MO, unidade: "un", preco: 280 },
  { cat: "Elétrica", nome: "Revisão do quadro de comando", tipo: MO, unidade: "un", preco: 200 },

  // ---------------- Materiais ----------------
  { cat: "Materiais", nome: "Tubo de cobre 1/4\"", tipo: MAT, unidade: "m", preco: 28 },
  { cat: "Materiais", nome: "Tubo de cobre 3/8\"", tipo: MAT, unidade: "m", preco: 38 },
  { cat: "Materiais", nome: "Tubo de cobre 1/2\"", tipo: MAT, unidade: "m", preco: 52 },
  { cat: "Materiais", nome: "Tubo de cobre 5/8\"", tipo: MAT, unidade: "m", preco: 68 },
  { cat: "Materiais", nome: "Tubo de cobre 3/4\"", tipo: MAT, unidade: "m", preco: 85 },
  { cat: "Materiais", nome: "Isolamento térmico esponjoso", tipo: MAT, unidade: "m", preco: 8 },
  { cat: "Materiais", nome: "Fita PVC para acabamento", tipo: MAT, unidade: "rolo", preco: 15 },
  { cat: "Materiais", nome: "Cabo PP 4 × 1,5 mm²", tipo: MAT, unidade: "m", preco: 9 },
  { cat: "Materiais", nome: "Cabo PP 4 × 2,5 mm²", tipo: MAT, unidade: "m", preco: 14 },
  { cat: "Materiais", nome: "Cabo flexível 4 mm²", tipo: MAT, unidade: "m", preco: 6 },
  { cat: "Materiais", nome: "Mangueira de dreno cristal", tipo: MAT, unidade: "m", preco: 6 },
  { cat: "Materiais", nome: "Canaleta para acabamento", tipo: MAT, unidade: "m", preco: 25 },
  { cat: "Materiais", nome: "Suporte para condensadora até 24.000 BTU/h", tipo: MAT, unidade: "par", preco: 120 },
  { cat: "Materiais", nome: "Suporte para condensadora acima de 24.000 BTU/h", tipo: MAT, unidade: "par", preco: 200 },
  { cat: "Materiais", nome: "Bomba de condensado", tipo: MAT, unidade: "un", preco: 380 },
  { cat: "Materiais", nome: "Gás refrigerante R-410A", tipo: MAT, unidade: "kg", preco: 120 },
  { cat: "Materiais", nome: "Gás refrigerante R-32", tipo: MAT, unidade: "kg", preco: 110 },
  { cat: "Materiais", nome: "Gás refrigerante R-22", tipo: MAT, unidade: "kg", preco: 180 },
  { cat: "Materiais", nome: "Gás refrigerante R-404A", tipo: MAT, unidade: "kg", preco: 160 },
  { cat: "Materiais", nome: "Gás refrigerante R-134a", tipo: MAT, unidade: "kg", preco: 110 },
  { cat: "Materiais", nome: "Capacitor de partida/permanente", tipo: MAT, unidade: "un", preco: 65 },
  { cat: "Materiais", nome: "Disjuntor bipolar", tipo: MAT, unidade: "un", preco: 55 },
  { cat: "Materiais", nome: "DPS (dispositivo de proteção contra surtos)", tipo: MAT, unidade: "un", preco: 90 },
  { cat: "Materiais", nome: "Haste de aterramento 2,4 m com conector", tipo: MAT, unidade: "un", preco: 70 },
  { cat: "Materiais", nome: "Nitrogênio para pressurização", tipo: MAT, unidade: "serviço", preco: 60 },
  { cat: "Materiais", nome: "Vareta de solda foscoper", tipo: MAT, unidade: "un", preco: 15 },
  { cat: "Materiais", nome: "Filtro secador", tipo: MAT, unidade: "un", preco: 45 },
  { cat: "Materiais", nome: "Produto de higienização (bactericida/limpa-serpentina)", tipo: MAT, unidade: "serviço", preco: 35 },
];

export const CATEGORIAS_CATALOGO = [...new Set(CATALOGO.map((i) => i.cat))];
