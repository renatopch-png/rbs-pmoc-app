import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function Relatorios() {
  const [ordens, setOrdens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Filtros
  const [filtros, setFiltros] = useState({
    clienteId: "",
    tecnico: "",
    dataInicio: "",
    dataFim: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const [snapOS, snapCli] = await Promise.all([
          getDocs(query(collection(db, "ordens_servico"), orderBy("dataExecucao", "desc"))),
          getDocs(query(collection(db, "clientes"), orderBy("nome"))),
        ]);
        setOrdens(snapOS.docs.map((d) => ({ id: d.id, ...d.data() })));
        setClientes(snapCli.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setErro("Erro ao carregar dados. " + e.message);
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

  function formatarDataHora(v) {
    if (!v) return "—";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleString("pt-BR");
  }

  // Aplicar filtros
  const ordensFiltradas = ordens.filter((os) => {
    if (filtros.clienteId && os.clienteId !== filtros.clienteId) return false;
    if (filtros.tecnico && !os.tecnicoNome?.toLowerCase().includes(filtros.tecnico.toLowerCase()))
      return false;

    if (filtros.dataInicio || filtros.dataFim) {
      const dataOS = os.dataExecucao?.toDate?.() || new Date(os.dataExecucao);
      if (filtros.dataInicio) {
        const dataIni = new Date(filtros.dataInicio);
        if (dataOS < dataIni) return false;
      }
      if (filtros.dataFim) {
        const dataFim = new Date(filtros.dataFim);
        dataFim.setHours(23, 59, 59);
        if (dataOS > dataFim) return false;
      }
    }
    return true;
  });

  // Estatísticas
  const totalOS = ordensFiltradas.length;
  const totalEquipamentos = new Set(ordensFiltradas.map((os) => os.equipamentoId)).size;
  const totalTecnicos = new Set(ordensFiltradas.map((os) => os.tecnicoNome)).size;
  const mediaFotos =
    totalOS > 0
      ? (
          ordensFiltradas.reduce((acc, os) => acc + (Array.isArray(os.fotos) ? os.fotos.length : 0), 0) /
          totalOS
        ).toFixed(1)
      : 0;

  const input =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Relatórios</h1>
      <p className="mb-6 text-sm text-gray-600">
        Análise de manutenções, técnicos e equipamentos.
      </p>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Filtros</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">
              Cliente
            </label>
            <select
              className={input}
              value={filtros.clienteId}
              onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}
            >
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.edificio ? `${c.nome} — ${c.edificio}` : c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">
              Técnico
            </label>
            <input
              type="text"
              className={input}
              placeholder="Ex.: João"
              value={filtros.tecnico}
              onChange={(e) => setFiltros({ ...filtros, tecnico: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">
              Data de início
            </label>
            <input
              type="date"
              className={input}
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">
              Data de fim
            </label>
            <input
              type="date"
              className={input}
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setFiltros({ clienteId: "", tecnico: "", dataInicio: "", dataFim: "" })}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <>
          {/* Cards de estatísticas */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-2xl font-bold text-blue-900">{totalOS}</div>
              <div className="text-sm text-gray-600">Ordens de serviço</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-2xl font-bold text-green-900">{totalEquipamentos}</div>
              <div className="text-sm text-gray-600">Equipamentos únicos</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-2xl font-bold text-purple-900">{totalTecnicos}</div>
              <div className="text-sm text-gray-600">Técnicos envolvidos</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-2xl font-bold text-orange-900">{mediaFotos}</div>
              <div className="text-sm text-gray-600">Fotos/OS (média)</div>
            </div>
          </div>

          {/* Tabela */}
          {ordensFiltradas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
              Nenhuma ordem de serviço encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Data/hora</th>
                    <th className="px-4 py-3">Equipamento</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Técnico</th>
                    <th className="px-4 py-3">Checklist</th>
                    <th className="px-4 py-3">Fotos</th>
                  </tr>
                </thead>
                <tbody>
                  {ordensFiltradas.map((os) => {
                    const checklist = os.itensChecklist || [];
                    const feitos = checklist.filter((i) => i.feito || i.concluido || i.checked).length;
                    const fotos = Array.isArray(os.fotos) ? os.fotos.length : 0;
                    return (
                      <tr key={os.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-900">
                          {formatarDataHora(os.dataExecucao)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {os.equipamentoNome || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {os.clienteNome || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {os.tecnicoNome || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                            {feitos}/{checklist.length}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {fotos > 0 ? (
                            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-800">
                              {fotos}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Exportar */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => {
                const csv = [
                  ["Data/hora", "Equipamento", "Cliente", "Técnico", "Checklist", "Fotos"].join(","),
                  ...ordensFiltradas.map((os) => {
                    const checklist = os.itensChecklist || [];
                    const feitos = checklist.filter((i) => i.feito || i.concluido || i.checked).length;
                    return [
                      formatarDataHora(os.dataExecucao),
                      os.equipamentoNome || "—",
                      os.clienteNome || "—",
                      os.tecnicoNome || "—",
                      `${feitos}/${checklist.length}`,
                      (Array.isArray(os.fotos) ? os.fotos.length : 0).toString(),
                    ].join(",");
                  }),
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `relatorio-${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
            >
              📥 Exportar CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
