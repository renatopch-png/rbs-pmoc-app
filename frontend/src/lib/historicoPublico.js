import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../services/firebase";

// A página pública do QR Code não pode listar `ordens_servico` (isso expunha
// a base inteira). Ela lê este resumo, um documento por equipamento, que só
// guarda o necessário para mostrar o histórico.
export async function sincronizarHistorico(equipamentoId) {
  const snap = await getDocs(query(collection(db, "ordens_servico"), where("equipamentoId", "==", equipamentoId)));
  const itens = snap.docs
    .map((d) => {
      const os = d.data();
      const checklist = os.itensChecklist || [];
      return {
        id: d.id,
        dataExecucao: os.dataExecucao || null,
        tecnicoNome: os.tecnicoNome || "",
        total: checklist.length,
        feitos: checklist.filter((it) => it.feito || it.concluido || it.checked).length,
      };
    })
    .sort((a, b) => (b.dataExecucao?.toMillis?.() || 0) - (a.dataExecucao?.toMillis?.() || 0));
  await setDoc(doc(db, "historico_publico", equipamentoId), { itens, atualizadoEm: serverTimestamp() });
}

export async function sincronizarTodos() {
  const snap = await getDocs(collection(db, "equipamentos"));
  for (const d of snap.docs) await sincronizarHistorico(d.id);
  return snap.size;
}
