import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera, FileDown, Plus, Trash2, X } from "lucide-react";
import { db, storage } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { modulo } from "../../data/menu";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import { numeroFmt } from "../../lib/orcamentos";
import { MODELOS_MEDICAO, STATUS_LAUDO, TIPOS_LAUDO, proximoNumeroLaudo } from "../../lib/laudos";
import { lerColecao, paraInput } from "../../lib/modulos";
import { BOTAO, BOTAO_SEC, CAMPO, Cabecalho, Campo, Erro } from "../../components/ui";

const MOD = modulo("/laudos");
const VAZIO = {
  tipo: TIPOS_LAUDO[0], status: "Rascunho", clienteId: "", clienteNome: "", clienteEndereco: "", clienteTelefone: "",
  equipamentoId: "", equipamentoNome: "", dataVisita: paraInput(new Date()), tecnico: "", acompanhante: "",
  assunto: "", objetivo: "", situacao: "", medicoes: [], diagnostico: "", conclusao: "", recomendacoes: "",
  fotos: [], normas: "NBR 16401 • NBR 13971 • Lei 13.589/2018 (PMOC) • Portaria MS 3.523/98",
};

function Bloco({ titulo, children }) {
  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-rbs">{titulo}</h2>
      {children}
    </section>
  );
}

