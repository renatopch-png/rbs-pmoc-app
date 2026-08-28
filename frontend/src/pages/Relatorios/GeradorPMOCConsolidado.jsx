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

  function badge(cor) {
    return {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "10px",
      fontWeight: "bold",
      color: "#fff",
      backgroundColor: cor,
      whiteSpace: "nowrap",
    };
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
  const totalAtrasados = itens.filter(
    (it) => it.diasRestantes === null || it.diasRestantes < 0
  ).length;

  // Paleta usada em todo o relatório, alinhada ao padrão visual da RBS
  const AZUL = "#0B5394";
  const AZUL_ESCURO = "#1E40AF";
  const AZUL_CLARO = "#EFF6FF";
  const LARANJA = "#d97757";
  const CINZA_TEXTO = "#374151";
  const CINZA_MUTED = "#6b7280";
  const BORDA = "#e5e7eb";

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
          style={{
            fontFamily: "Arial, sans-serif",
            color: CINZA_TEXTO,
            lineHeight: "1.5",
            backgroundColor: "#fff",
          }}
        >
          {/* Faixa de cabeçalho institucional (padrão RBS) */}
          <div
            style={{
              backgroundColor: AZUL_CLARO,
              borderBottom: `3px solid ${AZUL}`,
              padding: "16px 24px",
            }}
          >
            <div style={{ fontSize: "19px", fontWeight: "bold", color: AZUL }}>
              RBS Refrigeração Elétrica
            </div>
            <div style={{ fontSize: "10.5px", color: CINZA_MUTED, marginTop: "2px" }}>
              Refrigeração Elétrica • Energia Solar • Engenharia Térmica &nbsp;|&nbsp; CNPJ:{" "}
              {DADOS_RBS.cnpj} &nbsp;|&nbsp; Rua Capitão Ferreira, nº 86 — Rio de Janeiro/RJ
            </div>
          </div>

          <div style={{ padding: "28px 24px 24px" }}>
            {/* Título do relatório */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: AZUL,
                  margin: "0 0 6px 0",
                  letterSpacing: "0.3px",
                }}
              >
                RELATÓRIO CONSOLIDADO PMOC
              </h1>
              <p style={{ fontSize: "11.5px", color: CINZA_MUTED, margin: 0 }}>
                Plano de Manutenção, Operação e Controle — todos os equipamentos do cliente
              </p>
            </div>

            {/* Dados do cliente */}
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                backgroundColor: "#fff",
                border: `1px solid ${BORDA}`,
                borderLeft: `4px solid ${AZUL}`,
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                  color: AZUL,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                🏢 Cliente
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                <div><strong>Empresa:</strong> {cliente.nome}</div>
                {cliente.edificio && <div><strong>Edifício:</strong> {cliente.edificio}</div>}
                {cliente.endereco && <div><strong>Endereço:</strong> {cliente.endereco}</div>}
                {cliente.contato && <div><strong>Contato:</strong> {cliente.contato}</div>}
                {cliente.telefone && <div><strong>Telefone:</strong> {cliente.telefone}</div>}
              </div>
            </div>

            {/* Resumo (3 indicadores) */}
            <div style={{ marginBottom: "26px", display: "flex", gap: "10px", fontSize: "12px" }}>
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#fff",
                  border: `1px solid ${BORDA}`,
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: "bold", color: AZUL }}>
                  {totalEquipamentos}
                </div>
                <div style={{ color: CINZA_MUTED }}>Equipamentos</div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#fff",
                  border: `1px solid ${BORDA}`,
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#16a34a" }}>
                  {totalComManutencao}
                </div>
                <div style={{ color: CINZA_MUTED }}>Com manutenção</div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: totalAtrasados > 0 ? "#fef2f2" : "#fff",
                  border: `1px solid ${totalAtrasados > 0 ? "#fecaca" : BORDA}`,
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: totalAtrasados > 0 ? "#dc2626" : "#16a34a",
                  }}
                >
                  {totalAtrasados}
                </div>
                <div style={{ color: CINZA_MUTED }}>Atrasados / nunca feitos</div>
              </div>
            </div>

            {/* Cronograma de Manutenções — visão geral ordenada por urgência */}
            {itens.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <h2
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0 0 10px 0",
                    color: AZUL,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  📅 Cronograma de Manutenções
                </h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "10.5px",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: AZUL_ESCURO }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#fff" }}>
                        Equipamento
                      </th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#fff" }}>
                        Periodicidade
                      </th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#fff" }}>
                        Última manutenção
                      </th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#fff" }}>
                        Próxima prevista
                      </th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#fff" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map(({ equipamento, ultimaOS, periodicidade, proximaData, diasRestantes }, idx) => {
                      const status = statusManutencao(diasRestantes);
                      return (
                        <tr
                          key={equipamento.id}
                          style={{ backgroundColor: idx % 2 === 0 ? "#fff" : AZUL_CLARO }}
                        >
                          <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDA}`, fontWeight: "600" }}>
                            {equipamento.nome}
                          </td>
                          <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDA}` }}>
                            {periodicidade}
                          </td>
                          <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDA}` }}>
                            {formatarData(ultimaOS?.dataExecucao)}
                          </td>
                          <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDA}` }}>
                            {formatarData(proximaData)}
                          </td>
                          <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDA}` }}>
                            <span style={badge(status.cor)}>{status.texto}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Um card por equipamento */}
            {itens.map(({ equipamento, ultimaOS, totalExecucoes, periodicidade, proximaData, diasRestantes }, idx) => {
              const status = statusManutencao(diasRestantes);
              return (
                <div
                  key={equipamento.id}
                  style={{
                    marginBottom: "18px",
                    border: `1px solid ${BORDA}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    pageBreakInside: "avoid",
                    breakInside: "avoid",
                    pageBreakBefore: idx === 0 ? "auto" : idx % 2 === 0 ? "always" : "auto",
                    breakBefore: idx === 0 ? "auto" : idx % 2 === 0 ? "page" : "auto",
                  }}
                >
                  {/* Cabeçalho do card: nome + status */}
                  <div
                    style={{
                      backgroundColor: AZUL_CLARO,
                      borderBottom: `1px solid ${BORDA}`,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <h2 style={{ fontSize: "13.5px", fontWeight: "bold", margin: 0, color: AZUL }}>
                      ⚙️ {idx + 1}. {equipamento.nome}
                    </h2>
                    <span style={badge(status.cor)}>{status.texto}</span>
                  </div>

                  <div style={{ padding: "14px" }}>
                    {/* Dados do equipamento em grade */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "8px 14px",
                        fontSize: "11px",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                          Tipo
                        </div>
                        <div style={{ fontWeight: "600" }}>{equipamento.tipo || "—"}</div>
                      </div>
                      <div>
                        <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                          Marca
                        </div>
                        <div style={{ fontWeight: "600" }}>{equipamento.marca || "—"}</div>
                      </div>
                      <div>
                        <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                          Modelo
                        </div>
                        <div style={{ fontWeight: "600" }}>{equipamento.modelo || "—"}</div>
                      </div>
                      <div>
                        <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                          Capacidade
                        </div>
                        <div style={{ fontWeight: "600" }}>{equipamento.capacidade || "—"}</div>
                      </div>
                      <div>
                        <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                          Local
                        </div>
                        <div style={{ fontWeight: "600" }}>{equipamento.local || "—"}</div>
                      </div>
                      {equipamento.numeroSerie && (
                        <div>
                          <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                            Nº de série
                          </div>
                          <div style={{ fontWeight: "600" }}>{equipamento.numeroSerie}</div>
                        </div>
                      )}
                      {(equipamento.ocupanteFixo || equipamento.ocupanteFlutuante) && (
                        <div>
                          <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                            Ocupantes
                          </div>
                          <div style={{ fontWeight: "600" }}>
                            {equipamento.ocupanteFixo || "0"} fixo(s)
                            {equipamento.ocupanteFlutuante ? ` + ${equipamento.ocupanteFlutuante} flut.` : ""}
                          </div>
                        </div>
                      )}
                      {equipamento.areaClimatizada && (
                        <div>
                          <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                            Área climatizada
                          </div>
                          <div style={{ fontWeight: "600" }}>{equipamento.areaClimatizada} m²</div>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: `1px dashed ${BORDA}`, paddingTop: "12px" }}>
                      {ultimaOS ? (
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px 14px",
                              fontSize: "11px",
                              marginBottom: "10px",
                            }}
                          >
                            <div>
                              <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                                Última manutenção
                              </div>
                              <div style={{ fontWeight: "600" }}>{formatarDataHora(ultimaOS.dataExecucao)}</div>
                            </div>
                            <div>
                              <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                                Técnico
                              </div>
                              <div style={{ fontWeight: "600" }}>{ultimaOS.tecnicoNome || "—"}</div>
                            </div>
                            <div>
                              <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                                Periodicidade
                              </div>
                              <div style={{ fontWeight: "600" }}>{periodicidade}</div>
                            </div>
                            <div>
                              <div style={{ color: CINZA_MUTED, fontSize: "9.5px", textTransform: "uppercase" }}>
                                Próxima prevista
                              </div>
                              <div style={{ fontWeight: "600" }}>{formatarData(proximaData)}</div>
                            </div>
                          </div>

                          {Array.isArray(ultimaOS.itensChecklist) && ultimaOS.itensChecklist.length > 0 && (() => {
                            const feitos = ultimaOS.itensChecklist.filter(
                              (i) => i.feito || i.concluido || i.checked
                            );
                            return (
                              <div
                                style={{
                                  fontSize: "10.5px",
                                  backgroundColor: "#f9fafb",
                                  border: `1px solid ${BORDA}`,
                                  borderRadius: "6px",
                                  padding: "8px 10px",
                                  marginBottom: ultimaOS.observacoes ? "10px" : 0,
                                }}
                              >
                                <strong style={{ color: CINZA_TEXTO }}>
                                  Serviços executados ({feitos.length}/{ultimaOS.itensChecklist.length}):
                                </strong>
                                <div style={{ marginTop: "4px", color: CINZA_MUTED }}>
                                  {feitos.length > 0
                                    ? feitos.map((i) => i.descricao || i.nome || i.texto).filter(Boolean).join(" • ")
                                    : "Nenhum item marcado como concluído."}
                                </div>
                              </div>
                            );
                          })()}

                          {ultimaOS.observacoes && (
                            <div style={{ fontSize: "10.5px", whiteSpace: "pre-wrap", color: CINZA_MUTED }}>
                              <strong style={{ color: CINZA_TEXTO }}>Observações:</strong> {ultimaOS.observacoes}
                            </div>
                          )}

                          <div style={{ fontSize: "10.5px", marginTop: "10px" }}>
                            <Link
                              to={`/relatorios/pmoc/${ultimaOS.id}`}
                              style={{ color: AZUL, fontWeight: "600", textDecoration: "none" }}
                            >
                              Ver relatório PMOC individual completo →
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: "11px", color: "#991b1b" }}>
                          <strong>Nenhuma manutenção registrada ainda para este equipamento.</strong>
                          <div style={{ marginTop: "4px", color: CINZA_MUTED }}>
                            Periodicidade configurada: <strong>{periodicidade}</strong> — agendar a primeira
                            manutenção o quanto antes.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Rodapé */}
            <div
              style={{
                marginTop: "26px",
                paddingTop: "16px",
                borderTop: `2px solid ${AZUL}`,
                textAlign: "center",
                fontSize: "9px",
                color: CINZA_MUTED,
              }}
            >
              <p style={{ margin: "3px 0" }}>
                <strong style={{ color: CINZA_TEXTO }}>{DADOS_RBS.empresa} • {DADOS_RBS.slogan}</strong>
              </p>
              <p style={{ margin: "3px 0" }}>
                CNPJ: {DADOS_RBS.cnpj} • Tel: {DADOS_RBS.telefoneFmt}
              </p>
              <p style={{ margin: "3px 0" }}>
                Responsável Técnico: {DADOS_RBS.responsavelTecnico} • {DADOS_RBS.registroTecnico}
              </p>
              <p style={{ margin: "3px 0" }}>
                Documento gerado automaticamente pelo Sistema PMOC RBS em {new Date().toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
