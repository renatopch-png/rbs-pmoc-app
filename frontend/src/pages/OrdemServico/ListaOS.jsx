import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

export default function ListaOS() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aberta, setAberta] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

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

  async function apagarArquivoStorage(url) {
    if (!url) return;
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn("Não foi possível apagar arquivo do Storage:", url, e.message);
    }
  }

  async function excluirOS(os) {
    const confirmar = window.confirm(
      `Excluir a OS de "${os.equipamentoNome || "equipamento"}" (${formatarData(
        os.dataExecucao
      )})?\n\nEssa ação apaga também as fotos e a assinatura. Não pode ser desfeita.`
    );
    if (!confirmar) return;

    setExcluindo(os.id);
    try {
      const urls = [
        ...(Array.isArray(os.fotosAntes) ? os.fotosAntes : []),
        ...(Array.isArray(os.fotosDepois) ? os.fotosDepois : []),
        ...(Array.isArray(os.fotos) ? os.fotos : []),
        os.assinaturaClienteUrl,
      ].filter(Boolean);

      await Promise.all(urls.map(apagarArquivoStorage));
      await deleteDoc(doc(db, "ordens_servico", os.id));

      setOrdens((prev) => prev.filter((o) => o.id !== os.id));
      if (aberta === os.id) setAberta(null);
    } catch (e) {
      alert("Erro ao excluir: " + e.message);
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Ordens de serviço</h1>
      <p className="mb-6 text-sm text-gray-600">
        Histórico de manutenções executadas, com checklist, fotos e geração de PDF PMOC.
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
              <div className="flex w-full items-center justify-between gap-4 p-4">
                <button
                  onClick={() => setAberta(aberta === os.id ? null : os.id)}
                  className="flex flex-1 items-center justify-between gap-4 text-left"
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
                    {os.tipoAtendimento && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          os.tipoAtendimento === "Corretiva"
                            ? "bg-orange-50 text-orange-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
