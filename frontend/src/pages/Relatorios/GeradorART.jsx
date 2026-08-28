import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import html2pdf from "html2pdf.js";

const ENDERECO_RBS = "Rua Capitão Ferreira, 86 - Rio de Janeiro";

export default function GeradorART() {
  const { osId } = useParams();
  const navigate = useNavigate();
  const [ordem, setOrdem] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const docOS = await getDoc(doc(db, "ordens_servico", osId));
        if (!docOS.exists()) {
          setErro("Ordem de serviço não encontrada.");
          setCarregando(false);
          return;
        }

        const dadosOS = { id: docOS.id, ...docOS.data() };
        setOrdem(dadosOS);

        if (dadosOS.clienteId) {
          const docCli = await getDoc(doc(db, "clientes", dadosOS.clienteId));
          if (docCli.exists()) {
            setCliente(docCli.data());
          }
        }
      } catch (e) {
        setErro("Erro ao carregar dados. " + e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [osId]);

  function formatarData(v) {
    if (!v) return "—";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleDateString("pt-BR");
  }

  function gerarPDF() {
    const element = document.getElementById("conteudo-art");
    const opt = {
      margin: 10,
      filename: `ART-${ordem.equipamentoNome}-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };
    html2pdf().set(opt).from(element).save();
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (erro || !ordem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-semibold text-red-900">{erro || "Ordem não encontrada"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Controles */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Gerar ART</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Voltar
            </button>
            <button
              onClick={gerarPDF}
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
            >
              📥 Baixar ART
            </button>
          </div>
        </div>

        {/* Conteúdo ART */}
        <div
          id="conteudo-art"
          className="rounded-xl bg-white p-8 shadow-sm"
          style={{
            fontFamily: "Arial, sans-serif",
            color: "#333",
            lineHeight: "1.6",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #1e3a8a",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1e3a8a" }}>
              RBS Refrigeração Elétrica
            </div>
            <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
              Engenharia Térmica • Energia Solar
            </div>
          </div>

          {/* Título */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1e3a8a",
                margin: "0 0 10px 0",
              }}
            >
              ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA
            </h1>
            <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
              Comprovante de Execução de Serviço Técnico
            </p>
          </div>

          {/* Dados RBS */}
          <div style={{ marginBottom: "20px", fontSize: "11px" }}>
            <strong>Responsável Técnico:</strong>
            <div>RBS Refrigeração Elétrica • Engenharia Térmica • Energia Solar</div>
            <div>CNPJ: {DADOS_RBS.cnpj}</div>
            <div>Endereço: {ENDERECO_RBS}</div>
            <div>Telefone: {DADOS_RBS.telefoneFmt}</div>
          </div>

          {/* Dados do Cliente */}
          {cliente && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f0f4ff",
                borderLeft: "4px solid #1e3a8a",
                fontSize: "12px",
              }}
            >
              <h2 style={{ fontSize: "13px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                CLIENTE RESPONSÁVEL
              </h2>
              <div>
                <strong>Empresa:</strong> {cliente.nome}
              </div>
              {cliente.edificio && (
                <div>
                  <strong>Edifício:</strong> {cliente.edificio}
                </div>
              )}
              {cliente.contato && (
                <div>
                  <strong>Responsável:</strong> {cliente.contato}
                </div>
              )}
              {cliente.telefone && (
                <div>
                  <strong>Telefone:</strong> {cliente.telefone}
                </div>
              )}
            </div>
          )}

          {/* Equipamento */}
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#fff5f0",
              borderLeft: "4px solid #d97757",
              fontSize: "12px",
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              EQUIPAMENTO ATENDIDO
            </h2>
            <div>
              <strong>Identificação:</strong> {ordem.equipamentoNome}
            </div>
            <div>
              <strong>Tipo:</strong> {ordem.tipo || "—"}
            </div>
            <div>
              <strong>Local:</strong> {ordem.local || "—"}
            </div>
          </div>

          {/* Declaração de Responsabilidade */}
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              fontSize: "11px",
              lineHeight: "1.8",
            }}
          >
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              DECLARAÇÃO DO RESPONSÁVEL TÉCNICO
            </p>
            <p style={{ margin: "8px 0" }}>
              Declaro que a manutenção do equipamento acima identificado foi realizada por profissional
              técnico capacitado e responsável, em conformidade com as normas técnicas vigentes e as
              recomendações do fabricante.
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>Responsável Técnico:</strong> {DADOS_RBS.responsavelTecnico} — {DADOS_RBS.tituloTecnico} — {DADOS_RBS.registroTecnico}
              <br />
              <strong>Executado por:</strong> {ordem.tecnicoNome || "—"}
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>Data de Execução:</strong> {formatarData(ordem.dataExecucao)}
            </p>
            <p style={{ margin: "8px 0", color: "#d97757" }}>
              <strong>
                Esta ART certifica a realização de trabalho técnico responsável e competente.
              </strong>
            </p>
          </div>

          {/* Assinaturas */}
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #e0e0e0",
              paddingTop: "20px",
              fontSize: "11px",
            }}
          >
            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ height: "50px", marginBottom: "8px" }}>
                <div style={{ borderTop: "1px solid #333" }}>
                  <strong>{ordem.tecnicoNome || "Técnico Responsável"}</strong>
                </div>
              </div>
              <div>Assinatura do Técnico</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>
                {formatarData(ordem.dataExecucao)}
              </div>
            </div>
            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ height: "50px", marginBottom: "8px" }}>
                <div style={{ borderTop: "1px solid #333" }}>
                  <strong>{cliente?.contato || "Cliente"}</strong>
                </div>
              </div>
              <div>Assinatura do Cliente</div>
              <div style={{ fontSize: "10px", marginTop: "4px" }}>Data ___/___/_____</div>
            </div>
          </div>

          {/* Rodapé */}
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "2px solid #1e3a8a",
              textAlign: "center",
              fontSize: "9px",
              color: "#666",
            }}
          >
            <p style={{ margin: "4px 0" }}>
              Documento gerado automaticamente pelo Sistema PMOC RBS
            </p>
            <p style={{ margin: "4px 0" }}>
              Gerado em {new Date().toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
