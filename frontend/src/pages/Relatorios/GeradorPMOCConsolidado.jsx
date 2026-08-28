import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import html2pdf from "html2pdf.js";

// Mesmo mapeamento usado no alerta de manutenções atrasadas do Dashboard
const PERIODICIDADES = {
  Mensal: 30,
  Bimestral: 60,
  Trimestral: 90,
  Semestral: 180,
  Anual: 365,
};

// Relatório PMOC consolidado: um único PDF reunindo TODOS os equipamentos
// de um cliente, cada um com os dados do equipamento e a última manutenção
// executada — inspirado no relatório multi-ambiente dos PDFs de referência
// (AppPMOCCliente.pdf), em vez de um PDF separado por equipamento.
export default function GeradorPMOCConsolidado() {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [itens, setItens] = useState([]); // [{ equipamento, ultimaOS }]
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const docCli = await getDoc(doc(db, "clientes", clienteId));
        if (!docCli.exists()) {
          setErro("Cliente não encontrado.");
          setCarregando(false);
          return;
        }
        setCliente({ id: docCli.id, ...docCli.data() });

        const snapEquip = await getDocs(
          query(collection(db, "equipamentos"), where("clienteId", "==", clienteId))
        );
        const equipamentos = snapEquip.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

        // Para cada equipamento, busca a OS mais recente (sem orderBy no
        // Firestore, para não exigir índice composto — ordenamos aqui).
        const lista = await Promise.all(
          equipamentos.map(async (equipamento) => {
            const snapOS = await getDocs(
              query(collection(db, "ordens_servico"), where("equipamentoId", "==", equipamento.id))
            );
            const os = snapOS.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) => {
                const da = a.dataExecucao?.toMillis ? a.dataExecucao.toMillis() : 0;
                const db_ = b.dataExecucao?.toMillis ? b.dataExecucao.toMillis() : 0;
                return db_ - da;
              });
            const ultimaOS = os[0] || null;
            const periodicidade = equipamento.periodicidade || "Mensal";
            const diasPeriodo = PERIODICIDADES[periodicidade] || 30;

            let proximaData = null;
            let diasRestantes = null;
            if (ultimaOS) {
              const dataUltima = ultimaOS.dataExecucao?.toDate
                ? ultimaOS.dataExecucao.toDate()
                : new Date(ultimaOS.dataExecucao);
              proximaData = new Date(dataUltima);
              proximaData.setDate(proximaData.getDate() + diasPeriodo);
              diasRestantes = Math.ceil((proximaData - new Date()) / (1000 * 60 * 60 * 24));
            }

            return {
              equipamento,
              ultimaOS,
              totalExecucoes: os.length,
              periodicidade,
              proximaData,
              diasRestantes,
            };
          })
        );

        // Ordena a lista pela urgência: sem manutenção nunca feita primeiro,
        // depois pela data prevista mais próxima (mais atrasada primeiro)
        lista.sort((a, b) => {
          if (!a.ultimaOS && !b.ultimaOS) return 0;
          if (!a.ultimaOS) return -1;
          if (!b.ultimaOS) return 1;
          return a.proximaData - b.proximaData;
        });

        setItens(lista);
      } catch (e) {
        setErro("Erro ao carregar dados. " + e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [clienteId]);

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

  function statusManutencao(diasRestantes) {
    if (diasRestantes === null) return { texto: "Nunca realizada", cor: "#dc2626" };
    if (diasRestantes < 0) return { texto: `Atrasada há ${Math.abs(diasRestantes)} dia(s)`, cor: "#dc2626" };
    if (diasRestantes <= 7) return { texto: `Vence em ${diasRestantes} dia(s)`, cor: "#d97706" };
    return { texto: `Em dia (${diasRestantes} dias)`, cor: "#16a34a" };
  }

  function gerarPDF() {
    setGerandoPdf(true);
    const element = document.getElementById("conteudo-pmoc-consolidado");
    const opt = {
      margin: 10,
      filename: `PMOC-Consolidado-${cliente?.nome}-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      pagebreak: { mode: ["css", "legacy"] },
    };
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => setGerandoPdf(false))
      .catch(() => setGerandoPdf(false));
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

  const totalEquipamentos = itens.length;
  const totalComManutencao = itens.filter((it) => it.ultimaOS).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Controles */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">PMOC Consolidado — {cliente.nome}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Voltar
            </button>
            <button
              onClick={gerarPDF}
              disabled={gerandoPdf || totalEquipamentos === 0}
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {gerandoPdf ? "Gerando PDF..." : "📥 Baixar PDF Consolidado"}
            </button>
          </div>
        </div>

        {totalEquipamentos === 0 && (
          <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
            Este cliente ainda não tem equipamentos cadastrados.
          </div>
        )}

        {/* Conteúdo PDF */}
        <div
          id="conteudo-pmoc-consolidado"
          className="rounded-xl bg-white p-8 shadow-sm"
          style={{
            fontFamily: "Arial, sans-serif",
            color: "#333",
            lineHeight: "1.6",
          }}
        >
          {/* Capa / cabeçalho */}
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

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "#1e3a8a",
                margin: "0 0 10px 0",
              }}
            >
              RELATÓRIO CONSOLIDADO PMOC
            </h1>
            <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
              Plano de Manutenção, Operação e Controle — todos os equipamentos do cliente
            </p>
          </div>

          {/* Dados do cliente */}
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#f0f4ff",
              borderLeft: "4px solid #1e3a8a",
              fontSize: "12px",
            }}
          >
            <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
              🏢 CLIENTE
            </h2>
            <div style={{ margin: "4px 0" }}>
              <strong>Empresa:</strong> {cliente.nome}
            </div>
            {cliente.edificio && (
              <div style={{ margin: "4px 0" }}>
                <strong>Edifício:</strong> {cliente.edificio}
              </div>
            )}
            {cliente.endereco && (
              <div style={{ margin: "4px 0" }}>
                <strong>Endereço:</strong> {cliente.endereco}
              </div>
            )}
            {cliente.contato && (
              <div style={{ margin: "4px 0" }}>
                <strong>Contato:</strong> {cliente.contato}
              </div>
            )}
            {cliente.telefone && (
              <div style={{ margin: "4px 0" }}>
                <strong>Telefone:</strong> {cliente.telefone}
              </div>
            )}
          </div>

          {/* Resumo */}
          <div
            style={{
              marginBottom: "30px",
              display: "flex",
              gap: "12px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1e3a8a" }}>
                {totalEquipamentos}
              </div>
              <div>Equipamentos</div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#16a34a" }}>
                {totalComManutencao}
              </div>
              <div>Com manutenção registrada</div>
            </div>
          </div>

          {/* Cronograma de Manutenções — visão geral ordenada por urgência */}
          {itens.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0", color: "#1e3a8a" }}>
                📅 CRONOGRAMA DE MANUTENÇÕES
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1e3a8a", color: "#fff" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Equipamento</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Periodicidade</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Última manutenção</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Próxima prevista</th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map(({ equipamento, ultimaOS, periodicidade, proximaData, diasRestantes }, idx) => {
                    const status = statusManutencao(diasRestantes);
                    return (
                      <tr
                        key={equipamento.id}
                        style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f0f4ff" }}
                      >
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {equipamento.nome}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {periodicidade}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {formatarData(ultimaOS?.dataExecucao)}
                        </td>
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
                          {formatarData(proximaData)}
                        </td>
                        <td
                          style={{
                            padding: "6px 8px",
                            borderBottom: "1px solid #e5e7eb",
                            color: status.cor,
                            fontWeight: "bold",
                          }}
                        >
                          {status.texto}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Um bloco por equipamento */}
          {itens.map(({ equipamento, ultimaOS, totalExecucoes, periodicidade, proximaData, diasRestantes }, idx) => (
            <div
              key={equipamento.id}
              style={{
                marginBottom: "24px",
                pageBreakBefore: idx === 0 ? "auto" : "always",
                breakBefore: idx === 0 ? "auto" : "page",
              }}
            >
              {/* Dados do equipamento */}
              <div
                style={{
                  marginBottom: "12px",
                  padding: "15px",
                  backgroundColor: "#fff5f0",
                  borderLeft: "4px solid #d97757",
                }}
              >
                <h2 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                  ⚙️ {idx + 1}. {equipamento.nome}
                </h2>
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Tipo:</strong> {equipamento.tipo || "—"}
                </div>
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Marca:</strong> {equipamento.marca || "—"}
                </div>
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Modelo:</strong> {equipamento.modelo || "—"}
                </div>
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Capacidade:</strong> {equipamento.capacidade || "—"}
                </div>
                <div style={{ fontSize: "12px", margin: "4px 0" }}>
                  <strong>Local:</strong> {equipamento.local || "—"}
                </div>
                {equipamento.numeroSerie && (
                  <div style={{ fontSize: "12px", margin: "4px 0" }}>
                    <strong>Nº de série:</strong> {equipamento.numeroSerie}
                  </div>
                )}
                {(equipamento.ocupanteFixo ||
                  equipamento.ocupanteFlutuante ||
                  equipamento.areaClimatizada) && (
                  <div
                    style={{
                      marginTop: "10px",
                      paddingTop: "10px",
                      borderTop: "1px dashed #d97757",
                      fontSize: "12px",
                    }}
                  >
                    {equipamento.areaClimatizada && (
                      <div style={{ margin: "4px 0" }}>
                        <strong>Área climatizada:</strong> {equipamento.areaClimatizada} m²
                      </div>
                    )}
                    {(equipamento.ocupanteFixo || equipamento.ocupanteFlutuante) && (
                      <div style={{ margin: "4px 0" }}>
                        <strong>Ocupantes:</strong> {equipamento.ocupanteFixo || "0"} fixo(s)
                        {equipamento.ocupanteFlutuante
                          ? ` + ${equipamento.ocupanteFlutuante} flutuante(s)`
                          : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Última manutenção */}
              {ultimaOS ? (
                <div
                  style={{
                    marginBottom: "12px",
                    padding: "15px",
                    backgroundColor: "#f0fdf4",
                    borderLeft: "4px solid #16a34a",
                  }}
                >
                  <h3 style={{ fontSize: "13px", fontWeight: "bold", margin: "0 0 10px 0" }}>
                    ✓ ÚLTIMA MANUTENÇÃO
                    {totalExecucoes > 1 ? ` (${totalExecucoes} execuções no histórico)` : ""}
                  </h3>
                  <div style={{ fontSize: "12px", margin: "4px 0" }}>
                    <strong>Data/Hora:</strong> {formatarDataHora(ultimaOS.dataExecucao)}
                  </div>
                  <div style={{ fontSize: "12px", margin: "4px 0" }}>
                    <strong>Técnico:</strong> {ultimaOS.tecnicoNome || "—"}
                  </div>
                  <div style={{ fontSize: "12px", margin: "4px 0" }}>
                    <strong>Periodicidade:</strong> {periodicidade}
                  </div>
                  <div style={{ fontSize: "12px", margin: "4px 0" }}>
                    <strong>Próxima manutenção prevista:</strong> {formatarData(proximaData)} —{" "}
                    <span style={{ color: statusManutencao(diasRestantes).cor, fontWeight: "bold" }}>
                      {statusManutencao(diasRestantes).texto}
                    </span>
                  </div>
                  {Array.isArray(ultimaOS.itensChecklist) && ultimaOS.itensChecklist.length > 0 && (() => {
                    const feitos = ultimaOS.itensChecklist.filter(
                      (i) => i.feito || i.concluido || i.checked
                    );
                    return (
                      <div style={{ fontSize: "12px", margin: "8px 0 4px 0" }}>
                        <strong>
                          Serviços executados ({feitos.length}/{ultimaOS.itensChecklist.length} itens):
                        </strong>
                        <div style={{ marginTop: "4px", paddingLeft: "4px" }}>
                          {feitos.length > 0
                            ? feitos
                                .map((i) => i.descricao || i.nome || i.texto)
                                .filter(Boolean)
                                .join(" • ")
                            : "Nenhum item marcado como concluído."}
                        </div>
                      </div>
                    );
                  })()}
                  {ultimaOS.observacoes && (
                    <div style={{ fontSize: "12px", margin: "8px 0 0 0", whiteSpace: "pre-wrap" }}>
                      <strong>Observações:</strong> {ultimaOS.observacoes}
                    </div>
                  )}
                  <div style={{ fontSize: "11px", marginTop: "8px" }}>
                    <Link
                      to={`/relatorios/pmoc/${ultimaOS.id}`}
                      style={{ color: "#1e3a8a", textDecoration: "underline" }}
                    >
                      Ver relatório PMOC individual completo desta execução →
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginBottom: "12px",
                    padding: "15px",
                    backgroundColor: "#fffbeb",
                    borderLeft: "4px solid #f59e0b",
                    fontSize: "12px",
                  }}
                >
                  <strong>Nenhuma manutenção registrada ainda para este equipamento.</strong>
                  <div style={{ marginTop: "6px" }}>
                    Periodicidade configurada: <strong>{periodicidade}</strong> — agendar a
                    primeira manutenção o quanto antes.
                  </div>
                </div>
              )}
            </div>
          ))}

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
              <strong>{DADOS_RBS.empresa} • {DADOS_RBS.slogan}</strong>
            </p>
            <p style={{ margin: "4px 0" }}>
              CNPJ: {DADOS_RBS.cnpj} • Tel: {DADOS_RBS.telefoneFmt}
            </p>
            <p style={{ margin: "4px 0" }}>
              Responsável Técnico: {DADOS_RBS.responsavelTecnico} • {DADOS_RBS.registroTecnico}
            </p>
            <p style={{ margin: "4px 0" }}>
              Documento gerado automaticamente pelo Sistema PMOC RBS em{" "}
              {new Date().toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
