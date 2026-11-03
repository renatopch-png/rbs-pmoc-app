import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

// Pix estático (padrão BR Code do Banco Central): gera o "copia e cola" e o
// conteúdo do QR Code com valor. Não há integração com banco; o cliente paga
// pelo app do banco dele e você confere o recebimento no extrato.

export const PIX_VAZIO = { chave: "", tipoChave: "CNPJ", favorecido: "", cidade: "RIO DE JANEIRO", banco: "", instrucoes: "" };
export const TIPOS_CHAVE = ["CNPJ", "CPF", "E-mail", "Telefone", "Aleatória"];

const REF = () => doc(db, "configuracoes", "pix");

export async function lerConfigPix() {
  try {
    const s = await getDoc(REF());
    return s.exists() ? { ...PIX_VAZIO, ...s.data() } : { ...PIX_VAZIO };
  } catch {
    return { ...PIX_VAZIO };
  }
}

export const salvarConfigPix = (dados) => setDoc(REF(), dados);

// Remove acentos e caracteres fora do padrão, e limita o tamanho.
const limpar = (t, max) => (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^A-Za-z0-9 .\-@]/g, "").trim().toUpperCase().slice(0, max);

// Normaliza a chave conforme o tipo (CPF/CNPJ só números; telefone em +55...).
export function normalizarChave(chave, tipo) {
  const c = (chave || "").trim();
  if (tipo === "CPF" || tipo === "CNPJ") return c.replace(/\D/g, "");
  if (tipo === "Telefone") {
    const n = c.replace(/\D/g, "");
    return n.startsWith("55") ? `+${n}` : `+55${n}`;
  }
  if (tipo === "E-mail") return c.toLowerCase();
  return c;
}

const campo = (id, valor) => `${id}${String(valor.length).padStart(2, "0")}${valor}`;

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function gerarPixCopiaECola({ chave, tipoChave, favorecido, cidade, valor, txid }) {
  const k = normalizarChave(chave, tipoChave);
  if (!k) return "";
  const conta = campo("00", "br.gov.bcb.pix") + campo("01", k);
  const id = (txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const corpo = [
    campo("00", "01"),
    campo("26", conta),
    campo("52", "0000"),
    campo("53", "986"),
    Number(valor) > 0 ? campo("54", Number(valor).toFixed(2)) : "",
    campo("58", "BR"),
    campo("59", limpar(favorecido, 25) || "RBS"),
    campo("60", limpar(cidade, 15) || "RIO DE JANEIRO"),
    campo("62", campo("05", id)),
    "6304",
  ].join("");
  return corpo + crc16(corpo);
}
