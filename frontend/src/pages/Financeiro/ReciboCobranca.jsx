import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Download, MessageCircle } from "lucide-react";
import { db } from "../../services/firebase";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import { valorPorExtenso } from "../../lib/extenso";
import { FORMAS_PAGAMENTO, deInputData, paraInputData } from "../../lib/financeiro";
import { paraData } from "../../lib/agenda";
import { brl } from "../../lib/orcamentos";
import { linkWhatsApp } from "../../lib/modulos";
import { nomeMes } from "../../lib/cobrancas";
import { ENDERECO_RBS, EMPRESA, LINHA_RBS, gerarPdfRbs } from "../../lib/pdfRbs";

const CAMPO = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal";

// Recibo da mensalidade do contrato PMOC (mesmo modelo do recibo do orçamento).
export default function ReciboCobranca() {
  const { id } = useParams();
  const corpo = useRef(null);
  const [c, setC] = useState(null);
  const [erro, setErro] = useState("");
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState("Pix");
  const [data, setData] = useState(paraInputData());
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "cobrancas", id))
      .then((s) => {
        if (!s.exists()) return setErro("Cobrança não encontrada.");
        const x = { id: s.id, ...s.data() };
        setC(x);
        setValor(x.valor);
        if (x.formaPagamento) setForma(x.formaPagamento);
        const pago = paraData(x.pagoEm);
        if (pago) setData(paraInputData(pago));
      })
      .catch(() => setErro("Não foi possível carregar a cobrança."));
  }, [id]);

  if (erro) return <p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>;
  if (!c) return <p className="p-4 text-sm text-gray-500">Carregando...</p>;
  const numero = `PMOC-${c.mesReferencia.replace("-", "")}`;
  const referente = `${c.servico || "manutenção preventiva"} — contrato de manutenção PMOC, mensalidade de ${nomeMes(c.mesReferencia).toLowerCase()}`;

  async function baixar() {
    setGerando(true);
    try {
      await gerarPdfRbs(corpo.current, `Recibo_${numero}_${(c.clienteNome || "cliente").replace(/[^\p{L}\p{N}]+/gu, "_")}.pdf`);
    } finally {
      setGerando(false);
    }
  }

  const texto = `Olá! Segue o recibo da mensalidade PMOC de ${nomeMes(c.mesReferencia)} (${brl(valor)}). O PDF vai anexo nesta conversa. Obrigado! — RBS Refrigeração e Elétrica`;

  return (
    <div className="mx-auto max-w-[210mm] space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/financeiro/cobrancas" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><ArrowLeft size={16} /> Cobranças</Link>
        <button onClick={baixar} disabled={gerando} className="inline-flex items-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Download size={16} /> {gerando ? "Gerando..." : "Baixar recibo"}</button>
        {c.clienteTelefone && <a href={linkWhatsApp(c.clienteTelefone, texto)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"><MessageCircle size={16} /> WhatsApp</a>}
      </div>
      {c.status !== "Pago" && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Esta cobrança ainda não foi marcada como paga. Confira o valor e a data antes de emitir.</p>}
      <div className="grid gap-2 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-3">
        <label className="text-xs font-semibold text-slate-600">Valor recebido (R$)<input type="number" min="0.01" step="0.01" className={CAMPO} value={valor} onChange={(e) => setValor(e.target.value)} /></label>
        <label className="text-xs font-semibold text-slate-600">Forma de pagamento<select className={CAMPO} value={forma} onChange={(e) => setForma(e.target.value)}>{FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Data<input type="date" className={CAMPO} value={data} onChange={(e) => setData(e.target.value)} /></label>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="min-w-[640px] border-b-2 border-rbs bg-rbs-light px-6 py-3">
          <p className="text-lg font-extrabold text-rbs">{EMPRESA}</p>
          <p className="text-xs text-slate-600">{LINHA_RBS}</p>
          <p className="text-xs text-slate-600">CNPJ {DADOS_RBS.cnpj} • {ENDERECO_RBS}</p>
        </div>
        <div ref={corpo} className="min-w-[640px] bg-white px-6 py-5 text-gray-900" style={{ fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h1 style={{ color: "#0B5394", fontSize: 18, fontWeight: 800 }}>Recibo nº {numero}</h1>
            <p style={{ color: "#1E40AF", fontSize: 18, fontWeight: 800 }}>{brl(valor)}</p>
          </div>
          <p style={{ marginTop: 14 }}>
            Recebemos de <b>{c.clienteNome}</b> a importância de <b>{brl(valor)}</b> ({valorPorExtenso(valor)}),
            via <b>{forma}</b>, referente a {referente}.
          </p>
          <p style={{ marginTop: 10 }}>Para maior clareza, firmamos o presente recibo, dando plena quitação do valor acima.</p>
          <p style={{ marginTop: 18 }}>Rio de Janeiro, {deInputData(data).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.</p>
          <div className="evitar" style={{ marginTop: 56, width: 400, borderTop: "1px solid #334155", paddingTop: 6 }}>
            <p style={{ fontWeight: 700, color: "#0B5394" }}>RBS Refrigeração e Elétrica</p>
            <p>{DADOS_RBS.responsavelTecnico} • {DADOS_RBS.tituloTecnico}</p>
            <p>{DADOS_RBS.registroTecnico}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
