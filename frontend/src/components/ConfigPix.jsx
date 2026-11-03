import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { PIX_VAZIO, TIPOS_CHAVE, gerarPixCopiaECola, lerConfigPix, salvarConfigPix } from "../lib/pix";

const CAMPO = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

// Dados do Pix usados no demonstrativo de cobrança e nas mensagens ao cliente.
export default function ConfigPix() {
  const [pix, setPix] = useState(PIX_VAZIO);
  const [aviso, setAviso] = useState(null);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => { lerConfigPix().then(setPix); }, []);
  const mudar = (c, v) => setPix((p) => ({ ...p, [c]: v }));

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setAviso(null);
    try {
      await salvarConfigPix(pix);
      setAviso({ ok: true, texto: "Dados do Pix salvos." });
    } catch (e2) {
      setAviso({ ok: false, texto: "Não foi possível salvar. Confira se as regras do banco (configuracoes) foram publicadas. " + e2.message });
    } finally {
      setSalvando(false);
    }
  }

  const teste = gerarPixCopiaECola({ ...pix, valor: 0 });
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-bold text-rbs-navy"><QrCode size={18} /> Dados do Pix</h2>
      <p className="mt-1 text-sm text-gray-600">Aparecem no demonstrativo de cobrança (com QR Code e “copia e cola” no valor da cobrança) e na mensagem de WhatsApp. Não gera boleto nem tem ligação com banco.</p>
      <form onSubmit={salvar} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold text-slate-600">Tipo de chave
          <select className={`${CAMPO} mt-1`} value={pix.tipoChave} onChange={(e) => mudar("tipoChave", e.target.value)}>{TIPOS_CHAVE.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="text-xs font-bold text-slate-600">Chave Pix *
          <input required className={`${CAMPO} mt-1`} value={pix.chave} onChange={(e) => mudar("chave", e.target.value)} placeholder="Ex.: 33.632.222/0001-86" />
        </label>
        <label className="text-xs font-bold text-slate-600">Nome do favorecido *
          <input required className={`${CAMPO} mt-1`} value={pix.favorecido} onChange={(e) => mudar("favorecido", e.target.value)} placeholder="Como aparece no banco" />
        </label>
        <label className="text-xs font-bold text-slate-600">Cidade
          <input className={`${CAMPO} mt-1`} value={pix.cidade} onChange={(e) => mudar("cidade", e.target.value)} />
        </label>
        <label className="text-xs font-bold text-slate-600">Banco (opcional)
          <input className={`${CAMPO} mt-1`} value={pix.banco} onChange={(e) => mudar("banco", e.target.value)} placeholder="Ex.: Banco Inter" />
        </label>
        <label className="text-xs font-bold text-slate-600">Instruções (opcional)
          <input className={`${CAMPO} mt-1`} value={pix.instrucoes} onChange={(e) => mudar("instrucoes", e.target.value)} placeholder="Ex.: enviar comprovante pelo WhatsApp" />
        </label>
        {aviso && <p role="status" className={`rounded-xl p-3 text-sm font-semibold sm:col-span-2 ${aviso.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{aviso.texto}</p>}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button disabled={salvando} className="rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{salvando ? "Salvando..." : "Salvar Pix"}</button>
          {teste && <span className="text-xs text-slate-500">Confira a chave antes de enviar a primeira cobrança: pague R$ 0,01 de teste.</span>}
        </div>
      </form>
    </section>
  );
}
