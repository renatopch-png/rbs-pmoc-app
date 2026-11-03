import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ArrowLeft, Download, Save } from "lucide-react";
import { db } from "../../services/firebase";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import { deInputData, paraInputData } from "../../lib/financeiro";
import { numeroFmt } from "../../lib/orcamentos";
import { ENDERECO_RBS, EMPRESA, LINHA_RBS, gerarPdfRbs } from "../../lib/pdfRbs";

const CAMPO = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal";
const CONDICOES = "A garantia cobre defeitos dos serviços executados e não se aplica a mau uso, intervenção de terceiros, falta de manutenção preventiva, oscilação ou falha da rede elétrica e danos causados por agentes externos. Equipamentos e componentes seguem a garantia do fabricante.";
const fmt = (s) => deInputData(s).toLocaleDateString("pt-BR");

export function somarDias(inicio, dias) {
  const d = deInputData(inicio);
  d.setDate(d.getDate() + Number(dias));
  return paraInputData(d);
}

export default function GarantiaOrcamento() {
  const { id } = useParams();
  const corpo = useRef(null);
  const [o, setO] = useState(null);
  const [inicio, setInicio] = useState(paraInputData());
  const [dias, setDias] = useState(90);
  const [condicoes, setCondicoes] = useState(CONDICOES);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "orcamentos", id))
      .then((s) => {
        if (!s.exists()) return setErro("Orçamento não encontrado.");
        const d = s.data();
        setO({ id: s.id, ...d });
        if (d.garantiaInicio) {
          setInicio(d.garantiaInicio);
          setDias(d.garantiaDias);
          setCondicoes(d.garantiaCondicoes || CONDICOES);
        }
      })
      .catch(() => setErro("Não foi possível carregar o orçamento."));
  }, [id]);

  if (erro) return <p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>;
  if (!o) return <p className="p-4 text-sm text-gray-500">Carregando...</p>;
  const prazoValido = Number(dias) >= 1 && !!inicio;
  const fim = prazoValido ? somarDias(inicio, dias) : inicio;

  async function salvarEBaixar(baixar) {
    if (!prazoValido) return setAviso("Informe início e prazo válidos.");
    setGerando(true);
    setAviso("");
    try {
      await updateDoc(doc(db, "orcamentos", id), {
        garantiaInicio: inicio, garantiaDias: Number(dias), garantiaValidaAte: fim, garantiaCondicoes: condicoes, garantiaEmitidaEm: serverTimestamp(),
      });
      if (baixar) await gerarPdfRbs(corpo.current, `Garantia_RBS_${numeroFmt(o.numero)}.pdf`);
      setAviso("Garantia registrada.");
    } catch (e) {
      setAviso("Não foi possível registrar: " + e.message);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="mx-auto max-w-[210mm] space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/garantias" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><ArrowLeft size={16} /> Garantias</Link>
        <button onClick={() => salvarEBaixar(true)} disabled={gerando} className="inline-flex items-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Download size={16} /> {gerando ? "Gerando..." : "Salvar e baixar"}</button>
        <button onClick={() => salvarEBaixar(false)} disabled={gerando} className="inline-flex items-center gap-1 rounded-lg border border-rbs bg-white px-3 py-2 text-sm font-semibold text-rbs disabled:opacity-50"><Save size={16} /> Só salvar</button>
      </div>
      {aviso && <p role="status" className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-900">{aviso}</p>}
      <div className="grid gap-2 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Início da garantia<input type="date" className={CAMPO} value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
        <label className="text-xs font-semibold text-slate-600">Prazo (dias)<input type="number" min="1" className={CAMPO} value={dias} onChange={(e) => setDias(e.target.value)} /></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Condições<textarea rows={3} className={CAMPO} value={condicoes} onChange={(e) => setCondicoes(e.target.value)} /></label>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="min-w-[640px] border-b-2 border-rbs bg-rbs-light px-6 py-3">
          <p className="text-lg font-extrabold text-rbs">{EMPRESA}</p>
          <p className="text-xs text-slate-600">{LINHA_RBS}</p>
          <p className="text-xs text-slate-600">CNPJ {DADOS_RBS.cnpj} • {ENDERECO_RBS}</p>
        </div>
        <div ref={corpo} className="min-w-[640px] bg-white px-6 py-5 text-gray-900" style={{ fontSize: 13, lineHeight: 1.6 }}>
          <h1 style={{ color: "#0B5394", fontSize: 18, fontWeight: 800 }}>Termo de Garantia nº {numeroFmt(o.numero)}</h1>
          <p style={{ marginTop: 10 }}><b>Cliente:</b> {o.clienteNome}</p>
          {o.objeto && <p><b>Objeto:</b> {o.objeto}</p>}
          <p><b>Vigência:</b> {inicio ? fmt(inicio) : "—"} a {inicio ? fmt(fim) : "—"} ({dias} dias)</p>
          <h2 style={{ color: "#0B5394", fontSize: 14, fontWeight: 700, marginTop: 14 }}>Serviços cobertos</h2>
          <ul style={{ paddingLeft: 18, listStyle: "disc" }}>
            {(o.itens || []).map((i, n) => <li key={n}>{i.descricao}</li>)}
          </ul>
          <h2 style={{ color: "#0B5394", fontSize: 14, fontWeight: 700, marginTop: 14 }}>Condições</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{condicoes}</p>
          <div className="evitar" style={{ marginTop: 48, width: 400, borderTop: "1px solid #334155", paddingTop: 6 }}>
            <p style={{ fontWeight: 700, color: "#0B5394" }}>RBS Refrigeração e Elétrica</p>
            <p>{DADOS_RBS.responsavelTecnico} • {DADOS_RBS.tituloTecnico}</p>
            <p>{DADOS_RBS.registroTecnico}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
