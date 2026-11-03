const UNI = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZ = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CEM = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n) {
  if (n === 100) return "cem";
  const partes = [];
  if (n >= 100) partes.push(CEM[Math.floor(n / 100)]);
  const r = n % 100;
  if (r >= 20) {
    partes.push(DEZ[Math.floor(r / 10)]);
    if (r % 10) partes.push(UNI[r % 10]);
  } else if (r > 0) {
    partes.push(UNI[r]);
  }
  return partes.join(" e ");
}

function inteiro(n) {
  const milhoes = Math.floor(n / 1e6);
  const milhares = Math.floor((n % 1e6) / 1000);
  const resto = n % 1000;
  const partes = [];
  if (milhoes) partes.push(`${ate999(milhoes)} ${milhoes === 1 ? "milhão" : "milhões"}`);
  if (milhares) partes.push(milhares === 1 ? "mil" : `${ate999(milhares)} mil`);
  if (resto) partes.push(ate999(resto));
  if (partes.length < 2) return partes[0] || "";
  const usaE = resto > 0 && (resto <= 100 || resto % 100 === 0);
  const ultimo = partes.pop();
  return `${partes.join(", ")}${usaE ? " e " : ", "}${ultimo}`;
}

export function valorPorExtenso(valor) {
  const total = Math.round((Number(valor) || 0) * 100);
  const reais = Math.floor(total / 100);
  const centavos = total % 100;
  const partes = [];
  if (reais) {
    const deReais = reais % 1e6 === 0 ? " de" : "";
    partes.push(`${inteiro(reais)}${deReais} ${reais === 1 ? "real" : "reais"}`);
  }
  if (centavos) partes.push(`${ate999(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`);
  return partes.join(" e ") || "zero real";
}
