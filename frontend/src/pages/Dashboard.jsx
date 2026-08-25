import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebase";

function Card({ valor, rotulo, para }) {
  const conteudo = (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300">
      <div className="text-3xl font-bold text-blue-900">{valor}</div>
      <div className="mt-1 text-sm text-gray-600">{rotulo}</div>
    </div>
  );
  return para ? <Link to={para}>{conteudo}</Link> : conteudo;
}

export default function Dashboard() {
  const [dados, setDados] = useState({
    clientes: 0,
    equipamentos: 0,
    ordens: 0,
  });
  const [ultimasOS, setUltimasOS] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cli, eq, os] = await Promise.all([
          getDocs(collection(db, "clientes")),
          getDocs(collection(db, "equipamentos")),
          getDocs(collection(db, "ordens_servico")),
        ]);
        setDados({
          clientes: cli.size,
          equipamentos: eq.size,
          ordens: os.size,
        });

        try {
          const recentes = await getDocs(
            query(
              collection(db, "ordens_servico"),
              orderBy("dataExecucao", "desc"),
              limit(5)
            )
          );
          setUltimasOS(recentes.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch {
          setUltimasOS(os.docs.slice(0, 5).map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        setErro("Não foi possível carregar os dados. " + e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  function formatarData(v) {
    if (!v) return "—";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleDateString("pt-BR");
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Painel</h1>
      <p className="mb-6 text-sm text-gray-600">
        RBS Refrigeração Elétrica · Energia Solar · Engenharia Térmica
      </p>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card valor={dados.clientes} rotulo="Clientes e edifícios" para="/clientes" />
            <Card valor={dados.equipamentos} rotulo="Equipamentos cadastrados" para="/equipamentos" />
            <Card valor={dados.ordens} rotulo="Ordens de serviço" para="/ordens-servico" />
          </div>

          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Últimas manutenções
          </h2>

          {ultimasOS.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
              Nenhuma manutenção registrada ainda. Cadastre um equipamento e execute
              a primeira ordem de serviço.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Equipamento</th>
                    <th className="px-4 py-3">Técnico</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasOS.map((os) => (
                    <tr key={os.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {os.equipamentoNome || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {os.tecnicoNome || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatarData(os.dataExecucao)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
