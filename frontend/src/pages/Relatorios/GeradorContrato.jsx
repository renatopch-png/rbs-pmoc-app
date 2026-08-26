import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import html2pdf from "html2pdf.js";

const LOGOMARCA_URL =
  "https://firebasestorage.googleapis.com/v0/b/rbs-pmoc.firebasestorage.app/o/Screenshot_20260318_065706_WhatsApp.jpg?alt=media&token=ad4445f7-72db-426c-ab81-a2bf8435fc86";

const CNPJ_RBS = "33.632.222/0001-86";
const ENDERECO_RBS = "Rua Capitão Ferreira, 86 - Rio de Janeiro";
const TELEFONE_RBS = "(21) 98765-4321";

export default function GeradorContrato() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (clienteId) {
          const docCli = await getDoc(doc(db, "clientes", clienteId));
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
  }, [clienteId]);

  function formatarData(d) {
    const data = new Date();
    return data.toLocaleDateString("pt-BR");
  }

  function gerarPDF() {
    const element = document.getElementById("conteudo-contrato");
    const opt = {
      margin: 10,
      filename: `Contrato-PMOC-${cliente?.nome}-${new Date().toISOString().split("T")[0]}.pdf`,
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

  if (erro || !cliente) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-semibold text-red-900">{erro || "Cliente não encontrado"}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Gerar Contrato PMOC</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Voltar
            </button>
            <button
              onClick={gerarPDF}
              className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900"
            >
              📥 Baixar Contrato
            </button>
          </div>
        </div>

        {/* Conteúdo Contrato */}
        <div
          id="conteudo-contrato"
          className="rounded-xl bg-white p-8 shadow-sm"
          style={{
            fontFamily: "Arial, sans-serif",
            color: "#333",
            lineHeight: "1.6",
          }}
        >
          {/* Header com logomarca */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: "2px solid #1e3a8a",
            }}
          >
            <img
              src={LOGOMARCA_URL}
              alt="Logo RBS"
              style={{ height: "100px", maxWidth: "150px" }}
            />
          </div>

          {/* Título */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1e3a8a",
                margin: "0 0 10px 0",
              }}
            >
              CONTRATO DE SERVIÇO PMOC
            </h1>
            <p style={{ fontSize: "11px", color: "#666", margin: "0" }}>
              Plano de Manutenção, Operação e Controle
            </p>
          </div>

          {/* Dados */}
          <div style={{ marginBottom: "20px", fontSize: "11px" }}>
            <div style={{ marginBottom: "10px" }}>
              <strong>Data:</strong> {formatarData(new Date())}
            </div>
            <div>
              <strong>Contratante:</strong> {cliente.nome}
            </div>
            {cliente.endereco && (
              <div>
                <strong>Endereço:</strong> {cliente.endereco}
              </div>
            )}
            {cliente.telefone && (
              <div>
                <strong>Telefone:</strong> {cliente.telefone}
              </div>
            )}
          </div>

          {/* Dados RBS */}
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#f0f4ff",
              borderLeft: "4px solid #1e3a8a",
              fontSize: "11px",
            }}
          >
            <strong>Prestador de Serviço:</strong>
            <div>RBS Refrigeração Elétrica • Engenharia Térmica • Energia Solar</div>
            <div>CNPJ: {CNPJ_RBS}</div>
            <div>Endereço: {ENDERECO_RBS}</div>
            <div>Telefone: {TELEFONE_RBS}</div>
          </div>

          {/* Objeto do Contrato */}
          <div style={{ marginBottom: "20px", fontSize: "11px" }}>
            <h2 style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              1. OBJETO DO CONTRATO
            </h2>
            <p style={{ margin: "0" }}>
              O presente contrato regula a prestação de serviço de Manutenção, Operação e Controle (PMOC)
              de equipamentos de refrigeração, conforme normas técnicas vigentes e legislação aplicável.
            </p>
          </div>

          {/* Serviços */}
          <div style={{ marginBottom: "20px", fontSize: "11px" }}>
            <h2 style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              2. SERVIÇOS A SEREM PRESTADOS
            </h2>
            <ul style={{ margin: "0", paddingLeft: "20px" }}>
              <li>Manutenção preventiva periódica do(s) equipamento(s)</li>
              <li>Inspeção visual e operacional</li>
              <li>Verificação de pressão e temperatura</li>
              <li>Limpeza de serpentinas e filtros</li>
              <li>Documentação e relatório de cada atendimento</li>
              <li>Emissão de ART (Anotação de Responsabilidade Técnica)</li>
            </ul>
          </div>

          {/* Vigência */}
          <div style={{ marginBottom: "20px", fontSize: "11px" }}>
            <h2 style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              3. VIGÊNCIA DO CONTRATO
            </h2>
            <p style={{ margin: "0" }}>
              Este contrato tem vigência de <strong>12 (doze) meses</strong> a contar da data de assinatura,
              podendo ser renovado por comum acordo entre as partes.
            </p>
          </div>

          {/* Periodicidade */}
          <div style={{ marginBottom: "20px", fontSize: "11px" }}>
            <h2 style={{ fontSize: "12px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              4. PERIODICIDADE DE MANUTENÇÃO
            </h2>
            <p style={{ margin: "0" }}>
              As visitas técnicas serão realizadas conforme periodicidade acordada entre as partes,
              podendo ser mensal, bimestral, trimestral, semestral ou anual.
            </p>
          </div>

          {/* Assinaturas */}
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #e0e0e0",
              paddingTop: "40px",
              fontSize: "10px",
            }}
          >
            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ height: "60px", marginBottom: "8px" }} />
              <div style={{ borderTop: "1px solid #333", paddingTop: "4px" }}>
                <strong>RBS Refrigeração Elétrica</strong>
                <div style={{ fontSize: "9px" }}>Prestador de Serviço</div>
              </div>
            </div>
            <div style={{ textAlign: "center", width: "45%" }}>
              <div style={{ height: "60px", marginBottom: "8px" }} />
              <div style={{ borderTop: "1px solid #333", paddingTop: "4px" }}>
                <strong>{cliente.contato || "Cliente"}</strong>
                <div style={{ fontSize: "9px" }}>{cliente.nome}</div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "2px solid #1e3a8a",
              textAlign: "center",
              fontSize: "8px",
              color: "#666",
            }}
          >
            <p style={{ margin: "4px 0" }}>
              Contrato gerado automaticamente pelo Sistema PMOC RBS
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
