import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage, auth } from "../../services/firebase";
import {
  doc, getDoc, addDoc, collection, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getChecklistPorTipo } from "../../data/checklistsEquipamento";

export default function ExecucaoOS() {
  const { equipamentoId } = useParams();
  const navigate = useNavigate();
  const [equipamento, setEquipamento] = useState(null);
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!equipamentoId) return;
      setCarregando(true);
      const snap = await getDoc(doc(db, "equipamentos", equipamentoId));
      if (snap.exists()) {
        const dados = { id: snap.id, ...snap.data() };
        setEquipamento(dados);
        // Monta o checklist certo para o tipo deste equipamento (Split,
        // Chiller, Câmara Fria, Torre de Resfriamento etc. têm rotinas
        // diferentes, com periodicidade própria).
        const checklist = getChecklistPorTipo(dados.tipo);
        setItens(checklist.map((item) => ({ ...item, feito: false })));
      }
      setCarregando(false);
    }
    carregar();
  }, [equipamentoId]);

  function toggleItem(index) {
    setItens((prev) =>
      prev.map((it, i) => (i === index ? { ...it, feito: !it.feito } : it))
    );
  }

  function handleFotos(e) {
    setFotos(Array.from(e.target.files));
  }

  async function salvar() {
    setSalvando(true);
    setErro("");
    try {
      const urlsFotos = [];
      for (const foto of fotos) {
        const caminho = `os_fotos/${equipamentoId}/${Date.now()}_${foto.name}`;
        const storageRef = ref(storage, caminho);
        await uploadBytes(storageRef, foto);
        const url = await getDownloadURL(storageRef);
        urlsFotos.push(url);
      }

      await addDoc(collection(db, "ordens_servico"), {
        equipamentoId,
        equipamentoNome: equipamento?.nome || "",
        itensChecklist: itens,
        observacoes,
        fotos: urlsFotos,
        tecnicoUid: auth.currentUser?.uid || null,
        tecnicoNome: auth.currentUser?.displayName || "",
        dataExecucao: serverTimestamp(),
      });

      navigate("/ordens-servico");
    } catch (e) {
      console.error(e);
      setErro("Não foi possível salvar. Verifique sua conexão e tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const feitos = itens.filter((it) => it.feito).length;

  const corPeriodo = {
    Mensal: "bg-blue-50 text-blue-800",
    Trimestral: "bg-purple-50 text-purple-800",
    Semestral: "bg-orange-50 text-orange-800",
    Anual: "bg-red-50 text-red-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-rbs mb-1">Execução de Manutenção</h1>
      {equipamento && (
        <p className="text-sm text-gray-500 mb-4">
          {equipamento.nome} — {equipamento.tipo || ""} {equipamento.local ? `— ${equipamento.local}` : ""}
        </p>
      )}

      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Checklist</h2>
          {!carregando && itens.length > 0 && (
            <span className="text-xs font-semibold text-gray-500">
              {feitos}/{itens.length} concluídos
            </span>
          )}
        </div>

        {carregando ? (
          <p className="text-sm text-gray-500">Carregando checklist...</p>
        ) : itens.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum checklist cadastrado para este tipo de equipamento.
          </p>
        ) : (
          <div className="space-y-2">
            {itens.map((item, i) => (
              <label
                key={i}
                className="flex items-start gap-3 text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0"
              >
                <input
                  type="checkbox"
                  checked={item.feito}
                  onChange={() => toggleItem(i)}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="flex-1">{item.descricao}</span>
                {item.periodo && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      corPeriodo[item.periodo] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.periodo}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold mb-3">Fotos de evidência</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleFotos}
        />
        {fotos.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">{fotos.length} foto(s) selecionada(s)</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold mb-3">Observações</h2>
        <textarea
          className="w-full border rounded-lg p-2 text-sm"
          rows={3}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Alguma observação sobre o equipamento ou serviço executado..."
        />
      </div>

      {erro && <p className="text-red-600 text-sm mb-3">{erro}</p>}

      <button
        onClick={salvar}
        disabled={salvando || carregando}
        className="bg-rbs text-white rounded-lg px-5 py-2 font-semibold disabled:opacity-50"
      >
        {salvando ? "Salvando..." : "Concluir e salvar OS"}
      </button>
    </div>
  );
}
