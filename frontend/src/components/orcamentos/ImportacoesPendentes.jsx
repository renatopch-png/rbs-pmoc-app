import { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { Download } from "lucide-react";
import { auth, db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { brl, calcularTotais, proximoNumero } from "../../lib/orcamentos";
import { IMPORTACOES_ORCAMENTOS } from "../../data/importacoesOrcamentos";

const normal = (s) => String(s || "").trim().toLowerCase();

// Usa o cliente já cadastrado com o mesmo nome; se não houver, cadastra.
async function clienteDaImportacao(c) {
  const snap = await getDocs(collection(db, "clientes"));
  const achado = snap.docs.find((d) => normal(d.data().nome) === normal(c.nome));
  if (achado) return { id: achado.id, ...achado.data() };
  const ref = await addDoc(collection(db, "clientes"), { ...c, criadoEm: serverTimestamp() });
  return { id: ref.id, ...c };
}

async function importar(imp) {
  const ref = doc(db, "orcamentos", imp.id);
  if ((await getDoc(ref)).exists()) return;
  const cliente = await clienteDaImportacao(imp.cliente);
  const o = imp.orcamento;
  const numero = await proximoNumero();
  await setDoc(ref, {
    ...o,
    ...calcularTotais(o.itens, o.desconto, o.frete),
    clienteId: cliente.id,
    clienteNome: cliente.nome || "",
    clienteEndereco: cliente.endereco || "",
    clienteTelefone: cliente.telefone || "",
    clienteContato: cliente.contato || "",
    clienteEdificio: cliente.edificio || "",
    qtdServicos: o.itens.length,
    equipamentoIds: [],
    numero,
    importadoDe: imp.id,
    aprovadoEm: serverTimestamp(),
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
    criadoPor: auth.currentUser?.uid || null,
  });
}

export default function ImportacoesPendentes({ aoImportar }) {
  const { isAdmin } = useAuth();
  const [pendentes, setPendentes] = useState([]);
  const [ocupado, setOcupado] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const faltam = [];
      for (const imp of IMPORTACOES_ORCAMENTOS) {
        try {
          if (!(await getDoc(doc(db, "orcamentos", imp.id))).exists()) faltam.push(imp);
        } catch { /* sem permissão de leitura: não mostra */ }
      }
      setPendentes(faltam);
    })();
  }, [isAdmin]);

  if (!isAdmin || pendentes.length === 0) return null;

  async function clicar(imp) {
    setOcupado(imp.id);
    setErro("");
    try {
      await importar(imp);
      setPendentes((p) => p.filter((x) => x.id !== imp.id));
      aoImportar?.();
    } catch (e) {
      setErro("Não foi possível importar: " + e.message);
    } finally {
      setOcupado("");
    }
  }

  return (
    <section className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
      <h2 className="text-sm font-bold text-emerald-900">Orçamentos aprovados para lançar</h2>
      {pendentes.map((imp) => {
        const { valorTotal } = calcularTotais(imp.orcamento.itens, imp.orcamento.desconto, imp.orcamento.frete);
        return (
          <div key={imp.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3">
            <div className="text-sm">
              <p className="font-semibold text-rbs-navy">{imp.cliente.nome} — {brl(valorTotal)}</p>
              <p className="text-xs text-slate-500">{imp.orcamento.escopo}</p>
            </div>
            <button type="button" disabled={!!ocupado} onClick={() => clicar(imp)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
              <Download size={16} /> {ocupado === imp.id ? "Lançando..." : "Lançar como aprovado"}
            </button>
          </div>
        );
      })}
      {erro && <p role="alert" className="text-sm font-semibold text-red-800">{erro}</p>}
    </section>
  );
}
