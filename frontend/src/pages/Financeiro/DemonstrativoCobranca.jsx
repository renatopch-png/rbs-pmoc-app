import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import QRCode from "qrcode.react";
import { ArrowLeft, Copy, Download, MessageCircle } from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import { gerarPdfRbs } from "../../lib/pdfRbs";
import { paraData } from "../../lib/agenda";
import { brl } from "../../lib/orcamentos";
import { dataBR, lerColecao, linkWhatsApp } from "../../lib/modulos";
import { lerConfigPix } from "../../lib/pix";
import { mensagemCobranca, nomeMes, pixDaCobranca, statusCobranca, txidCobranca } from "../../lib/cobrancas";
import { mesReferencia } from "../../lib/financeiro";

const AZUL = "#0B5394";
const celula = { padding: "5px 7px", fontSize: 11, border: "1px solid #DBEAFE" };

// Demonstrativo de cobrança (não é boleto): resumo do serviço do mês + dados do Pix.
export default function DemonstrativoCobranca() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const corpo = useRef(null);
  const [c, setC] = useState(null);
  const [contrato, setContrato] = useState(null);
  const [execucoes, setExecucoes] = useState([]);
  const [pix, setPix] = useState(null);
  const [erro, setErro] = useState("");
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getDoc(doc(db, "cobrancas", id));
        if (!s.exists()) { setErro("Cobrança não encontrada."); return; }
        const cob = { id: s.id, ...s.data() };
        setC(cob);
        setPix(await lerConfigPix());
        const p = cob.preventivoId ? await getDoc(doc(db, "preventivos", cob.preventivoId)).catch(() => null) : null;
        const prev = p?.exists() ? { id: p.id, ...p.data() } : null;
        setContrato(prev);
        // Serviços executados no mês de referência (OS dos equipamentos do contrato).
        const ordens = await lerColecao("ordens_servico");
        const equip = new Set(prev?.equipamentoIds || []);
        setExecucoes(ordens.filter((o) => {
          const d = paraData(o.dataExecucao);
          if (!d || mesReferencia(d) !== cob.mesReferencia) return false;
          return equip.size ? equip.has(o.equipamentoId) : o.clienteId === cob.clienteId;
        }).sort((a, b) => (paraData(a.dataExecucao) || 0) - (paraData(b.dataExecucao) || 0)));
      } catch (e) {
        setErro("Não foi possível carregar o demonstrativo. " + e.message);
      }
    })();
  }, [id]);

  if (!isAdmin) return <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm">O Financeiro é restrito ao administrador.</div>;
  if (erro) return <p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>;
  if (!c || !pix) return <p className="p-4 text-sm text-slate-500">Carregando...</p>;

  const copiaECola = pixDaCobranca(c, pix);
  const st = statusCobranca(c);
  const nomeArquivo = `Demonstrativo_PMOC_${c.mesReferencia}_${(c.clienteNome || "cliente").replace(/[^\p{L}\p{N}]+/gu, "_")}.pdf`;

  async function baixar() {
    setGerando(true);
    try { await gerarPdfRbs(corpo.current, nomeArquivo); } finally { setGerando(false); }
  }
  async function copiar() {
    try { await navigator.clipboard.writeText(copiaECola); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sem permissão */ }
  }

  return (
    <div className="mx-auto max-w-[210mm] space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/financeiro/cobrancas" className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><ArrowLeft size={16} /> Cobranças</Link>
        <button onClick={baixar} disabled={gerando} className="inline-flex items-center gap-1 rounded-xl bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Download size={16} /> {gerando ? "Gerando..." : "Baixar PDF"}</button>
        {c.clienteTelefone && <a href={linkWhatsApp(c.clienteTelefone, mensagemCobranca(c, pix))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"><MessageCircle size={16} /> WhatsApp</a>}
        {copiaECola && <button onClick={copiar} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><Copy size={16} /> {copiado ? "Copiado!" : "Copiar Pix"}</button>}
      </div>
      {!pix.chave && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          Cadastre a chave Pix em <Link to="/configuracoes" className="underline">Configurações › Dados do Pix</Link> para o QR Code aparecer no demonstrativo.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div ref={corpo} className="min-w-[640px] bg-white px-6 py-4 text-gray-900">
          <h1 style={{ color: AZUL, fontSize: 17, fontWeight: 800, textAlign: "center" }}>DEMONSTRATIVO DE COBRANÇA</h1>
          <p style={{ textAlign: "center", fontSize: 11, color: "#475569", marginBottom: 10 }}>
            Contrato de manutenção — {nomeMes(c.mesReferencia)} • Documento sem valor de boleto
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={celula}><b>Cliente:</b> {c.clienteNome}</td><td style={celula}><b>Referência:</b> {nomeMes(c.mesReferencia)}</td></tr>
              <tr><td style={celula}><b>Serviço:</b> {c.servico}</td><td style={celula}><b>Periodicidade:</b> {contrato?.periodicidade || "Mensal"}</td></tr>
              {contrato?.equipamentoNomes?.length > 0 && <tr><td style={celula} colSpan={2}><b>Equipamentos do contrato:</b> {contrato.equipamentoNomes.join("; ")}</td></tr>}
            </tbody>
          </table>

          <h2 className="evitar" style={{ color: AZUL, fontSize: 13, fontWeight: 800, margin: "14px 0 6px", borderBottom: `1.5px solid ${AZUL}` }}>Serviços executados no período</h2>
          {execucoes.length === 0 ? (
            <p style={{ fontSize: 11, color: "#475569" }}>{contrato?.historico?.some((h) => (h.realizada || "").startsWith(c.mesReferencia)) ? "Manutenção preventiva realizada conforme contrato." : "Manutenção preventiva conforme contrato."}</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#1E40AF", color: "#fff" }}><th style={{ ...celula, textAlign: "left", width: 90 }}>Data</th><th style={{ ...celula, textAlign: "left" }}>Equipamento</th><th style={{ ...celula, textAlign: "left", width: 110 }}>Tipo</th></tr></thead>
              <tbody>
                {execucoes.map((o, i) => (
                  <tr key={o.id} style={{ background: i % 2 ? "#EFF6FF" : "#fff" }}>
                    <td style={celula}>{paraData(o.dataExecucao)?.toLocaleDateString("pt-BR")}</td>
                    <td style={celula}>{[o.equipamentoNome, o.local].filter(Boolean).join(" — ")}</td>
                    <td style={celula}>{o.tipoAtendimento || "Preventiva"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <table className="evitar" style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }}>
            <tbody>
              <tr><td style={{ padding: 4, fontSize: 12 }}>Vencimento</td><td style={{ padding: 4, fontSize: 12, textAlign: "right", fontWeight: 700 }}>{dataBR(c.vencimento)}</td></tr>
              <tr style={{ background: "#1E40AF", color: "#fff", fontWeight: 800, fontSize: 15 }}>
                <td style={{ padding: "8px 10px" }}>VALOR A PAGAR</td><td style={{ padding: "8px 10px", textAlign: "right" }}>{brl(c.valor)}</td>
              </tr>
              {st.rotulo === "Paga" && <tr><td colSpan={2} style={{ padding: 4, fontSize: 12, color: "#15803d", fontWeight: 700, textAlign: "right" }}>PAGO em {dataBR(c.pagoEm)} ({c.formaPagamento})</td></tr>}
            </tbody>
          </table>

          {pix.chave && (
            <div className="evitar" style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16, padding: 12, border: "1.5px solid #10b981", borderRadius: 8, background: "#f0fdf4" }}>
              <div style={{ background: "#fff", padding: 6, borderRadius: 6 }}><QRCode value={copiaECola} size={130} level="M" includeMargin={false} /></div>
              <div style={{ fontSize: 11.5, lineHeight: 1.55, minWidth: 0 }}>
                <p style={{ fontWeight: 800, color: "#047857", fontSize: 13 }}>Pague com Pix</p>
                <p>Abra o app do seu banco, escolha <b>Pix › Ler QR Code</b> ou <b>Pix Copia e Cola</b>. O valor já vem preenchido.</p>
                <p><b>Chave ({pix.tipoChave}):</b> {pix.chave}</p>
                <p><b>Favorecido:</b> {pix.favorecido}{pix.banco && ` — ${pix.banco}`}</p>
                <p><b>Identificador:</b> {txidCobranca(c)}</p>
                <p style={{ marginTop: 4, fontSize: 9, color: "#475569", wordBreak: "break-all" }}><b>Copia e cola:</b> {copiaECola}</p>
              </div>
            </div>
          )}
          {pix.instrucoes && <p style={{ fontSize: 11, marginTop: 8 }}>{pix.instrucoes}</p>}
          <p style={{ fontSize: 10, color: "#64748b", marginTop: 14 }}>
            Este documento é um demonstrativo para conferência e pagamento via Pix. Não é boleto bancário. Em caso de dúvida: {DADOS_RBS.telefoneFmt}.
          </p>
        </div>
      </div>
    </div>
  );
}
