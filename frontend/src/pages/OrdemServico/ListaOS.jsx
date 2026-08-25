import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function ListaOS() {
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aberta, setAberta] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "ordens_servico"));
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => {
          const da = a.dataExecucao?.toDate?.() || new Date(0);
          const dbb = b.dataExecucao?.toDate?.() || new Date(0);
          return dbb - da;
        });
        setOrdens(lista);
      } catch (e) {
        setErro("Não foi possível carregar as ordens de serviço. " + e.message);
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

  function resumoChecklist(itens) {
    if (!Array.isArray(itens) || itens.length === 0) return "—";
    const feitos = itens.filter((i) => i.feito || i.concluido || i.checked).length;
    return `${feitos} de ${itens.length} itens`;
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Ordens de serviço</h1>
      <p className="mb-6 text-sm text-gray-600">
        Histórico de manutenções executadas, com checklist e evidência fotográfica.
      </p>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : ordens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
          Nenhuma ordem de serviço registrada. Vá em Equipamentos e clique em
          "Executar manutenção" para criar a primeira.
        </div>
      ) : (
        <div className="space-y-3">
          {ordens.map((os) => (
            <div
              key={os.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setAberta(aberta === os.id ? null : os.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {os.equipamentoNome || "Equipamento sem nome"}
                  </div>
                  <div className="mt-0.5 text-sm text-gray-600">
                    {formatarData(os.dataExecucao)} · {os.tecnicoNome || "técnico não identificado"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    {resumoChecklist(os.itensChecklist)}
                  </span>
                  <span className="text-gray-400">{aberta === os.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {aberta === os.id && (
                <div className="border-t border-gray-100 p-4">
                  {Array.isArray(os.itensChecklist) && os.itensChecklist.length > 0 && (
                    <div className="mb-4">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Checklist
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {os.itensChecklist.map((item, i) => {
                          const feito = item.feito || item.concluido || item.checked;
                          return (
                            <li key={i} className="flex items-start gap-2">
                              <span className={feito ? "text-green-600" : "text-gray-300"}>
                                {feito ? "✓" : "○"}
                              </span>
                              <span className={feito ? "text-gray-800" : "text-gray-400"}>
                                {item.descricao || item.nome || item.texto || `Item ${i + 1}`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {os.observacoes && (
                    <div className="mb-4">
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Observações
                      </h3>
                      <p className="text-sm text-gray-700">{os.observacoes}</p>
                    </div>
                  )}

                  {Array.isArray(os.fotos) && os.fotos.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Fotos ({os.fotos.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {os.fotos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={`Foto ${i + 1}`}
                              className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
