import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { NotificacoesBanner } from "../components/layout/NotificacoesManuencao";

export default function Dashboard() {
  const [stats, setStats] = useState({
    clientes: 0,
    equipamentos: 0,
    ordensServico: 0,
    ultimasManutencoes: [],
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Busca clientes
        const snapCli = await getDocs(collection(db, "clientes"));
        const clientes = snapCli.docs.length;

        // Busca equipamentos
        const snapEquip = await getDocs(collection(db, "equipamentos"));
        const equipamentos = snapEquip.docs.length;

        // Busca ordens de serviço
        const snapOS = await getDocs(collection(db, "ordens_servico"));
        const ordensServico = snapOS.docs.length;

        // Últimas manutenções
        const ordens = snapOS.docs.map((d) => ({ id: d.id, ...d.data() }));
        ordens.sort((a, b) => {
          const da = a.dataExecucao?.toDate?.() || new Date(0);
          const dbb = b.dataExecucao?.toDate?.() || new Date(0);
          return dbb - da;
        });

        const ultimasManutencoes = ordens.slice(0, 5).map((os) => ({
          equipamento: os.equipamentoNome,
          tecnico: os.tecnicoNome,
          data: os.dataExecucao,
        }));

        setStats({
          clientes,
          equipamentos,
          ordensServico,
          ultimasManutencoes,
        });
      } catch (e) {
        console.error("Erro ao carregar dashboard:", e);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  function formatarData(v) {
    if (!v) return "—";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleString("pt-BR");
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-3xl font-bold text-gray-900">Painel</h1>
      <p className="mb-6 text-gray-600">
        RBS Refrigeração Elétrica • Energia Solar • Engenharia Térmica
      </p>

      <NotificacoesBanner />

      {/* Estatísticas */}
      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-blue-900">{stats.clientes}</div>
              <div className="text-sm text-gray-600">Clientes e edifícios</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-purple-900">{stats.equipamentos}</div>
              <div className="text-sm text-gray-600">Equipamentos cadastrados</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-900">{stats.ordensServico}</div>
              <div className="text-sm text-gray-600">Ordens de serviço</div>
            </div>
          </div>

          {/* Últimas manutenções */}
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-gray-900">Últimas manutenções</h2>
            {stats.ultimasManutencoes.length > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Equipamento</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Técnico</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.ultimasManutencoes.map((m, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-6 py-3 text-gray-900">{m.equipamento}</td>
                        <td className="px-6 py-3 text-gray-600">{m.tecnico}</td>
                        <td className="px-6 py-3 text-gray-500">{formatarData(m.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                Nenhuma manutenção registrada ainda.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
