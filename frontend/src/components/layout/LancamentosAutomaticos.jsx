import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CheckCircle2, X } from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { numeroFmt } from "../../lib/orcamentos";
import { lancar } from "../../pages/Importar/Importar";
import { LANCAMENTOS_CLAUDE } from "../../data/lancamentosClaude";

let jaRodou = false; // uma vez por abertura do app

// Grava no banco os lançamentos preparados pelo Claude que ainda não entraram.
export default function LancamentosAutomaticos() {
  const { isAdmin } = useAuth();
  const [feitos, setFeitos] = useState([]);

  useEffect(() => {
    if (!isAdmin || jaRodou) return;
    jaRodou = true;
    (async () => {
      const novos = [];
      for (const p of LANCAMENTOS_CLAUDE) {
        try {
          const snap = await getDocs(query(collection(db, "orcamentos"), where("importacaoId", "==", p.id)));
          if (!snap.empty) continue;
          const r = await lancar(p);
          novos.push({ id: p.id, cliente: p.cliente.nome, numero: r.numero, orcamentoId: r.orcamentoId });
        } catch (e) {
          console.error("Lançamento automático falhou", p.id, e);
        }
      }
      if (novos.length) setFeitos(novos);
    })();
  }, [isAdmin]);

  if (!feitos.length) return null;
  return (
    <div className="mb-3 space-y-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
      <div className="flex items-center justify-between font-bold text-emerald-900">
        <span className="flex items-center gap-1"><CheckCircle2 size={16} /> Lançado pelo Claude</span>
        <button aria-label="Fechar" onClick={() => setFeitos([])}><X size={16} /></button>
      </div>
      {feitos.map((f) => (
        <p key={f.id}>
          Cliente <b>{f.cliente}</b> e <Link className="font-semibold text-rbs underline" to={`/orcamentos/${f.orcamentoId}/pdf`}>Orçamento #{numeroFmt(f.numero)}</Link> (aprovado)
        </p>
      ))}
    </div>
  );
}