export default function FormLaudo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, isAdmin } = useAuth();
  const [form, setForm] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      const [c, e] = await Promise.all([lerColecao("clientes"), lerColecao("equipamentos")]);
      setClientes(c.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")));
      setEquipamentos(e);
      if (!id) {
        setForm({ ...VAZIO, tecnico: usuario?.perfil?.nome || usuario?.displayName || DADOS_RBS.responsavelTecnico });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "laudos", id));
        if (snap.exists()) setForm({ ...VAZIO, ...snap.data() });
        else setErro("Relatório não encontrado.");
      } catch (e2) {
        setErro("Não foi possível carregar: " + e2.message);
      }
    })();
  }, [id]);

  if (!form) return erro ? <Erro>{erro}</Erro> : <p className="p-4 text-sm text-slate-500">Carregando...</p>;

  function mudar(campo, valor) {
    setForm((f) => {
      const novo = { ...f, [campo]: valor };
      if (campo === "clienteId") {
        const c = clientes.find((x) => x.id === valor);
        novo.clienteNome = c?.nome || "";
        novo.clienteEndereco = [c?.edificio, c?.endereco].filter(Boolean).join(" — ");
        novo.clienteTelefone = c?.telefone || "";
        novo.equipamentoId = "";
        novo.equipamentoNome = "";
      }
      if (campo === "equipamentoId") {
        const e = equipamentos.find((x) => x.id === valor);
        novo.equipamentoNome = e ? [e.nome || e.tipo, e.marca, e.modelo, e.capacidade, e.local].filter(Boolean).join(" • ") : "";
      }
      return novo;
    });
  }

  const mudarMedicao = (i, campo, valor) => setForm((f) => ({ ...f, medicoes: f.medicoes.map((m, j) => (j === i ? { ...m, [campo]: valor } : m)) }));
  const addMedicao = (linhas) => setForm((f) => ({ ...f, medicoes: [...f.medicoes, ...linhas.map((l) => ({ valor: "", ...l }))] }));
  const delMedicao = (i) => setForm((f) => ({ ...f, medicoes: f.medicoes.filter((_, j) => j !== i) }));

  async function enviarFotos(arquivos) {
    if (!arquivos?.length) return;
    setEnviandoFoto(true);
    setErro("");
    try {
      const novas = [];
      for (const arq of arquivos) {
        const r = ref(storage, `laudos_fotos/${Date.now()}_${arq.name.replace(/[^\w.-]/g, "_")}`);
        await uploadBytes(r, arq);
        novas.push({ url: await getDownloadURL(r), legenda: "" });
      }
      setForm((f) => ({ ...f, fotos: [...f.fotos, ...novas] }));
    } catch (e) {
      setErro("Falha ao enviar foto: " + e.message);
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvar(irParaPdf) {
    if (!form.clienteNome) { setErro("Selecione o cliente."); return; }
    setSalvando(true);
    setErro("");
    try {
      let alvo = id;
      const dados = { ...form, atualizadoEm: serverTimestamp() };
      if (id) {
        await updateDoc(doc(db, "laudos", id), dados);
      } else {
        const numero = await proximoNumeroLaudo();
        const novo = await addDoc(collection(db, "laudos"), { ...dados, numero, criadoPor: usuario?.uid || "", criadoEm: serverTimestamp() });
        alvo = novo.id;
      }
      navigate(irParaPdf ? `/laudos/${alvo}/pdf` : `/laudos/${alvo}`, { replace: !id });
    } catch (e) {
      setErro("Não foi possível salvar. Confira se as regras do banco (laudos) foram publicadas. " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!window.confirm("Excluir este relatório técnico?")) return;
    try {
      await deleteDoc(doc(db, "laudos", id));
      navigate("/laudos");
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  const equipDoCliente = equipamentos.filter((e) => e.clienteId === form.clienteId);

  return (
    <div className="mx-auto max-w-4xl space-y-3 pb-24">
      <Cabecalho modulo={MOD} voltar="/laudos" titulo={id ? `Relatório #${numeroFmt(form.numero)}` : "Novo relatório técnico"} subtitulo={form.tipo}>
        {id && <Link to={`/laudos/${id}/pdf`} className={BOTAO_SEC}><FileDown size={16} /> Ver PDF</Link>}
      </Cabecalho>
      <Erro>{erro}</Erro>

      <Bloco titulo="1. Identificação">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Tipo de documento">
            <select className={CAMPO} value={form.tipo} onChange={(e) => mudar("tipo", e.target.value)}>{TIPOS_LAUDO.map((t) => <option key={t}>{t}</option>)}</select>
          </Campo>
          <Campo rotulo="Status">
            <select className={CAMPO} value={form.status} onChange={(e) => mudar("status", e.target.value)}>{STATUS_LAUDO.map((t) => <option key={t}>{t}</option>)}</select>
          </Campo>
          <Campo rotulo="Cliente *">
            <select className={CAMPO} value={form.clienteId} onChange={(e) => mudar("clienteId", e.target.value)}>
              <option value="">{form.clienteNome && !form.clienteId ? form.clienteNome : "Selecione..."}</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.edificio ? ` — ${c.edificio}` : ""}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Equipamento / sistema">
            <select className={CAMPO} value={form.equipamentoId} onChange={(e) => mudar("equipamentoId", e.target.value)}>
              <option value="">Geral / não cadastrado</option>
              {equipDoCliente.map((e) => <option key={e.id} value={e.id}>{[e.nome || e.tipo, e.local].filter(Boolean).join(" — ")}</option>)}
            </select>
          </Campo>
          {!form.equipamentoId && (
            <Campo rotulo="Descrição do equipamento / sistema" className="sm:col-span-2">
              <input className={CAMPO} placeholder="Ex.: Self-contained 15 TR, Carrier, casa de máquinas 2º andar" value={form.equipamentoNome} onChange={(e) => mudar("equipamentoNome", e.target.value)} />
            </Campo>
          )}
          <Campo rotulo="Data da visita"><input type="date" className={CAMPO} value={form.dataVisita} onChange={(e) => mudar("dataVisita", e.target.value)} /></Campo>
          <Campo rotulo="Técnico responsável"><input className={CAMPO} value={form.tecnico} onChange={(e) => mudar("tecnico", e.target.value)} /></Campo>
          <Campo rotulo="Acompanhado por (cliente)"><input className={CAMPO} value={form.acompanhante} onChange={(e) => mudar("acompanhante", e.target.value)} /></Campo>
          <Campo rotulo="Assunto"><input className={CAMPO} placeholder="Ex.: Equipamento desarmando por alta pressão" value={form.assunto} onChange={(e) => mudar("assunto", e.target.value)} /></Campo>
        </div>
      </Bloco>

      <Bloco titulo="2. Objetivo e situação encontrada">
        <Campo rotulo="Objetivo"><textarea rows={2} className={CAMPO} value={form.objetivo} onChange={(e) => mudar("objetivo", e.target.value)} placeholder="Ex.: Avaliar as condições de funcionamento do sistema de climatização..." /></Campo>
        <Campo rotulo="Situação encontrada / constatações"><textarea rows={4} className={CAMPO} value={form.situacao} onChange={(e) => mudar("situacao", e.target.value)} /></Campo>
      </Bloco>

      <Bloco titulo="3. Medições e testes">
        <div className="flex flex-wrap gap-1">
          {Object.entries(MODELOS_MEDICAO).map(([nome, linhas]) => (
            <button type="button" key={nome} onClick={() => addMedicao(linhas)} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-rbs hover:bg-blue-100">+ {nome}</button>
          ))}
          <button type="button" onClick={() => addMedicao([{ parametro: "", unidade: "", referencia: "" }])} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"><Plus size={12} className="inline" /> Linha</button>
        </div>
        {form.medicoes.length > 0 && (
          <div className="space-y-2">
            {form.medicoes.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] gap-1 rounded-xl border border-slate-200 p-2 sm:grid-cols-[2fr_1fr_80px_1fr_auto]">
                <input aria-label="Parâmetro" className={`${CAMPO} col-span-2 sm:col-span-1`} placeholder="Parâmetro" value={m.parametro} onChange={(e) => mudarMedicao(i, "parametro", e.target.value)} />
                <input aria-label="Valor medido" className={CAMPO} placeholder="Medido" value={m.valor} onChange={(e) => mudarMedicao(i, "valor", e.target.value)} />
                <input aria-label="Unidade" className={`${CAMPO} hidden sm:block`} placeholder="Un." value={m.unidade} onChange={(e) => mudarMedicao(i, "unidade", e.target.value)} />
                <input aria-label="Referência" className={`${CAMPO} hidden sm:block`} placeholder="Referência" value={m.referencia} onChange={(e) => mudarMedicao(i, "referencia", e.target.value)} />
                <button type="button" aria-label="Remover linha" onClick={() => delMedicao(i)} className="rounded-lg px-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Bloco>

      <Bloco titulo="4. Registro fotográfico">
        <label className={`${BOTAO_SEC} cursor-pointer ${enviandoFoto ? "opacity-50" : ""}`}>
          <Camera size={16} /> {enviandoFoto ? "Enviando..." : "Adicionar fotos"}
          <input type="file" accept="image/*" multiple capture="environment" className="hidden" disabled={enviandoFoto} onChange={(e) => enviarFotos([...e.target.files])} />
        </label>
        {form.fotos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {form.fotos.map((f, i) => (
              <div key={f.url} className="relative rounded-xl border border-slate-200 p-1">
                <img src={f.url} alt={f.legenda || `Foto ${i + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
                <button type="button" aria-label="Remover foto" onClick={() => setForm((x) => ({ ...x, fotos: x.fotos.filter((_, j) => j !== i) }))} className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-red-600 shadow"><X size={14} /></button>
                <input aria-label="Legenda" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs" placeholder="Legenda" value={f.legenda} onChange={(e) => setForm((x) => ({ ...x, fotos: x.fotos.map((p, j) => (j === i ? { ...p, legenda: e.target.value } : p)) }))} />
              </div>
            ))}
          </div>
        )}
      </Bloco>

      <Bloco titulo="5. Diagnóstico, conclusão e recomendações">
        <Campo rotulo="Diagnóstico / análise técnica"><textarea rows={3} className={CAMPO} value={form.diagnostico} onChange={(e) => mudar("diagnostico", e.target.value)} /></Campo>
        <Campo rotulo="Conclusão"><textarea rows={3} className={CAMPO} value={form.conclusao} onChange={(e) => mudar("conclusao", e.target.value)} /></Campo>
        <Campo rotulo="Recomendações (uma por linha)"><textarea rows={3} className={CAMPO} value={form.recomendacoes} onChange={(e) => mudar("recomendacoes", e.target.value)} placeholder={"Substituir capacitor de partida\nInstalar DPS no quadro da condensadora"} /></Campo>
        <Campo rotulo="Normas de referência"><input className={CAMPO} value={form.normas} onChange={(e) => mudar("normas", e.target.value)} /></Campo>
      </Bloco>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:bottom-0 md:left-64">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
          <button disabled={salvando} onClick={() => salvar(false)} className={BOTAO_SEC}>{salvando ? "Salvando..." : "Salvar"}</button>
          <button disabled={salvando} onClick={() => salvar(true)} className={BOTAO}><FileDown size={16} /> Salvar e gerar PDF</button>
          {id && isAdmin && <button onClick={excluir} className="ml-auto inline-flex items-center gap-1 rounded-xl px-3 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 size={16} /> Excluir</button>}
        </div>
      </div>
    </div>
  );
}
