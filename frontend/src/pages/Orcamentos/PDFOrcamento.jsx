import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Download, HandCoins, MessageCircle } from "lucide-react";
import html2pdf from "html2pdf.js";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import { paraData } from "../../lib/agenda";
import { CONDICAO_ETAPAS, brl, numeroFmt, totalItem } from "../../lib/orcamentos";

const EMPRESA = "RBS REFRIGERAÇÃO E ELÉTRICA";
const LINHA = "Refrigeração Elétrica • Energia Solar • Engenharia Térmica";
const ENDERECO = "Rua Capitão Ferreira, nº 86 — Rio de Janeiro/RJ";
const RODAPE = `RBS Refrigeração e Elétrica | CNPJ ${DADOS_RBS.cnpj}`;

function Secao({ titulo, children }) {
  return (
    <section style={{ marginTop: 14 }}>
      <h2 className="evitar" style={{ color: "#0B5394", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{titulo}</h2>
      {children}
    </section>
  );
}

function TabelaItens({ titulo, itens }) {
  if (itens.length === 0) return null;
  const celula = { padding: "5px 7px", fontSize: 11 };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
      <thead>
        <tr style={{ background: "#1E40AF", color: "#fff" }}>
          <th style={{ ...celula, textAlign: "left" }}>{titulo}</th>
          <th style={{ ...celula, width: 70, textAlign: "right" }}>Qtd.</th>
          <th style={{ ...celula, width: 95, textAlign: "right" }}>Unitário</th>
          <th style={{ ...celula, width: 95, textAlign: "right" }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item, i) => (
          <tr key={i} style={{ background: i % 2 ? "#EFF6FF" : "#fff" }}>
            <td style={celula}>{item.descricao}</td>
            <td style={{ ...celula, textAlign: "right" }}>{item.qtd} {item.unidade}</td>
            <td style={{ ...celula, textAlign: "right" }}>{brl(item.valorUnit)}</td>
            <td style={{ ...celula, textAlign: "right" }}>{brl(totalItem(item))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PDFOrcamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const corpo = useRef(null);
  const [o, setO] = useState(null);
  const [erro, setErro] = useState("");
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "orcamentos", id))
      .then((snap) => (snap.exists() ? setO({ id: snap.id, ...snap.data() }) : setErro("Orçamento não encontrado.")))
      .catch(() => setErro("Não foi possível carregar o orçamento."));
  }, [id]);

  if (erro) return <p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>;
  if (!o) return <p className="p-4 text-sm text-gray-500">Carregando...</p>;

  const data = paraData(o.criadoEm)?.toLocaleDateString("pt-BR") || "—";
  const nomeArquivo = `Orcamento_RBS_${numeroFmt(o.numero)}_${(o.clienteNome || "cliente").replace(/[^\p{L}\p{N}]+/gu, "_")}.pdf`;
  const maoObra = (o.itens || []).filter((i) => i.tipo === "Mão de Obra");
  const materiais = (o.itens || []).filter((i) => i.tipo === "Material");
  const condicoes = [
    o.condicoesPagamento && `Forma de pagamento: ${o.condicoesPagamento}`,
    o.prazoExecucao && `Prazo: ${o.prazoExecucao}`,
    o.garantia && `Garantia: ${o.garantia}`,
    o.naoInclusos && `Não inclusos: ${o.naoInclusos}`,
    `Validade da proposta: ${o.validadeDias} dias a partir de ${data}`,
    o.requerArt && "Serviço com emissão de ART/TRT do responsável técnico.",
    o.malhaAterramento && "Inclui malha de aterramento.",
    o.complexidadeAlvenaria && `Alvenaria: ${o.complexidadeAlvenaria}`,
    o.distanciaCabeamento && `Distância de cabeamento considerada: ${o.distanciaCabeamento} m`,
    CONDICAO_ETAPAS,
    o.observacoes && `Observações: ${o.observacoes}`,
  ].filter(Boolean);
  const secoes = [
    o.escopo && { titulo: "Escopo do Serviço", conteudo: <p style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{o.escopo}</p> },
    o.descricaoDetalhada && { titulo: "Descrição Detalhada dos Serviços", conteudo: <p style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{o.descricaoDetalhada}</p> },
    {
      titulo: "Investimento",
      conteudo: (
        <>
          <TabelaItens titulo="Mão de Obra" itens={maoObra} />
          <TabelaItens titulo="Materiais" itens={materiais} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              <tr><td style={{ padding: 3 }}>Subtotal Mão de Obra</td><td style={{ padding: 3, textAlign: "right" }}>{brl(o.subtotalMaoObra)}</td></tr>
              <tr><td style={{ padding: 3 }}>Subtotal Materiais</td><td style={{ padding: 3, textAlign: "right" }}>{brl(o.subtotalMateriais)}</td></tr>
              {o.frete > 0 && <tr><td style={{ padding: 3 }}>Frete regional</td><td style={{ padding: 3, textAlign: "right" }}>{brl(o.frete)}</td></tr>}
              {o.desconto > 0 && <tr><td style={{ padding: "3px 3px 6px" }}>Desconto</td><td style={{ padding: "3px 3px 6px", textAlign: "right" }}>- {brl(o.desconto)}</td></tr>}
              <tr style={{ background: "#1E40AF", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                <td style={{ padding: "7px 8px" }}>TOTAL DO INVESTIMENTO</td>
                <td style={{ padding: "7px 8px", textAlign: "right" }}>{brl(o.valorTotal)}</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    { titulo: "Condições Comerciais", conteudo: <ul style={{ fontSize: 12, paddingLeft: 18, listStyle: "disc" }}>{condicoes.map((c) => <li key={c} style={{ marginBottom: 3 }}>{c}</li>)}</ul> },
  ].filter(Boolean);

  async function baixar() {
    setGerando(true);
    try {
      await html2pdf()
        .set({
          margin: [34, 14, 16, 14],
          filename: nomeArquivo,
          image: { type: "jpeg", quality: 0.96 },
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
            pdf.setFillColor(239, 246, 255).rect(0, 0, largura, 28, "F");
            pdf.setFillColor(11, 83, 148).rect(0, 28, largura, 0.8, "F");
            pdf.setFont("helvetica", "bold").setFontSize(14).setTextColor(11, 83, 148).text(EMPRESA, 14, 11);
            pdf.setFont("helvetica", "normal").setFontSize(9).setTextColor(60, 70, 85).text(LINHA, 14, 17);
            pdf.text(`CNPJ ${DADOS_RBS.cnpj} • ${ENDERECO}`, 14, 22);
            pdf.setFontSize(8).setTextColor(100).text(`${RODAPE} | Página ${p} de ${total}`, largura / 2, altura - 7, { align: "center" });
          }
        })
        .save();
    } finally {
      setGerando(false);
    }
  }

  function whatsapp() {
    const destino = (o.clienteTelefone || "").replace(/\D/g, "");
    const numero = destino && !destino.startsWith("55") ? `55${destino}` : destino;
    const texto = encodeURIComponent(`Olá! Segue o orçamento nº ${numeroFmt(o.numero)} da RBS, no valor de ${brl(o.valorTotal)}. O PDF vai anexo nesta conversa.`);
    window.open(`https://wa.me/${numero}?text=${texto}`, "_blank");
  }

  function registrarRecebimento() {
    navigate("/financeiro", {
      state: {
        novoLancamento: {
          tipo: "entrada",
          descricao: `Orçamento #${numeroFmt(o.numero)} - ${o.clienteNome}`,
          categoria: "Serviços",
          valor: o.valorTotal,
          orcamentoId: o.id,
        },
      },
    });
  }

  return (
    <div className="mx-auto max-w-[210mm] space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link to={`/orcamentos/${id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><ArrowLeft size={16} /> Editar</Link>
        <button onClick={baixar} disabled={gerando} className="inline-flex items-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Download size={16} /> {gerando ? "Gerando..." : "Baixar PDF"}</button>
        <button onClick={whatsapp} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"><MessageCircle size={16} /> Enviar mensagem</button>
        {isAdmin && (o.status === "Aprovado" || o.status === "Concluído") && (
          <button onClick={registrarRecebimento} className="inline-flex items-center gap-1 rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-semibold text-green-700"><HandCoins size={16} /> Registrar recebimento</button>
        )}
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="min-w-[640px] border-b-2 border-rbs bg-rbs-light px-6 py-3">
          <p className="text-lg font-extrabold text-rbs">{EMPRESA}</p>
          <p className="text-xs text-slate-600">{LINHA}</p>
          <p className="text-xs text-slate-600">CNPJ {DADOS_RBS.cnpj} • {ENDERECO}</p>
        </div>
        <div ref={corpo} className="min-w-[640px] bg-white px-6 py-4 text-gray-900">
          <h1 style={{ color: "#0B5394", fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Proposta Comercial nº {numeroFmt(o.numero)}</h1>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={{ padding: 3 }}><b>Cliente:</b> {o.clienteNome}</td><td style={{ padding: 3, textAlign: "right" }}><b>Data:</b> {data}</td></tr>
              {o.objeto && <tr><td colSpan={2} style={{ padding: 3 }}><b>Objeto:</b> {o.objeto}</td></tr>}
              <tr><td style={{ padding: 3 }}><b>Validade:</b> {o.validadeDias} dias</td><td style={{ padding: 3, textAlign: "right" }}><b>Prazo exec.:</b> {o.prazoExecucao || "A combinar"}</td></tr>
            </tbody>
          </table>
          {secoes.map((s, i) => <Secao key={s.titulo} titulo={`${i + 1}. ${s.titulo}`}>{s.conteudo}</Secao>)}
          <div className="evitar" style={{ marginTop: 18, fontSize: 12 }}>
            <p>Atenciosamente,</p>
            <p style={{ color: "#0B5394", fontWeight: 700, marginTop: 4 }}>RBS Refrigeração e Elétrica</p>
            <p style={{ fontStyle: "italic" }}>{LINHA}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
