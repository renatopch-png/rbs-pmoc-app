import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { brl } from "../../lib/orcamentos";
import { CORES_SERVICO } from "../../lib/equipe";
import { meusServicos, mudarStatusTecnico } from "../../services/equipeService";

export default function MeusServicos() {
  const { usuario } = useAuth();
  const funcionarioId = usuario?.perfil?.funcionarioId;
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    if (!funcionarioId) { setCarregando(false); return; }
    try {
      setLista(await meusServicos(funcionarioId));
    } catch (e) {
      setErro("Não foi possível carregar seus serviços.");
    } finally {
      setCarregando(false);
    }
  }, [funcionarioId]);
  useEffect(() => { recarregar(); }, [recarregar]);

  async function mudar(s, status) {
    try { await mudarStatusTecnico(s.id, status); await recarregar(); } catch (e) { setErro("Não foi possível atualizar: " + e.message); }
  }

  if (!funcionarioId) return <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm">Seu acesso ainda não está vinculado a um funcionário.</div>;
  const abertos = lista.filter((s) => s.status === "Pendente" || s.status === "Em andamento");

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-extrabold text-rbs-navy">Meus Serviços</h1>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : abertos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhum serviço pendente.</p>
      ) : abertos.map((s) => (
        <div key={s.id} className="rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-bold text-rbs-navy">{s.titulo}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${CORES_SERVICO[s.status]}`}>{s.status}</span>
          </div>
          <p className="text-xs text-slate-500">{s.data.split("-").reverse().join("/")} às {s.hora}{s.clienteNome ? ` • ${s.clienteNome}` : ""} • comissão {brl(s.comissaoValor)}</p>
          {s.descricao && <p className="mt-1 text-sm text-slate-700">{s.descricao}</p>}
          <div className="mt-2 flex gap-2">
            {s.status === "Pendente" && <button onClick={() => mudar(s, "Em andamento")} className="rounded-lg border border-rbs px-3 py-1.5 text-sm font-semibold text-rbs">Iniciar</button>}
            <button onClick={() => mudar(s, "Concluído")} className="rounded-lg bg-rbs px-3 py-1.5 text-sm font-semibold text-white">Concluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
