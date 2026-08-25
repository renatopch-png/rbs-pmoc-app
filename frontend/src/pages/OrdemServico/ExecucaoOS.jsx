import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage, auth } from "../../services/firebase";
import {
  doc, getDoc, addDoc, collection, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CHECKLIST_PADRAO = [
  "Limpeza do filtro de ar",
  "Verificação de vazamento de gás",
  "Limpeza da bandeja de condensado",
  "Verificação da temperatura de insuflamento",
  "Limpeza da serpentina (evaporadora)",
  "Verificação de ruídos/vibrações anormais",
  "Aperto de conexões elétricas",
  "Registro fotográfico geral",
];

export default function ExecucaoOS() {
  const { equipamentoId } = useParams();
  const navigate = useNavigate();
  const [equipamento, setEquipamento] = useState(null);
  const [itens, setItens] = useState(
    CHECKLIST_PADRAO.map((descricao) => ({ descricao, feito: false }))
  );
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!equipamentoId) return;
      const snap = await getDoc(doc(db, "equipamentos", equipamentoId));
      if (snap.exists()) setEquipamento({ id: snap.id, ...snap.data() });
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-rbs mb-1">Execução de Manutenção</h1>
      {equipamento && (
        <p className="text-sm text-gray-500 mb-4">
          {equipamento.nome} — {equipamento.local || ""}
        </p>
      )}

      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold mb-3">Checklist</h2>
        <div className="space-y-2">
          {itens.map((item, i) => (
            <label key={i} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={item.feito}
                onChange={() => toggleItem(i)}
                className="h-4 w-4"
              />
              {item.descricao}
            </label>
          ))}
        </div>
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
        disabled={salvando}
        className="bg-rbs text-white rounded-lg px-5 py-2 font-semibold disabled:opacity-50"
      >
        {salvando ? "Salvando..." : "Concluir e salvar OS"}
      </button>
    </div>
  );
}
