import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import QRCode from "qrcode.react";
import { TIPOS_EQUIPAMENTO } from "../../data/checklistsEquipamento";

const TIPOS = TIPOS_EQUIPAMENTO;

const CATEGORIAS_SISTEMA = [
  {
    valor: "Gás",
    label: "Gás",
    descricao: "Expansão direta",
    icone: (
      <path d="M12 2c-.3 2.6-1.7 4-3 5.4C7.4 9.1 6 10.9 6 13.5 6 17.6 8.7 21 12 21s6-3.4 6-7.5c0-1.9-.7-3.2-1.6-4.4-.2 1.6-1 2.6-1.9 2.6-1 0-1.5-.8-1.5-1.8 0-1.7 1-2.9 1-4.9 0-1.4-.7-2.5-2-3z" />
    ),
  },
  {
    valor: "Hidrônico",
    label: "Hidrônico",
    descricao: "Água gelada",
    icone: (
      <path d="M12 2s6 7.1 6 11.5a6 6 0 1 1-12 0C6 9.1 12 2 12 2z" />
    ),
  },
  {
    valor: "VRF",
    label: "VRF",
    descricao: "Fluxo de refrigerante variável",
    icone: (
      <path d="M12 2v20M12 2 9 5m3-3 3 3M12 22l-3-3m3 3 3-3M2 12h20M2 12l3-3M2 12l3 3M22 12l-3-3m3 3-3 3" />
    ),
  },
];

const VAZIO = {
  nome: "",
  categoriaSistema: "",
  tipo: "Split Hi-Wall",
  marca: "",
  modelo: "",
  capacidade: "",
  local: "",
  numeroSerie: "",
  clienteId: "",
  periodicidade: "Mensal",
  // Dados do ambiente exigidos pela Anvisa (RE-9) para cálculo de
  // renovação de ar — vistos nos relatórios PMOC de referência.
  ocupanteFixo: "",
  ocupanteFlutuante: "",
  areaClimatizada: "",
};

