import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { dataDoLancamento } from "../../lib/financeiro";

const CHAVE = "rbs.ocultarFinanceiro";

export function useOcultarValores() {
  const [ocultar, setOcultar] = useState(() => {
    try { return localStorage.getItem(CHAVE) === "1"; } catch { return false; }
  });
  const alternar = () => setOcultar((a) => {
    try { localStorage.setItem(CHAVE, a ? "0" : "1"); } catch { /* preferência opcional */ }
    return !a;
  });
  return [ocultar, alternar];
}

export function useFinanceiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    try {
      const [snapL, snapC] = await Promise.all([getDocs(collection(db, "lancamentos")), getDocs(collection(db, "contas_fixas"))]);
      setLancamentos(snapL.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (dataDoLancamento(b) || 0) - (dataDoLancamento(a) || 0)));
      setContas(snapC.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.diaVencimento || 0) - (b.diaVencimento || 0)));
      setErro("");
    } catch (e) {
      setErro("Não foi possível carregar o Financeiro. Confira se as regras do banco foram publicadas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { recarregar(); }, [recarregar]);
  return { lancamentos, contas, carregando, erro, recarregar };
}
