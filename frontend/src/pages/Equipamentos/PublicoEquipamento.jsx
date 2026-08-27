import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import QRCode from "qrcode.react";

export default function PublicoEquipamento() {
  const { equipamentoId } = useParams();
  const [equipamento, setEquipamento] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const docEquip = await getDoc(doc(db, "equipamentos", equipamentoId));
        if (!docEquip.exists()) {
          setErro("Equipamento não encontrado.");
          setCarregando(false);
          return;
        }

        const dados = { id: docEquip.id, ...docEquip.data() };
        setEquipamento(dados);

        if (dados.clienteId) {
          const docCli = await getDoc(doc(db, "clientes", dados.clienteId));
          if (docCli.exists()) {
            setCliente(docCli.data());
          }
        }

        // Histórico de manutenções deste equipamento: sem orderBy no
        // Firestore (evita precisar de índice composto) — ordenamos por
        // data mais recente aqui mesmo, no navegador.
        const snapOS = await getDocs(
          query(collection(db, "ordens_servico"), where("equipamentoId", "==", equipamentoId))
        );
        const lista = snapOS.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const da = a.dataExecucao?.toMillis ? a.dataExecucao.toMillis() : 0;
            const db_ = b.dataExecucao?.toMillis ? b.dataExecucao.toMillis() : 0;
            return db_ - da;
          });
        setHistorico(lista);
      } catch (e) {
        setErro("Erro ao carregar dados. " + e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [equipamentoId]);

  function formatarData(v) {
    if (!v) return "—";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleDateString("pt-BR");
  }

  function abrirWhatsApp() {
    const url = window.location.href;
    const cliente_nome = cliente?.nome || equipamento?.nome || "equipamento";
    const equipamento_nome = equipamento?.nome || "Equipamento";
    const msg = encodeURIComponent(
      `Olá RBS! 👋\n\nGostaria de abrir um chamado de manutenção:\n\n🏢 Cliente: ${cliente_nome}\n⚙️ Equipamento: ${equipamento_nome}\n\nConsulta: ${url}`
    );
    window.open(`https://wa.me/55${getTelefone()}?text=${msg}`, "_blank");
  }

  function getTelefone() {
    return cliente?.telefone?.replace(/\D/g, "") || "5521987654321";
  }

  const urlQR = window.location.href;

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (erro || !equipamento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-semibold text-red-900">{erro || "Equipamento não encontrado"}</p>
          <p className="mt-2 text-sm text-red-700">
            Se acredita que é um erro, verifique o link ou entre em contato conosco.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{equipamento.nome}</h1>
              <p className="mt-2 text-sm text-gray-600">
                {equipamento.tipo || "Tipo não especificado"}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              ID: {equipamentoId.slice(0, 8)}
            </div>
          </div>

          {/* Dados principais */}
          <div className="space-y-3">
            {equipamento.marca && (
              <div className="flex gap-3">
                <span className="font-medium text-gray-700">Marca:</span>
                <span className="text-gray-600">{equipamento.marca}</span>
              </div>
            )}
            {equipamento.modelo && (
              <div className="flex gap-3">
                <span className="font-medium text-gray-700">Modelo:</span>
                <span className="text-gray-600">{equipamento.modelo}</span>
              </div>
            )}
            {equipamento.capacidade && (
              <div className="flex gap-3">
                <span className="font-medium text-gray-700">Capacidade:</span>
                <span className="text-gray-600">{equipamento.capacidade}</span>
              </div>
            )}
            {equipamento.numeroSerie && (
              <div className="flex gap-3">
                <span className="font-medium text-gray-700">Nº de série:</span>
                <span className="text-gray-600 font-mono">{equipamento.numeroSerie}</span>
              </div>
            )}
            {equipamento.local && (
              <div className="flex gap-3">
                <span className="font-medium text-gray-700">Localização:</span>
                <span className="text-gray-600">{equipamento.local}</span>
              </div>
            )}
            {equipamento.areaClimatizada && (
              <div className="flex gap-3">
                <span className="font-medium text-gray-700">Área climatizada:</span>
                <span className="text-gray-600">{equipamento.areaClimatizada} m²</span>
              </div>
            )}
            {(equipamento.ocupanteFixo || equipamento.ocupanteFlutuante) && (
              <div className="flex gap-3">
                <span className="font-medium text-gray-700">Ocupantes:</span>
                <span className="text-gray-600">
                  {equipamento.ocupanteFixo || "0"} fixo(s)
                  {equipamento.ocupanteFlutuante ? ` + ${equipamento.ocupanteFlutuante} flutuante(s)` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cliente */}
        {cliente && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Cliente</h2>
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-900">{cliente.nome}</p>
              {cliente.edificio && <p className="text-sm text-gray-600">📍 {cliente.edificio}</p>}
              {cliente.endereco && <p className="text-sm text-gray-600">📍 {cliente.endereco}</p>}
              {cliente.telefone && (
                <p className="text-sm text-gray-600">📞 {cliente.telefone}</p>
              )}
              {cliente.contato && <p className="text-sm text-gray-600">👤 {cliente.contato}</p>}
            </div>
          </div>
        )}

        {/* Histórico de Manutenções */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            📋 Histórico de Manutenções
          </h2>
          {historico.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhuma manutenção registrada ainda para este equipamento.
            </p>
          ) : (
            <div className="space-y-3">
              {historico.map((os) => {
                const total = Array.isArray(os.itensChecklist) ? os.itensChecklist.length : 0;
                const feitos = Array.isArray(os.itensChecklist)
                  ? os.itensChecklist.filter((it) => it.feito || it.concluido || it.checked).length
                  : 0;
                return (
                  <Link
                    key={os.id}
                    to={`/relatorio/${os.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatarData(os.dataExecucao)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Técnico: {os.tecnicoNome || "—"}
                        {total > 0 ? ` • ${feitos}/${total} itens concluídos` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-blue-800">
                      Ver relatório PMOC →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* QR Code + WhatsApp */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* QR Code */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-gray-600">
              QR Code
            </h2>
            <div className="flex justify-center">
              <QRCode
                value={urlQR}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#1e3a8a"
                bgColor="#f8fafc"
              />
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">
              Compartilhe este QR Code para consultar este equipamento
            </p>
          </div>

          {/* Botão WhatsApp */}
          <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
            <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-green-800">
              Chamar Manutenção
            </h2>
            <button
              onClick={abrirWhatsApp}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-green-600 hover:to-green-700"
            >
              <span className="text-2xl">💬</span>
              <span>Abrir chamado via WhatsApp</span>
            </button>
            <p className="mt-4 text-center text-xs text-gray-600">
              Clique para falar com a RBS sobre manutenção deste equipamento
            </p>
          </div>
        </div>

        {/* Footer com dados da empresa (nome, CNPJ, telefone) */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-500">
            <strong>{DADOS_RBS.empresa}</strong> • {DADOS_RBS.slogan}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            CNPJ: {DADOS_RBS.cnpj} &nbsp;•&nbsp; 📞 {DADOS_RBS.telefoneFmt}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Consultado em {new Date().toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}
