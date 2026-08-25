import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  updateDoc, orderBy, query, serverTimestamp,
} from "firebase/firestore";

export default function ListaClientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    nome: "", edificio: "", endereco: "", contato: "", telefone: "",
  });

  async function carregar() {
    setCarregando(true);
    const q = query(collection(db, "clientes"), orderBy("nome"));
    const snap = await getDocs(q);
    setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm({ nome: "", edificio: "", endereco: "", contato: "", telefone: "" });
    setEditandoId(null);
    setMostrarForm(true);
  }

  function abrirEdicao(cliente) {
    setForm({
      nome: cliente.nome || "",
      edificio: cliente.edificio || "",
      endereco: cliente.endereco || "",
      contato: cliente.contato || "",
      telefone: cliente.telefone || "",
    });
    setEditandoId(cliente.id);
    setMostrarForm(true);
  }

  async function salvar() {
    if (!form.nome.trim()) return;
    if (editandoId) {
      await updateDoc(doc(db, "clientes", editandoId), form);
    } else {
      await addDoc(collection(db, "clientes"), {
        ...form,
        criadoEm: serverTimestamp(),
      });
    }
    setMostrarForm(false);
    carregar();
  }

  async function excluir(id) {
    if (!confirm("Excluir este cliente?")) return;
    await deleteDoc(doc(db, "clientes", id));
    carregar();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-rbs">Clientes e Edifícios</h1>
        <button
          onClick={abrirNovo}
          className="bg-rbs text-white rounded-lg px-4 py-2 text-sm font-semibold"
        >
          + Novo Cliente
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-4 space-y-3">
          <input
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Nome do cliente / empresa"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Edifício / ambiente"
            value={form.edificio}
            onChange={(e) => setForm({ ...form, edificio: e.target.value })}
          />
          <input
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Endereço"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="Contato (nome)"
              value={form.contato}
              onChange={(e) => setForm({ ...form, contato: e.target.value })}
            />
            <input
              className="border rounded-lg p-2 text-sm"
              placeholder="Telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={salvar}
              className="bg-rbs text-white rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Salvar
            </button>
            <button
              onClick={() => setMostrarForm(false)}
              className="border rounded-lg px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow">
        {carregando && <p className="p-5 text-sm text-gray-500">Carregando...</p>}
        {!carregando && clientes.length === 0 && (
          <p className="p-5 text-sm text-gray-500">Nenhum cliente cadastrado ainda.</p>
        )}
        {clientes.map((c) => (
          <div key={c.id} className="p-4 border-b last:border-0 flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{c.nome}</p>
              <p className="text-xs text-gray-500">
                {c.edificio} {c.endereco && `— ${c.endereco}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => abrirEdicao(c)}
                className="text-xs text-rbs font-semibold"
              >
                Editar
              </button>
              <button
                onClick={() => excluir(c.id)}
                className="text-xs text-red-600 font-semibold"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
