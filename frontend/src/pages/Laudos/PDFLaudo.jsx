import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Download, MessageCircle } from "lucide-react";
import html2pdf from "html2pdf.js";
import { db } from "../../services/firebase";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import { numeroFmt } from "../../lib/orcamentos";
import { dataBR, linkWhatsApp } from "../../lib/modulos";
import { BOTAO, BOTAO_SEC, Erro } from "../../components/ui";

const EMPRESA = "RBS REFRIGERAÇÃO E ELÉTRICA";
const LINHA = "Refrigeração Elétrica • Energia Solar • Engenharia Térmica";
const AZUL = "#0B5394";
const celula = { padding: "5px 7px", fontSize: 11, border: "1px solid #DBEAFE" };

function Secao({ n, titulo, children }) {
  return (
    <section style={{ marginTop: 14 }}>
      <h2 className="evitar" style={{ color: AZUL, fontSize: 13, fontWeight: 800, marginBottom: 6, borderBottom: `1.5px solid ${AZUL}`, paddingBottom: 2 }}>{n}. {titulo}</h2>
      {children}
    </section>
  );
}

const Texto = ({ children }) => <p style={{ fontSize: 11.5, whiteSpace: "pre-wrap", lineHeight: 1.5, textAlign: "justify" }}>{children}</p>;

