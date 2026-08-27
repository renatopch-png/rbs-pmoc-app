import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import html2pdf from "html2pdf.js";

export default function GeradorPMOC() {
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

  function formatarDataHora(v) {
    if (!v) return "—";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleString("pt-BR");
  }

  function gerarPDF() {
    const element = document.getElementById("conteudo-pdf");
    const opt = {
      margin: 10,
      filename: `PMOC-${ordem.equipamentoNome}-${new Date().toISOString().split("T")[0]}.pdf`,
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
          <h1 className="text-2xl font-bold text-gray-900">Gerar PMOC</h1>
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
              📥 Baixar PDF
            </button>
          </div>
        </div>

        {/* Conteúdo PDF */}
        <div
          id="conteudo-pdf"
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
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1e3a8a",
                margin: "0 0 10px 0",
              }}
            >
              RELATÓRIO DE MANUTENÇÃO PMOC
            </h1>
            <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
              Plano de Manutenção, Operação e Controle
            </p>
          </div>

          {/* Informações gerais */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Data/Hora: <strong>{formatarDataHora(ordem.dataExecucao)}</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Técnico: <strong>{ordem.tecnicoNome || "—"}</strong>
            </div>
          </div>

          {/* Dados do Cliente */}
          {cliente && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f0f4ff",
                borderLeft: "4px solid #1e3a8a",
              }}
            >
              <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                🏢 CLIENTE
              </h2>
              <div style={{ fontSize: "12px", margin: "4px 0" }}>
                <strong>Empresa:</strong> {cliente.nome}
              </div>
              {cliente.edificio && (
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Edifício:</strong> {cliente.edificio}
                </div>
              )}
              {cliente.endereco && (
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Endereço:</strong> {cliente.endereco}
                </div>
              )}
              {cliente.contato && (
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Contato:</strong> {cliente.contato}
                </div>
              )}
              {cliente.telefone && (
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Telefone:</strong> {cliente.telefone}
                </div>
              )}
            </div>
          )}

          {/* Dados do Equipamento */}
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#fff5f0",
              borderLeft: "4px solid #d97757",
            }}
          >
            <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              ⚙️ EQUIPAMENTO
            </h2>
            <div style={{ fontSize: "12px", margin: "4px 0" }}>
              <strong>Identificação:</strong> {ordem.equipamentoNome}
            </div>
            <div style={{ fontSize: "12px", margin: "4px 0" }}>
              <strong>Tipo:</strong> {ordem.tipo || "—"}
            </div>
            <div style={{ fontSize: "12px", margin: "4px 0" }}>
              <strong>Marca:</strong> {ordem.marca || "—"}
            </div>
            <div style={{ fontSize: "12px", margin: "4px 0" }}>
              <strong>Modelo:</strong> {ordem.modelo || "—"}
            </div>
            <div style={{ fontSize: "12px", margin: "4px 0" }}>
              <strong>Capacidade:</strong> {ordem.capacidade || "—"}
            </div>
            <div style={{ fontSize: "12px", margin: "4px 0" }}>
              <strong>Local:</strong> {ordem.local || "—"}
            </div>
            {ordem.numeroSerie && (
              <div style={{ fontSize: "12px", margin: "4px 0" }}>
                <strong>Nº de série:</strong> {ordem.numeroSerie}
              </div>
            )}
          </div>

          {/* Checklist */}
          {Array.isArray(ordem.itensChecklist) && ordem.itensChecklist.length > 0 && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f0fdf4",
                borderLeft: "4px solid #16a34a",
              }}
            >
              <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                ✓ CHECKLIST DE MANUTENÇÃO
              </h2>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <tbody>
                  {ordem.itensChecklist.map((item, i) => {
                    const feito = item.feito || item.concluido || item.checked;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #e0e0e0" }}>
                        <td style={{ padding: "6px", width: "20px" }}>
                          {feito ? "✓" : "○"}
                        </td>
                        <td style={{ padding: "6px", textDecoration: feito ? "none" : "none" }}>
                          {item.descricao || item.nome || item.texto || `Item ${i + 1}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Observações */}
          {ordem.observacoes && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#fffbeb",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                📝 OBSERVAÇÕES
              </h2>
              <p style={{ fontSize: "12px", margin: "0", whiteSpace: "pre-wrap" }}>
                {ordem.observacoes}
              </p>
            </div>
          )}

          {/* Fotos */}
          {Array.isArray(ordem.fotos) && ordem.fotos.length > 0 && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f5f3ff",
                borderLeft: "4px solid #8b5cf6",
              }}
            >
              <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                📷 EVIDÊNCIA FOTOGRÁFICA ({ordem.fotos.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {ordem.fotos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Foto ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #e0e0e0",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Assinatura e Data */}
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #e0e0e0",
              paddingTop: "20px",
            }}
          >
            <div style={{ textAlign: "center", fontSize: "11px" }}>
              <div style={{ height: "40px", marginBottom: "8px" }}>
                <div style={{ borderTop: "1px solid #333" }}>
                  <strong>{ordem.tecnicoNome || "Técnico"}</strong>
                </div>
              </div>
              <div>Assinatura do Técnico</div>
            </div>
            <div style={{ textAlign: "center", fontSize: "11px" }}>
              <div style={{ height: "40px", marginBottom: "8px" }}>
                <div style={{ borderTop: "1px solid #333" }}>
                  <strong>Cliente</strong>
                </div>
              </div>
              <div>Assinatura do Cliente</div>
            </div>
          </div>

          {/* Rodapé */}
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "2px solid #1e3a8a",
              textAlign: "center",
              fontSize: "10px",
              color: "#666",
            }}
          >
            <p style={{ margin: "4px 0" }}>
              <strong>RBS Refrigeração Elétrica • Engenharia Térmica • Energia Solar</strong>
            </p>
            <p style={{ margin: "4px 0" }}>
              Gerado em {new Date().toLocaleString("pt-BR")} • Sistema PMOC Web
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
