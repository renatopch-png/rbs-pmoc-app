import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function Agendador() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [proximasManutencoes, setProximasManutencoes] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");

  const PERIODICIDADES = {
    Mensal: 30,
    Bimestral: 60,
    Trimestral: 90,
    Semestral: 180,
    Anual: 365,
  };

  useEffect(() => {
    (async () => {
      try {
        // Busca todos os equipamentos
        const snapEquip = await getDocs(collection(db, "equipamentos"));
        const equipamentos = snapEquip.docs.map((d) => ({ id: d.id, ...d.data() }));

        // O equipamento guarda só o clienteId: nome e telefone vêm do cadastro de clientes.
        const snapCli = await getDocs(collection(db, "clientes"));
        const clientes = new Map(snapCli.docs.map((d) => [d.id, d.data()]));

        // Busca todas as ordens de serviço
        const snapOS = await getDocs(collection(db, "ordens_servico"));
        const ordens = snapOS.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Calcula próximas manutenções
        const proximas = [];

        equipamentos.forEach((eq) => {
          // Encontra a última OS deste equipamento
          const ultimaOS = ordens
            .filter((os) => os.equipamentoId === eq.id)
            .sort((a, b) => {
              const da = a.dataExecucao?.toDate?.() || new Date(0);
              const db = b.dataExecucao?.toDate?.() || new Date(0);
              return db - da;
            })[0];

          if (ultimaOS) {
            const dataUltimaOS = ultimaOS.dataExecucao?.toDate?.() || new Date(ultimaOS.dataExecucao);
            const periodicidade = eq.periodicidade || "Mensal";
            const diasPeriodo = PERIODICIDADES[periodicidade] || 30;
            const proximaData = new Date(dataUltimaOS);
            proximaData.setDate(proximaData.getDate() + diasPeriodo);

            proximas.push({
              equipamentoId: eq.id,
              equipamentoNome: eq.nome || eq.tipo || "Equipamento sem nome",
              clienteId: eq.clienteId,
              clienteNome: clientes.get(eq.clienteId)?.nome || eq.clienteNome || "Sem cliente",
              clienteTelefone: clientes.get(eq.clienteId)?.telefone || "",
              local: eq.local || "",
              tipo: eq.tipo || "",
              periodicidade: periodicidade,
              ultimaManutencao: dataUltimaOS,
              proximaManutencao: proximaData,
              diasRestantes: Math.ceil((proximaData - new Date()) / (1000 * 60 * 60 * 24)),
              atrasada: proximaData < new Date(),
            });
          } else {
            // Equipamento nunca teve manutenção
            proximas.push({
              equipamentoId: eq.id,
              equipamentoNome: eq.nome || eq.tipo || "Equipamento sem nome",
              clienteId: eq.clienteId,
              clienteNome: clientes.get(eq.clienteId)?.nome || eq.clienteNome || "Sem cliente",
              clienteTelefone: clientes.get(eq.clienteId)?.telefone || "",
              local: eq.local || "",
              tipo: eq.tipo || "",
              periodicidade: eq.periodicidade || "Mensal",
              ultimaManutencao: null,
              proximaManutencao: new Date(),
              diasRestantes: 0,
              atrasada: true,
            });
          }
        });

        // Ordena por próxima manutenção (atrasadas primeiro)
        proximas.sort((a, b) => a.proximaManutencao - b.proximaManutencao);

        setProximasManutencoes(proximas);
        setAgendamentos(proximas);
      } catch (e) {
        setErro("Erro ao carregar agendamentos. " + e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  function chamar(agenda) {
    const destino = (agenda.clienteTelefone || "").replace(/\D/g, "");
    if (!destino) { alert(`O cliente ${agenda.clienteNome} não tem telefone cadastrado.`); return; }
    const numero = destino.startsWith("55") ? destino : `55${destino}`;
    const texto = `Olá! Aqui é da RBS Refrigeração e Elétrica. A manutenção ${agenda.periodicidade.toLowerCase()} do equipamento "${agenda.equipamentoNome}"${agenda.local ? ` (${agenda.local})` : ""} está prevista para ${formatarData(agenda.proximaManutencao)}. Podemos agendar a visita?`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, "_blank");
  }

  const clientesLista = [...new Map(proximasManutencoes.map((a) => [a.clienteId || a.clienteNome, a.clienteNome])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  const visiveis = proximasManutencoes.filter((a) => !filtroCliente || (a.clienteId || a.clienteNome) === filtroCliente);

  function formatarData(d) {
    if (!d) return "—";
    return d.toLocaleDateString("pt-BR");
  }

  function statusBadge(dias, atrasada) {
    if (atrasada) {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
          🚨 ATRASADA
        </span>
      );
    }
    if (dias <= 7) {
      return (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
          ⚠️ PRÓXIMA SEMANA
        </span>
      );
    }
    if (dias <= 30) {
      return (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
          📅 {dias} dias
        </span>
      );
    }
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
        ✓ {dias} dias
      </span>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Agendador de Manutenções</h1>
      <p className="mb-6 text-sm text-gray-600">
        Próximas manutenções planejadas por periodicidade de cada equipamento.
      </p>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando agendamentos...</p>
      ) : proximasManutencoes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
          Nenhum equipamento cadastrado.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Resumo */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="text-2xl font-bold text-red-900">
                {proximasManutencoes.filter((a) => a.atrasada).length}
              </div>
              <div className="text-sm text-red-700">Atrasadas</div>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="text-2xl font-bold text-yellow-900">
                {proximasManutencoes.filter((a) => !a.atrasada && a.diasRestantes <= 7).length}
              </div>
              <div className="text-sm text-yellow-700">Próxima semana</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-2xl font-bold text-blue-900">
                {proximasManutencoes.filter((a) => a.diasRestantes > 30).length}
              </div>
              <div className="text-sm text-blue-700">Programadas</div>
            </div>
          </div>

          {/* Filtro por cliente */}
          <select
            aria-label="Filtrar por cliente"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold"
          >
            <option value="">Todos os clientes ({proximasManutencoes.length} equipamentos)</option>
            {clientesLista.map(([id, nome]) => (
              <option key={id} value={id}>{nome} ({proximasManutencoes.filter((a) => (a.clienteId || a.clienteNome) === id).length})</option>
            ))}
          </select>

          {/* Lista de agendamentos */}
          <div className="mt-3 space-y-2">
            {visiveis.map((agenda) => (
              <div
                key={agenda.equipamentoId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">👤 {agenda.clienteNome}</p>
                  <h3 className="font-semibold text-gray-900">{agenda.equipamentoNome}</h3>
                  <p className="text-sm text-gray-600">
                    {[agenda.tipo, agenda.local, agenda.periodicidade].filter(Boolean).join(" • ")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Última: {formatarData(agenda.ultimaManutencao)} | Próxima:{" "}
                    <strong>{formatarData(agenda.proximaManutencao)}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(agenda.diasRestantes, agenda.atrasada)}
                  {agenda.atrasada && (
                    <button onClick={() => chamar(agenda)} title={`Chamar ${agenda.clienteNome} no WhatsApp`} className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900">
                      📞 Chamar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