export default function PDFLaudo() {
  const { id } = useParams();
  const corpo = useRef(null);
  const [l, setL] = useState(null);
  const [erro, setErro] = useState("");
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "laudos", id))
      .then((s) => (s.exists() ? setL({ id: s.id, ...s.data() }) : setErro("Relatório não encontrado.")))
      .catch(() => setErro("Não foi possível carregar o relatório."));
  }, [id]);

  if (erro) return <Erro>{erro}</Erro>;
  if (!l) return <p className="p-4 text-sm text-slate-500">Carregando...</p>;

  const nomeArquivo = `${l.tipo.replace(/[^\p{L}\p{N}]+/gu, "_")}_RBS_${numeroFmt(l.numero)}_${(l.clienteNome || "cliente").replace(/[^\p{L}\p{N}]+/gu, "_")}.pdf`;
  const medicoes = (l.medicoes || []).filter((m) => m.parametro);
  const recomendacoes = (l.recomendacoes || "").split("\n").map((r) => r.trim()).filter(Boolean);
  const secoes = [
    l.objetivo && ["Objetivo", <Texto key="o">{l.objetivo}</Texto>],
    l.situacao && ["Situação Encontrada", <Texto key="s">{l.situacao}</Texto>],
    medicoes.length > 0 && ["Medições e Testes", (
      <table key="m" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#1E40AF", color: "#fff" }}>
            <th style={{ ...celula, textAlign: "left" }}>Parâmetro</th>
            <th style={{ ...celula, width: 90, textAlign: "center" }}>Medido</th>
            <th style={{ ...celula, width: 120, textAlign: "center" }}>Referência</th>
          </tr>
        </thead>
        <tbody>
          {medicoes.map((m, i) => (
            <tr key={i} style={{ background: i % 2 ? "#EFF6FF" : "#fff" }}>
              <td style={celula}>{m.parametro}</td>
              <td style={{ ...celula, textAlign: "center", fontWeight: 700 }}>{m.valor || "—"} {m.valor && m.unidade}</td>
              <td style={{ ...celula, textAlign: "center" }}>{m.referencia ? `${m.referencia} ${m.unidade || ""}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )],
    l.fotos?.length > 0 && ["Registro Fotográfico", (
      <div key="f" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {l.fotos.map((f, i) => (
          <figure key={f.url} className="evitar" style={{ margin: 0 }}>
            <img src={f.url} alt={f.legenda || `Foto ${i + 1}`} crossOrigin="anonymous" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 4 }} />
            <figcaption style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>Foto {i + 1}{f.legenda && ` — ${f.legenda}`}</figcaption>
          </figure>
        ))}
      </div>
    )],
    l.diagnostico && ["Diagnóstico / Análise Técnica", <Texto key="d">{l.diagnostico}</Texto>],
    l.conclusao && ["Conclusão", <Texto key="c">{l.conclusao}</Texto>],
    recomendacoes.length > 0 && ["Recomendações", <ol key="r" style={{ fontSize: 11.5, paddingLeft: 18, listStyle: "decimal" }}>{recomendacoes.map((r) => <li key={r} style={{ marginBottom: 2 }}>{r}</li>)}</ol>],
  ].filter(Boolean);

  async function baixar() {
    setGerando(true);
    try {
      await html2pdf()
        .set({
          margin: [32, 14, 16, 14],
          filename: nomeArquivo,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
          pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".evitar"] },
        })
        .from(corpo.current)
        .toPdf()
        .get("pdf")
        .then((pdf) => {
          const total = pdf.internal.getNumberOfPages();
          const largura = pdf.internal.pageSize.getWidth();
          const altura = pdf.internal.pageSize.getHeight();
          for (let p = 1; p <= total; p += 1) {
            pdf.setPage(p);
            pdf.setFillColor(239, 246, 255).rect(0, 0, largura, 26, "F");
            pdf.setFillColor(11, 83, 148).rect(0, 26, largura, 0.8, "F");
            pdf.setFont("helvetica", "bold").setFontSize(13).setTextColor(11, 83, 148).text(EMPRESA, 14, 10);
            pdf.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(60, 70, 85).text(LINHA, 14, 15.5);
            pdf.text(`CNPJ ${DADOS_RBS.cnpj} • ${DADOS_RBS.endereco} • ${DADOS_RBS.telefoneFmt}`, 14, 20.5);
            pdf.setFont("helvetica", "bold").setTextColor(11, 83, 148).text(`Nº ${numeroFmt(l.numero)}`, largura - 14, 10, { align: "right" });
            pdf.setFont("helvetica", "normal").setFontSize(8).setTextColor(100).text(`${l.tipo} nº ${numeroFmt(l.numero)} — ${l.clienteNome} | Página ${p} de ${total}`, largura / 2, altura - 7, { align: "center" });
          }
        })
        .save();
      if (l.status === "Rascunho") {
        await updateDoc(doc(db, "laudos", id), { status: "Finalizado" }).catch(() => {});
        setL({ ...l, status: "Finalizado" });
      }
    } finally {
      setGerando(false);
    }
  }

  const textoZap = `Olá! Segue o ${l.tipo.toLowerCase()} nº ${numeroFmt(l.numero)} referente à visita de ${dataBR(l.dataVisita)}. O PDF vai anexo nesta conversa. — RBS Refrigeração e Elétrica`;

  return (
    <div className="mx-auto max-w-[210mm] space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link to={`/laudos/${id}`} className={BOTAO_SEC}><ArrowLeft size={16} /> Editar</Link>
        <button onClick={baixar} disabled={gerando} className={BOTAO}><Download size={16} /> {gerando ? "Gerando..." : "Baixar PDF"}</button>
        <a href={linkWhatsApp(l.clienteTelefone, textoZap)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"><MessageCircle size={16} /> WhatsApp</a>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="min-w-[640px] border-b-2 border-rbs bg-rbs-light px-6 py-3">
          <p className="text-lg font-extrabold text-rbs">{EMPRESA}</p>
          <p className="text-xs text-slate-600">{LINHA}</p>
          <p className="text-xs text-slate-600">CNPJ {DADOS_RBS.cnpj} • {DADOS_RBS.endereco}</p>
        </div>
        <div ref={corpo} className="min-w-[640px] bg-white px-6 py-4 text-gray-900">
          <h1 style={{ color: AZUL, fontSize: 17, fontWeight: 800, textAlign: "center", textTransform: "uppercase" }}>{l.tipo}</h1>
          <p style={{ textAlign: "center", fontSize: 11, color: "#475569", marginBottom: 10 }}>Nº {numeroFmt(l.numero)}{l.assunto && ` — ${l.assunto}`}</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={celula}><b>Cliente:</b> {l.clienteNome}</td><td style={celula}><b>Data da visita:</b> {dataBR(l.dataVisita)}</td></tr>
              {l.clienteEndereco && <tr><td style={celula} colSpan={2}><b>Local:</b> {l.clienteEndereco}</td></tr>}
              {l.equipamentoNome && <tr><td style={celula} colSpan={2}><b>Equipamento / sistema:</b> {l.equipamentoNome}</td></tr>}
              <tr><td style={celula}><b>Técnico:</b> {l.tecnico || "—"}</td><td style={celula}><b>Acompanhante:</b> {l.acompanhante || "—"}</td></tr>
            </tbody>
          </table>
          {secoes.map(([titulo, conteudo], i) => <Secao key={titulo} n={i + 1} titulo={titulo}>{conteudo}</Secao>)}
          {l.normas && <p style={{ fontSize: 10, color: "#475569", marginTop: 12 }}><b>Normas de referência:</b> {l.normas}</p>}
          <div className="evitar" style={{ marginTop: 40, display: "flex", justifyContent: "space-around", fontSize: 11, textAlign: "center" }}>
            <div style={{ width: 230 }}>
              <div style={{ borderTop: "1px solid #334155", paddingTop: 4 }}>
                <b>{DADOS_RBS.responsavelTecnico}</b><br />{DADOS_RBS.tituloTecnico}<br />{DADOS_RBS.registroTecnico}
              </div>
            </div>
            <div style={{ width: 230 }}>
              <div style={{ borderTop: "1px solid #334155", paddingTop: 4 }}>
                <b>{l.acompanhante || l.clienteNome}</b><br />Cliente / responsável pelo local
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
