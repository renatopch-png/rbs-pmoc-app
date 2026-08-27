import { useState, useEffect, useRef } from "react";
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
  // Fotos separadas em "antes" e "depois" do serviço, em vez de uma única
  // lista de evidência — assim o relatório mostra a comparação, como nos
  // PDFs de referência.
  const [fotosAntes, setFotosAntes] = useState([]);
  const [fotosDepois, setFotosDepois] = useState([]);
  // Distingue manutenção preventiva (agendada, sem reclamação prévia) de
  // corretiva/chamado (o cliente relatou um problema e pediu atendimento).
  // Nos PDFs de referência esses dois tipos de registro aparecem separados
  // (PMOC/Preventiva vs. OS de chamado) — aqui usamos o mesmo formulário de
  // execução para os dois, mas guardamos os campos extras do chamado.
  const [tipoAtendimento, setTipoAtendimento] = useState("Preventiva");
  const [dataAbertura, setDataAbertura] = useState("");
  const [descricaoProblema, setDescricaoProblema] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Assinatura digital do cliente, capturada na tela (canvas), sem
  // depender de nenhuma biblioteca externa — só eventos de ponteiro.
  const canvasRef = useRef(null);
  const desenhandoRef = useRef(false);
  const [assinaturaVazia, setAssinaturaVazia] = useState(true);

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

  function handleFotosAntes(e) {
    setFotosAntes(Array.from(e.target.files));
  }

  function handleFotosDepois(e) {
    setFotosDepois(Array.from(e.target.files));
  }

  // --- Assinatura no canvas ---
  function posicaoNoCanvas(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function iniciarTraco(e) {
    desenhandoRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = posicaoNoCanvas(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function desenharTraco(e) {
    if (!desenhandoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = posicaoNoCanvas(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineTo(x, y);
    ctx.stroke();
    if (assinaturaVazia) setAssinaturaVazia(false);
  }

  function pararTraco() {
    desenhandoRef.current = false;
  }

  function limparAssinatura() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaVazia(true);
  }

  async function uploadFotos(lista, subpasta) {
    const urls = [];
    for (const foto of lista) {
      const caminho = `os_fotos/${subpasta}/${equipamentoId}/${Date.now()}_${foto.name}`;
      const storageRef = ref(storage, caminho);
      await uploadBytes(storageRef, foto);
      urls.push(await getDownloadURL(storageRef));
    }
    return urls;
  }

  async function salvar() {
    setSalvando(true);
    setErro("");
    try {
      const urlsFotosAntes = await uploadFotos(fotosAntes, "antes");
      const urlsFotosDepois = await uploadFotos(fotosDepois, "depois");

      // Assinatura do cliente: só envia se algo foi desenhado no canvas.
      let assinaturaClienteUrl = "";
      if (!assinaturaVazia) {
        const canvas = canvasRef.current;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob) {
          const caminho = `os_assinaturas/${equipamentoId}/${Date.now()}.png`;
          const storageRef = ref(storage, caminho);
          await uploadBytes(storageRef, blob);
          assinaturaClienteUrl = await getDownloadURL(storageRef);
        }
      }

      // Busca o nome do cliente (se o equipamento tiver um clienteId
      // vinculado) para gravar junto na OS — assim o relatório PMOC
      // não depende de o técnico digitar nada, e a lista de Relatórios
      // também consegue mostrar o cliente sem precisar de outra consulta.
      let clienteNome = "";
      if (equipamento?.clienteId) {
        try {
          const clienteSnap = await getDoc(doc(db, "clientes", equipamento.clienteId));
          if (clienteSnap.exists()) {
            clienteNome = clienteSnap.data()?.nome || "";
          }
        } catch (e) {
          console.error("Não foi possível buscar o cliente:", e);
        }
      }

      await addDoc(collection(db, "ordens_servico"), {
        equipamentoId,
        equipamentoNome: equipamento?.nome || "",
        // Dados do equipamento copiados no momento da execução, para que
        // o relatório PMOC (GeradorPMOC.jsx) e a lista de Relatórios
        // consigam exibi-los sem depender de o equipamento continuar
        // existindo/inalterado depois.
        tipo: equipamento?.tipo || "",
        marca: equipamento?.marca || "",
        modelo: equipamento?.modelo || "",
        capacidade: equipamento?.capacidade || "",
        local: equipamento?.local || "",
        numeroSerie: equipamento?.numeroSerie || "",
        clienteId: equipamento?.clienteId || null,
        clienteNome,
        // Dados do ambiente (ocupantes e área climatizada), usados no
        // relatório PMOC para o cálculo de renovação de ar (Anvisa RE-9).
        ocupanteFixo: equipamento?.ocupanteFixo || "",
        ocupanteFlutuante: equipamento?.ocupanteFlutuante || "",
        areaClimatizada: equipamento?.areaClimatizada || "",
        // Tipo de atendimento e dados do chamado (quando corretiva) — ver
        // comentário acima, junto ao estado tipoAtendimento.
        tipoAtendimento,
        dataAbertura: tipoAtendimento === "Corretiva" ? dataAbertura : "",
        descricaoProblema: tipoAtendimento === "Corretiva" ? descricaoProblema : "",
        itensChecklist: itens,
        observacoes,
        // Fotos antes/depois do serviço e assinatura digital do cliente.
        fotosAntes: urlsFotosAntes,
        fotosDepois: urlsFotosDepois,
        assinaturaClienteUrl,
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
        <h2 className="font-semibold mb-3">Tipo de atendimento</h2>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setTipoAtendimento("Preventiva")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tipoAtendimento === "Preventiva"
                ? "bg-rbs text-white"
                : "border border-gray-300 text-gray-700"
            }`}
          >
            🗓️ Preventiva (agendada)
          </button>
          <button
            type="button"
            onClick={() => setTipoAtendimento("Corretiva")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tipoAtendimento === "Corretiva"
                ? "bg-orange-700 text-white"
                : "border border-gray-300 text-gray-700"
            }`}
          >
            🛠️ Corretiva (chamado do cliente)
          </button>
        </div>

        {tipoAtendimento === "Corretiva" && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">
                Data em que o chamado foi aberto
              </label>
              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm"
                value={dataAbertura}
                onChange={(e) => setDataAbertura(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">
                Problema relatado pelo cliente
              </label>
              <textarea
                className="w-full border rounded-lg p-2 text-sm"
                rows={2}
                value={descricaoProblema}
                onChange={(e) => setDescricaoProblema(e.target.value)}
                placeholder="Ex.: Ar-condicionado não está gelando, cliente reportou ruído estranho..."
              />
            </div>
          </div>
        )}
      </div>

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
        <h2 className="font-semibold mb-3">Fotos — Antes do serviço</h2>
        <input type="file" accept="image/*" multiple capture="environment" onChange={handleFotosAntes} />
        {fotosAntes.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">{fotosAntes.length} foto(s) selecionada(s)</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold mb-3">Fotos — Depois do serviço</h2>
        <input type="file" accept="image/*" multiple capture="environment" onChange={handleFotosDepois} />
        {fotosDepois.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">{fotosDepois.length} foto(s) selecionada(s)</p>
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

      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Assinatura do cliente (opcional)</h2>
          <button
            type="button"
            onClick={limparAssinatura}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            Limpar
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Peça para o cliente assinar com o dedo ou mouse na área abaixo, confirmando o serviço executado.
        </p>
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          style={{
            width: "100%",
            height: "150px",
            touchAction: "none",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            background: "#fff",
          }}
          onPointerDown={iniciarTraco}
          onPointerMove={desenharTraco}
          onPointerUp={pararTraco}
          onPointerLeave={pararTraco}
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
