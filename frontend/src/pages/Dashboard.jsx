import { useAuth } from "../context/AuthContext";

const cards = [
  { titulo: "Equipamentos ativos", valor: "—" },
  { titulo: "Manutenções no mês", valor: "—" },
  { titulo: "OS em atraso", valor: "—" },
  { titulo: "Clientes atendidos", valor: "—" },
];

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-rbs mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">
        Bem-vindo, {usuario?.displayName || usuario?.email}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.titulo} className="bg-white rounded-xl shadow p-5 border-t-4 border-rbs">
            <p className="text-sm text-gray-500">{c.titulo}</p>
            <p className="text-3xl font-bold text-rbs-dark mt-1">{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow p-5">
        <p className="text-sm text-gray-500">
          Os indicadores acima serão conectados aos dados reais do Firestore
          na próxima etapa (contagem de equipamentos, OS por status e
          vencimentos do plano de atividades).
        </p>
      </div>
    </div>
  );
}
