import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { lerColecao, proximaManutencaoEquipamento } from "../../lib/modulos";

export default function NotificacoesManuencao() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Busca todos os equipamentos
        const snapEquip = await getDocs(collection(db, "equipamentos"));
        const equipamentos = snapEquip.docs.map((d) => ({ id: d.id, ...d.data() }));
        // O equipamento guarda só o clienteId: o nome vem do cadastro de clientes.
        const snapCli = await getDocs(collection(db, "clientes"));
        const nomeCliente = new Map(snapCli.docs.map((d) => [d.id, d.data().nome]));

        // Busca todas as ordens de serviço
        const snapOS = await getDocs(collection(db, "ordens_servico"));
        const ordens = snapOS.docs.map((d) => ({ id: d.id, ...d.data() }));

        const preventivos = await lerColecao("preventivos");

        // Atrasado = próxima manutenção (contrato ou periodicidade) já passou.
        const equipamentosAtrasados = [];
        equipamentos.forEach((eq) => {
          const r = proximaManutencaoEquipamento(eq, ordens, preventivos);
          if (r.proxima && r.dias >= 0) return;
          equipamentosAtrasados.push({
            equipamentoId: eq.id,
            equipamentoNome: eq.nome || eq.tipo || "Equipamento",
            clienteId: eq.clienteId,
            clienteNome: nomeCliente.get(eq.clienteId) || "Sem cliente",
            diasAtrasada: r.proxima ? -r.dias : "Nunca",
            ultimaManutencao: r.ultima,
          });
        });

        // Ordena por dias atrasada (descendente)
        equipamentosAtrasados.sort((a, b) => {
          const diasA = typeof a.diasAtrasada === "number" ? a.diasAtrasada : 999;
          const diasB = typeof b.diasAtrasada === "number" ? b.diasAtrasada : 999;
          return diasB - diasA;
        });

        setAlertas(equipamentosAtrasados);
      } catch (e) {
        console.error("Erro ao carregar notificações:", e);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  if (carregando || alertas.length === 0) {
    return null; // Não mostra nada se não houver alertas
  }

  return (
    <div className="mb-6 space-y-2">
      <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-red-900">
          🚨 MANUTENÇÕES ATRASADAS ({alertas.length})
        </h2>
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.equipamentoId}
              className="flex items-center justify-between rounded-lg bg-white p-3 text-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{alerta.equipamentoNome}</p>
                <p className="text-xs text-gray-600">
                  {alerta.clienteNome} •{" "}
                  {alerta.diasAtrasada === "Nunca"
                    ? "Nunca mantido"
                    : `${alerta.diasAtrasada} dias atrasado`}
                </p>
              </div>
              <button
                onClick={() => navigate(`/ordens-servico/executar/${alerta.equipamentoId}`)}
                className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
              >
                🔧 Executar manutenção
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Banner compacto do painel: mesma regra da Agenda (contrato ou periodicidade).
export function NotificacoesBanner() {
  const [totalAtrasadas, setTotalAtrasadas] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [equipamentos, ordens, preventivos] = await Promise.all([
          lerColecao("equipamentos"), lerColecao("ordens_servico"), lerColecao("preventivos"),
        ]);
        setTotalAtrasadas(equipamentos.filter((eq) => {
          const r = proximaManutencaoEquipamento(eq, ordens, preventivos);
          return !r.proxima || r.dias < 0;
        }).length);
      } catch (e) {
        console.error("Erro ao contar notificações:", e);
      }
    })();
  }, []);

  if (totalAtrasadas === 0) {
    return null;
  }

  return (
    <Link to="/cronograma" className="mb-6 flex items-center gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 transition hover:bg-red-100">
      <span className="text-2xl">🚨</span>
      <div className="flex-1">
        <p className="font-bold text-red-900">
          {totalAtrasadas} equipamento{totalAtrasadas > 1 ? "s" : ""} com manutenção atrasada
        </p>
        <p className="text-sm text-red-700">Toque para ver na Agenda e chamar o cliente</p>
      </div>
      <span className="text-sm font-bold text-red-800">Ver →</span>
    </Link>
  );
}
