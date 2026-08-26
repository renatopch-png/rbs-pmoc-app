import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

const PERIODICIDADES = {
  Mensal: 30,
  Bimestral: 60,
  Trimestral: 90,
  Semestral: 180,
  Anual: 365,
};

export default function NotificacoesManuencao() {
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Busca todos os equipamentos
        const snapEquip = await getDocs(collection(db, "equipamentos"));
        const equipamentos = snapEquip.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Busca todas as ordens de serviço
        const snapOS = await getDocs(collection(db, "ordens_servico"));
        const ordens = snapOS.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Calcula equipamentos com manutenção atrasada
        const equipamentosAtrasados = [];

        equipamentos.forEach((eq) => {
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

            // Se passou da data, está atrasada
            if (proximaData < new Date()) {
              const diasAtrasada = Math.ceil((new Date() - proximaData) / (1000 * 60 * 60 * 24));
              equipamentosAtrasados.push({
                equipamentoId: eq.id,
                equipamentoNome: eq.nome,
                clienteId: eq.clienteId,
                clienteNome: eq.clienteNome || "—",
                diasAtrasada: diasAtrasada,
                ultimaManutencao: dataUltimaOS,
                telefone: eq.telefone,
              });
            }
          } else {
            // Nunca teve manutenção
            equipamentosAtrasados.push({
              equipamentoId: eq.id,
              equipamentoNome: eq.nome,
              clienteId: eq.clienteId,
              clienteNome: eq.clienteNome || "—",
              diasAtrasada: "Nunca",
              ultimaManutencao: null,
              telefone: eq.telefone,
            });
          }
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
              <button className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900">
                📞 Chamar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Exportar componente compacto para banner
export function NotificacoesBanner() {
  const [totalAtrasadas, setTotalAtrasadas] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const snapEquip = await getDocs(collection(db, "equipamentos"));
        const equipamentos = snapEquip.docs.map((d) => ({ id: d.id, ...d.data() }));

        const snapOS = await getDocs(collection(db, "ordens_servico"));
        const ordens = snapOS.docs.map((d) => ({ id: d.id, ...d.data() }));

        let contador = 0;

        equipamentos.forEach((eq) => {
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

            if (proximaData < new Date()) {
              contador++;
            }
          } else {
            contador++;
          }
        });

        setTotalAtrasadas(contador);
      } catch (e) {
        console.error("Erro ao contar notificações:", e);
      }
    })();
  }, []);

  if (totalAtrasadas === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3">
      <span className="text-2xl">🚨</span>
      <div className="flex-1">
        <p className="font-bold text-red-900">
          {totalAtrasadas} equipamento{totalAtrasadas > 1 ? "s" : ""} com manutenção atrasada
        </p>
        <p className="text-sm text-red-700">Clique em "Agendador" para ver detalhes e agendar</p>
      </div>
    </div>
  );
}