export default function ListaEquipamentos() {
  const navigate = useNavigate();
  const [equipamentos, setEquipamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [qrAberto, setQrAberto] = useState(null);
  const [linkCopiado, setLinkCopiado] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [snapEq, snapCli] = await Promise.all([
        getDocs(query(collection(db, "equipamentos"), orderBy("nome"))),
        getDocs(query(collection(db, "clientes"), orderBy("nome"))),
      ]);
      setEquipamentos(snapEq.docs.map((d) => ({ id: d.id, ...d.data() })));
      setClientes(snapCli.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setErro("Não foi possível carregar os equipamentos. " + e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function nomeCliente(clienteId) {
    const c = clientes.find((x) => x.id === clienteId);
    if (!c) return "Sem cliente";
    return c.edificio ? `${c.nome} — ${c.edificio}` : c.nome;
  }

  function abrirNovo() {
    setForm(VAZIO);
    setEditandoId(null);
    setMostrarForm(true);
  }

  function abrirEdicao(eq) {
    setForm({ ...VAZIO, ...eq });
    setEditandoId(eq.id);
    setMostrarForm(true);
  }

  function fechar() {
    setForm(VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
    setErro("");
  }

  function linkPublico(equipamentoId) {
    return `${window.location.origin}/eq/${equipamentoId}`;
  }

  function toggleQr(equipamentoId) {
    setQrAberto(qrAberto === equipamentoId ? null : equipamentoId);
  }

  async function copiarLink(equipamentoId) {
    try {
      await navigator.clipboard.writeText(linkPublico(equipamentoId));
      setLinkCopiado(equipamentoId);
      setTimeout(() => setLinkCopiado(null), 2000);
    } catch (e) {
      window.prompt("Copie o link:", linkPublico(equipamentoId));
    }
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro("Informe o nome ou identificação do equipamento.");
      return;
    }
    if (!form.clienteId) {
      setErro("Selecione o cliente a que este equipamento pertence.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const dados = {
        nome: form.nome.trim(),
        categoriaSistema: form.categoriaSistema,
        tipo: form.tipo,
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        capacidade: form.capacidade.trim(),
        local: form.local.trim(),
        numeroSerie: form.numeroSerie.trim(),
        clienteId: form.clienteId,
        periodicidade: form.periodicidade,
        ocupanteFixo: form.ocupanteFixo.trim(),
        ocupanteFlutuante: form.ocupanteFlutuante.trim(),
        areaClimatizada: form.areaClimatizada.trim(),
      };
      if (editandoId) {
        await updateDoc(doc(db, "equipamentos", editandoId), {
          ...dados,
          atualizadoEm: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "equipamentos"), {
          ...dados,
          criadoEm: serverTimestamp(),
        });
      }
      fechar();
      carregar();
    } catch (e) {
      setErro("Não foi possível salvar. " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(eq) {
    if (!window.confirm(`Excluir o equipamento "${eq.nome}"?`)) return;
    try {
      await deleteDoc(doc(db, "equipamentos", eq.id));
      carregar();
    } catch (e) {
      setErro("Não foi possível excluir. " + e.message);
    }
  }

  const lista = filtroCliente
    ? equipamentos.filter((e) => e.clienteId === filtroCliente)
    : equipamentos;

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
        <button
          onClick={abrirNovo}
          className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
        >
          + Novo equipamento
        </button>
      </div>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {mostrarForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editandoId ? "Editar equipamento" : "Novo equipamento"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Categoria do sistema</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIAS_SISTEMA.map((c) => {
                  const ativo = form.categoriaSistema === c.valor;
                  return (
                    <button
                      key={c.valor}
                      type="button"
                      onClick={() => setForm({ ...form, categoriaSistema: c.valor })}
                      className={
                        "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition " +
                        (ativo
                          ? "border-blue-700 bg-blue-50 text-blue-800"
                          : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50")
                      }
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        {c.icone}
                      </svg>
                      <span className="text-xs font-semibold">{c.label}</span>
                      <span className="text-[10px] leading-tight text-gray-400">
                        {c.descricao}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={label}>Cliente / edifício</label>
              <select
                className={input}
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.edificio ? `${c.nome} — ${c.edificio}` : c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Identificação do equipamento</label>
              <input
                className={input}
                placeholder="Ex.: Split Recepção 01"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Tipo</label>
              <select
                className={input}
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Marca</label>
              <input
                className={input}
                placeholder="Ex.: LG"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Modelo</label>
              <input
                className={input}
                placeholder="Ex.: Dual Inverter"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Capacidade</label>
              <input
                className={input}
                placeholder="Ex.: 12.000 BTUs"
                value={form.capacidade}
                onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Número de série</label>
              <input
                className={input}
                placeholder="Opcional"
                value={form.numeroSerie}
                onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Ambiente / setor</label>
              <input
                className={input}
                placeholder="Ex.: Recepção"
                value={form.local}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Periodicidade da manutenção</label>
              <select
                className={input}
                value={form.periodicidade}
                onChange={(e) => setForm({ ...form, periodicidade: e.target.value })}
              >
                <option>Mensal</option>
                <option>Bimestral</option>
                <option>Trimestral</option>
                <option>Semestral</option>
                <option>Anual</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={label}>
                Dados do ambiente (opcional — usados no cálculo de renovação de ar da Anvisa RE-9)
              </label>
            </div>

            <div>
              <label className={label}>Ocupantes fixos</label>
              <input
                className={input}
                type="number"
                min="0"
                placeholder="Ex.: 8"
                value={form.ocupanteFixo}
                onChange={(e) => setForm({ ...form, ocupanteFixo: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Ocupantes flutuantes</label>
              <input
                className={input}
                type="number"
                min="0"
                placeholder="Ex.: 2"
                value={form.ocupanteFlutuante}
                onChange={(e) => setForm({ ...form, ocupanteFlutuante: e.target.value })}
              />
            </div>

            <div>
              <label className={label}>Área climatizada (m²)</label>
              <input
                className={input}
                type="number"
                min="0"
                step="0.1"
                placeholder="Ex.: 32.5"
                value={form.areaClimatizada}
                onChange={(e) => setForm({ ...form, areaClimatizada: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={salvar}
              disabled={salvando}
              className="rounded-lg bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={fechar}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className={label}>Filtrar por cliente</label>
        <select
          className={input + " max-w-md"}
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        >
          <option value="">Todos os clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.edificio ? `${c.nome} — ${c.edificio}` : c.nome}
            </option>
          ))}
        </select>
      </div>

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-600">
            Nenhum equipamento cadastrado ainda.
          </p>
          <button
            onClick={abrirNovo}
            className="mt-3 text-sm font-semibold text-blue-800 hover:underline"
          >
            Cadastrar o primeiro equipamento
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((eq) => (
            <div
              key={eq.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap gap-1.5">
                {eq.categoriaSistema && (
                  <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                    {eq.categoriaSistema}
                  </span>
                )}
                <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
                  {eq.tipo}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{eq.nome}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {[eq.marca, eq.modelo, eq.capacidade].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {eq.local || "Sem ambiente definido"}
              </p>
              <p className="mt-1 text-xs text-gray-500">{nomeCliente(eq.clienteId)}</p>
              <p className="mt-1 text-xs text-gray-500">
                Manutenção {eq.periodicidade || "não definida"}
              </p>

              {qrAberto === eq.id && (
                <div className="mt-4 flex flex-col items-center rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <QRCode
                    value={linkPublico(eq.id)}
                    size={140}
                    level="H"
                    includeMargin={true}
                    fgColor="#1e3a8a"
                    bgColor="#ffffff"
                  />
                  <p className="mt-3 text-center text-xs text-gray-600">
                    Aponte a câmera para abrir a página pública deste equipamento
                  </p>
                  <button
                    onClick={() => copiarLink(eq.id)}
                    className="mt-2 text-xs font-semibold text-blue-800 hover:underline"
                  >
                    {linkCopiado === eq.id ? "Link copiado! ✓" : "🔗 Copiar link"}
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/ordens-servico/executar/${eq.id}`)}
                  className="rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900"
                >
                  Executar manutenção
                </button>
                <button
                  onClick={() => toggleQr(eq.id)}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                >
                  📱 {qrAberto === eq.id ? "Ocultar QR" : "QR Code"}
                </button>
                <button
                  onClick={() => abrirEdicao(eq)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluir(eq)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
