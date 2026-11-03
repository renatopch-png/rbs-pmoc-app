import { useState } from "react";
import { X } from "lucide-react";
import { STATUS_SERVICO, comissaoDoServico } from "../../lib/equipe";
import { brl } from "../../lib/orcamentos";
import { paraInputData } from "../../lib/financeiro";
import { excluirServico, salvarServico } from "../../services/equipeService";

const CAMPO = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal";

export default function FormServico({ inicial, funcionarios, clientes, aoFechar, aoSalvar }) {
  const editando = !!inicial?.id;
  const pago = !!inicial?.comissaoPaga;
  const ativos = funcionarios.filter((x) => x.ativo !== false || x.id === inicial?.funcionarioId);
  const [f, setF] = useState({
    titulo: inicial?.titulo || "", funcionarioId: inicial?.funcionarioId || "", clienteId: inicial?.clienteId || "",
    data: inicial?.data || paraInputData(), hora: inicial?.hora || "08:00", status: inicial?.status || "Pendente",
    valor: inicial?.valor ?? "", comissaoPercentual: inicial?.comissaoPercentual ?? "", descricao: inicial?.descricao || "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const mudar = (c, v) => setF((a) => ({ ...a, [c]: v }));
  function escolherFuncionario(id) {
    const func = funcionarios.find((x) => x.id === id);
    setF((a) => ({ ...a, funcionarioId: id, comissaoPercentual: func?.comissaoPercentual ?? a.comissaoPercentual }));
  }
  const comissao = comissaoDoServico(f.valor, f.comissaoPercentual);

  async function salvar(e) {
    e.preventDefault();
    const func = funcionarios.find((x) => x.id === f.funcionarioId);
    const cli = clientes.find((x) => x.id === f.clienteId);
    if (!func) return setErro("Selecione o funcionário.");
    setSalvando(true);
    try {
      await salvarServico(inicial?.id, {
        ...f, titulo: f.titulo.trim(), funcionarioNome: func.nome, clienteNome: cli?.nome || "",
        valor: Number(f.valor) || 0, comissaoPercentual: Number(f.comissaoPercentual) || 0, comissaoValor: comissao,
        ...(editando ? {} : { comissaoPaga: false }),
      });
      aoSalvar();
    } catch (e2) {
      setErro("Não foi possível salvar: " + e2.message);
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!window.confirm("Excluir este serviço? Esta ação não pode ser desfeita.")) return;
    try {
      await excluirServico(inicial.id);
      aoSalvar();
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Serviço" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <form onSubmit={salvar} className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-rbs-navy">{editando ? "Editar serviço" : "Novo serviço"}</h2>
          <button type="button" aria-label="Fechar" onClick={aoFechar} className="p-1 text-slate-500"><X size={20} /></button>
        </div>
        <label className="block text-xs font-semibold text-slate-600">Serviço<input required className={CAMPO} value={f.titulo} onChange={(e) => mudar("titulo", e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-semibold text-slate-600">Funcionário
            <select required className={CAMPO} value={f.funcionarioId} onChange={(e) => escolherFuncionario(e.target.value)}>
              <option value="">Selecione</option>{ativos.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">Cliente
            <select className={CAMPO} value={f.clienteId} onChange={(e) => mudar("clienteId", e.target.value)}>
              <option value="">Sem cliente</option>{clientes.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">Data<input required type="date" className={CAMPO} value={f.data} onChange={(e) => mudar("data", e.target.value)} /></label>
          <label className="block text-xs font-semibold text-slate-600">Hora<input type="time" className={CAMPO} value={f.hora} onChange={(e) => mudar("hora", e.target.value)} /></label>
          <label className="block text-xs font-semibold text-slate-600">Valor do serviço (R$)<input disabled={pago} type="number" min="0" step="0.01" className={CAMPO} value={f.valor} onChange={(e) => mudar("valor", e.target.value)} /></label>
          <label className="block text-xs font-semibold text-slate-600">Comissão (%)<input disabled={pago} type="number" min="0" max="100" step="0.1" className={CAMPO} value={f.comissaoPercentual} onChange={(e) => mudar("comissaoPercentual", e.target.value)} /></label>
        </div>
        <label className="block text-xs font-semibold text-slate-600">Status
          <select className={CAMPO} value={f.status} onChange={(e) => mudar("status", e.target.value)}>{STATUS_SERVICO.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label className="block text-xs font-semibold text-slate-600">Descrição<textarea rows={2} className={CAMPO} value={f.descricao} onChange={(e) => mudar("descricao", e.target.value)} /></label>
        <p className="rounded-lg bg-slate-50 p-2 text-sm">Comissão: <b>{brl(comissao)}</b>{pago && " (já paga, valores bloqueados)"}</p>
        {erro && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-800">{erro}</p>}
        <div className="flex justify-between gap-2">
          {editando && !pago ? <button type="button" onClick={excluir} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Excluir</button> : <span />}
          <button disabled={salvando} className="rounded-lg bg-rbs px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">{salvando ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}
