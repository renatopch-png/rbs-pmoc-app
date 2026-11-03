import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, FileText, ChevronLeft, ChevronRight, CircleAlert, FilePlus2, HandCoins, MessageCircle, RotateCcw, Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { brl } from "../../lib/orcamentos";
import { FORMAS_PAGAMENTO, deInputData, mesReferencia, paraInputData } from "../../lib/financeiro";
import { dataBR, lerColecao, linkWhatsApp } from "../../lib/modulos";
import {
  contratosCobraveis, estornarCobranca, excluirCobranca, execucoesDoMes, gerarCobranca, idCobranca,
  mensagemCobranca, nomeMes, receberCobranca, somarMes, statusCobranca,
} from "../../lib/cobrancas";
import { lerConfigPix } from "../../lib/pix";
import { BOTAO, BOTAO_SEC, Badge, CAMPO, Campo, Painel, Vazio } from "../../components/ui";

export default function CobrancasPMOC() {
  const { isAdmin } = useAuth();
  const [mes, setMes] = useState(mesReferencia());
  const [preventivos, setPreventivos] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [cobrancas, setCobrancas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState("");
  const [aviso, setAviso] = useState(null);
  const [recebendo, setRecebendo] = useState(null);
  const [pix, setPix] = useState(null);

  async function carregar() {
    const [p, o, c] = await Promise.all([lerColecao("preventivos"), lerColecao("ordens_servico"), lerColecao("cobrancas")]);
    setPreventivos(p);
    setOrdens(o);
    setCobrancas(c);
    setCarregando(false);
  }
  useEffect(() => { carregar(); lerConfigPix().then(setPix); }, []);

  const contratos = contratosCobraveis(preventivos);
  const porId = useMemo(() => new Map(cobrancas.map((c) => [c.id, c])), [cobrancas]);

  // Uma linha por contrato ativo + cobranças do mês de contratos já encerrados.
  const linhas = useMemo(() => {
    const ativas = contratos.map((p) => ({
      contrato: p,
      cobranca: porId.get(idCobranca(p.id, mes)),
      exec: execucoesDoMes(p, ordens, mes),
    }));
    const ids = new Set(ativas.map((l) => l.cobranca?.id).filter(Boolean));
    const orfas = cobrancas.filter((c) => c.mesReferencia === mes && !ids.has(c.id))
      .map((c) => ({ contrato: null, cobranca: c, exec: { total: c.execucoes || 0, os: 0, visitas: 0 } }));
    return [...ativas, ...orfas].sort((a, b) => (a.cobranca?.vencimento || "9").localeCompare(b.cobranca?.vencimento || "9"));
  }, [contratos, porId, ordens, mes, cobrancas]);

  const soma = (f) => linhas.filter(f).reduce((t, l) => t + Math.round((l.cobranca?.valor ?? l.contrato?.valor ?? 0) * 100), 0) / 100;
  const previsto = soma(() => true);
  const recebido = soma((l) => l.cobranca?.status === "Pago");
  const emAberto = soma((l) => l.cobranca && l.cobranca.status !== "Pago");
  const vencido = soma((l) => statusCobranca(l.cobranca).vencida);
  const prontas = linhas.filter((l) => l.contrato && !l.cobranca && l.exec.total > 0);

  async function executar(chave, acao, sucesso) {
    setOcupado(chave);
    setAviso(null);
    try {
      await acao();
      if (sucesso) setAviso({ ok: true, texto: sucesso });
      await carregar();
    } catch (e) {
      setAviso({ ok: false, texto: "Não foi possível concluir. Confira se as regras do banco (cobrancas) foram publicadas. " + e.message });
    } finally {
      setOcupado("");
    }
  }

  const gerar = (l) => {
    if (l.exec.total === 0 && !window.confirm(`Nenhuma execução registrada para ${l.contrato.clienteNome} em ${nomeMes(mes)}. Gerar a cobrança mesmo assim?`)) return;
    executar(l.contrato.id, () => gerarCobranca(l.contrato, mes, l.exec), "Cobrança gerada.");
  };

  const gerarProntas = () => executar("lote", async () => {
    for (const l of prontas) await gerarCobranca(l.contrato, mes, l.exec);
  }, `${prontas.length} cobrança(s) gerada(s) para os contratos com serviço executado.`);

  async function confirmarRecebimento(e) {
    e.preventDefault();
    const { cobranca, forma, data } = recebendo;
    setRecebendo(null);
    await executar(cobranca.id, () => receberCobranca(cobranca, forma, deInputData(data)), `Recebimento de ${brl(cobranca.valor)} lançado no Financeiro.`);
  }

  const estornar = (c) => window.confirm(`Estornar o recebimento de ${c.clienteNome}? A entrada será removida do Financeiro.`)
    && executar(c.id, () => estornarCobranca(c), "Recebimento estornado.");
  const excluir = (c) => window.confirm(`Excluir a cobrança de ${c.clienteNome} (${nomeMes(c.mesReferencia)})?`)
    && executar(c.id, () => excluirCobranca(c), "Cobrança excluída.");

  if (!isAdmin) return <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm">O Financeiro é restrito ao administrador.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Link to="/financeiro" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600"><ArrowLeft size={16} /> Voltar</Link>
        <h1 className="text-xl font-extrabold text-rbs-navy">Cobranças PMOC</h1>
        <Link to="/preventivo" className="text-sm font-bold text-blue-700">Contratos →</Link>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-white p-2 shadow-sm">
        <button aria-label="Mês anterior" onClick={() => setMes(somarMes(mes, -1))} className="rounded-lg p-2 hover:bg-slate-100"><ChevronLeft size={20} /></button>
        <p className="font-extrabold text-rbs-navy">{nomeMes(mes)}</p>
        <button aria-label="Próximo mês" onClick={() => setMes(somarMes(mes, 1))} className="rounded-lg p-2 hover:bg-slate-100"><ChevronRight size={20} /></button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Previsto", previsto, "text-rbs-navy"], ["Recebido", recebido, "text-green-700"], ["Em aberto", emAberto, "text-amber-600"], ["Vencido", vencido, "text-red-600"]].map(([r, v, c]) => (
          <div key={r} className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{r}</p>
            <p className={`text-lg font-extrabold ${c}`}>{brl(v)}</p>
          </div>
        ))}
      </div>

      {aviso && <p role="status" className={`rounded-xl p-3 text-sm font-semibold ${aviso.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{aviso.texto}</p>}

      {prontas.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3">
          <CheckCircle2 size={20} className="text-blue-700" />
          <p className="flex-1 text-sm font-semibold text-blue-900">{prontas.length} contrato(s) com serviço executado em {nomeMes(mes).toLowerCase()} e sem cobrança.</p>
          <button disabled={!!ocupado} onClick={gerarProntas} className={BOTAO}><FilePlus2 size={16} /> Gerar cobranças</button>
        </div>
      )}

      {carregando ? <p className="text-sm text-slate-500">Carregando...</p> : linhas.length === 0 ? (
        <Vazio>
          Nenhum contrato com cobrança mensal. No <Link to="/preventivo" className="font-bold text-blue-700">Cadastro Preventivo</Link>, edite o contrato do cliente e marque <b>“Gerar cobrança mensal no Financeiro”</b>.
        </Vazio>
      ) : (
        <ul className="space-y-2">
          {linhas.map(({ contrato, cobranca: c, exec }) => {
            const st = statusCobranca(c);
            const nome = c?.clienteNome || contrato?.clienteNome;
            return (
              <li key={c?.id || contrato.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-bold text-rbs-navy">{nome} <Badge cor={st.cor}>{st.rotulo}</Badge></p>
                    <p className="text-sm text-slate-600">{c?.servico || contrato?.servico}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                      {c ? <span>Vence {dataBR(c.vencimento)}</span> : <span>Vencimento dia {contrato.diaVencimento || 10}</span>}
                      {exec.total > 0
                        ? <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 size={12} /> {exec.total} execução(ões) no mês</span>
                        : <span className="inline-flex items-center gap-1 font-semibold text-amber-700"><CircleAlert size={12} /> Sem execução registrada</span>}
                      {c?.status === "Pago" && <span>Recebido {dataBR(c.pagoEm)} • {c.formaPagamento}</span>}
                    </p>
                  </div>
                  <p className="text-lg font-extrabold text-green-700">{brl(c?.valor ?? contrato?.valor)}</p>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-1 border-t border-slate-100 pt-2">
                  {!c && <button disabled={!!ocupado} onClick={() => gerar({ contrato, exec })} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"><FilePlus2 size={14} /> Gerar cobrança</button>}
                  {c && <Link to={`/financeiro/cobrancas/${c.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50"><FileText size={14} /> Demonstrativo</Link>}
                  {c && c.status !== "Pago" && (
                    <>
                      {c.clienteTelefone && <a href={linkWhatsApp(c.clienteTelefone, mensagemCobranca(c, pix))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-50"><MessageCircle size={14} /> Enviar cobrança</a>}
                      <button disabled={!!ocupado} onClick={() => setRecebendo({ cobranca: c, forma: "Pix", data: paraInputData() })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><HandCoins size={14} /> Receber</button>
                      <button disabled={!!ocupado} aria-label="Excluir cobrança" onClick={() => excluir(c)} className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                    </>
                  )}
                  {c?.status === "Pago" && <button disabled={!!ocupado} onClick={() => estornar(c)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"><RotateCcw size={14} /> Estornar</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {recebendo && (
        <Painel titulo="Registrar recebimento" aoFechar={() => setRecebendo(null)}>
          <form onSubmit={confirmarRecebimento} className="space-y-3">
            <p className="text-sm text-slate-600">{recebendo.cobranca.descricao} — <b>{brl(recebendo.cobranca.valor)}</b></p>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Forma de pagamento">
                <select className={CAMPO} value={recebendo.forma} onChange={(e) => setRecebendo({ ...recebendo, forma: e.target.value })}>{FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}</select>
              </Campo>
              <Campo rotulo="Data do recebimento">
                <input required type="date" className={CAMPO} value={recebendo.data} onChange={(e) => setRecebendo({ ...recebendo, data: e.target.value })} />
              </Campo>
            </div>
            <p className="text-xs text-slate-500">Será lançada uma <b>entrada</b> na categoria <b>Manutenção</b> do Financeiro.</p>
            <div className="flex gap-2">
              <button className={BOTAO}>Confirmar recebimento</button>
              <button type="button" onClick={() => setRecebendo(null)} className={BOTAO_SEC}>Cancelar</button>
            </div>
          </form>
        </Painel>
      )}
    </div>
  );
}
