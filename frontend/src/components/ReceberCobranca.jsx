import { useState } from "react";
import { brl } from "../lib/orcamentos";
import { FORMAS_PAGAMENTO, deInputData, paraInputData } from "../lib/financeiro";
import { nomeMes, receberCobranca } from "../lib/cobrancas";
import { BOTAO, BOTAO_SEC, CAMPO, Campo, Erro, Painel } from "./ui";

// Janela "Marcar como pago": baixa a cobrança e lança a entrada no Financeiro.
export default function ReceberCobranca({ cobranca: c, aoFechar, aoConcluir }) {
  const [forma, setForma] = useState("Pix");
  const [data, setData] = useState(paraInputData());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      await receberCobranca(c, forma, deInputData(data));
      aoConcluir?.();
    } catch (e2) {
      setErro("Não foi possível registrar: " + e2.message);
      setSalvando(false);
    }
  }

  return (
    <Painel titulo="Marcar como pago" aoFechar={aoFechar}>
      <form onSubmit={confirmar} className="space-y-3">
        <Erro>{erro}</Erro>
        <p className="text-sm text-slate-600">{c.clienteNome} — {nomeMes(c.mesReferencia)} • <b>{brl(c.valor)}</b></p>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Forma de pagamento">
            <select className={CAMPO} value={forma} onChange={(e) => setForma(e.target.value)}>{FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}</select>
          </Campo>
          <Campo rotulo="Data do pagamento">
            <input required type="date" className={CAMPO} value={data} onChange={(e) => setData(e.target.value)} />
          </Campo>
        </div>
        <p className="text-xs text-slate-500">A cobrança fica como <b>Paga</b> e entra uma <b>entrada</b> no Financeiro (categoria Manutenção). Depois você pode emitir o recibo.</p>
        <div className="flex gap-2">
          <button disabled={salvando} className={BOTAO}>{salvando ? "Salvando..." : "Confirmar pagamento"}</button>
          <button type="button" onClick={aoFechar} className={BOTAO_SEC}>Cancelar</button>
        </div>
      </form>
    </Painel>
  );
}
