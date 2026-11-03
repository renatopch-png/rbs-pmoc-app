import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, ClipboardList, DollarSign, Plus, UserPlus, Users, Wrench } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { brl } from "../../lib/orcamentos";
import { inicioSemana, mesReferencia, paraInputData } from "../../lib/financeiro";
import { CORES_SERVICO, comissoesAPagar, diasDaSemana, relatorioPorFuncionario, resumoEquipe } from "../../lib/equipe";
import { carregarEquipe, pagarComissoes, reativarFuncionario, removerAcesso } from "../../services/equipeService";
import FormFuncionario from "./FormFuncionario";
import FormServico from "./FormServico";
import MeusServicos from "./MeusServicos";

const ABAS = [["agenda", "Agenda", CalendarDays], ["funcionarios", "Funcionários", Users], ["servicos", "Serviços", Wrench], ["comissoes", "Comissões", DollarSign], ["relatorios", "Relatórios", BarChart3]];
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const dataBr = (s) => (s ? s.split("-").reverse().join("/") : "—");

function Stat({ icone: Icone, rotulo, valor, nota }) {
  return (
    <section className="rounded-2xl bg-white p-3 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white"><Icone size={18} /></span>
      <p className="mt-2 text-sm text-slate-600">{rotulo}</p>
      <p className="break-words text-lg font-extrabold text-rbs-navy">{valor}</p>
      <p className="text-xs text-slate-500">{nota}</p>
    </section>
  );
}

function CartaoServico({ s, aoAbrir }) {
  return (
    <button onClick={() => aoAbrir(s)} className="w-full rounded-xl border border-slate-200 bg-white p-2 text-left hover:border-blue-300">
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-bold text-rbs-navy">{s.hora} {s.titulo}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${CORES_SERVICO[s.status]}`}>{s.status}</span>
      </span>
      <span className="block truncate text-xs text-slate-500">{s.funcionarioNome}{s.clienteNome ? ` • ${s.clienteNome}` : ""}</span>
    </button>
  );
}

export default function GestaoEquipe() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <MeusServicos />;
  return <PainelAdmin />;
}

function PainelAdmin() {
  const [dados, setDados] = useState({ funcionarios: [], servicos: [], usuarios: [], convites: [], clientes: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState("agenda");
  const [desvio, setDesvio] = useState(0);
  const [filtroFunc, setFiltroFunc] = useState("");
  const [modalFunc, setModalFunc] = useState(null);
  const [modalServ, setModalServ] = useState(null);
  const [mes, setMes] = useState(mesReferencia());

  const recarregar = useCallback(async () => {
    try {
      setDados(await carregarEquipe());
      setErro("");
    } catch (e) {
      setErro("Não foi possível carregar a equipe. Confira se as regras do banco foram publicadas.");
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const { funcionarios, servicos, usuarios, convites, clientes } = dados;
  const mesAtual = mesReferencia();
  const resumo = useMemo(() => resumoEquipe(servicos, mesAtual), [servicos, mesAtual]);
  const ativos = funcionarios.filter((f) => f.ativo !== false);
  const semana = useMemo(() => {
    const i = inicioSemana();
    i.setDate(i.getDate() + desvio * 7);
    return diasDaSemana(i);
  }, [desvio]);
  const visiveis = filtroFunc ? servicos.filter((s) => s.funcionarioId === filtroFunc) : servicos;
  const aPagar = useMemo(() => comissoesAPagar(servicos, funcionarios), [servicos, funcionarios]);
  const relatorio = useMemo(() => relatorioPorFuncionario(servicos, funcionarios, mes), [servicos, funcionarios, mes]);
  const usuarioDe = (f) => usuarios.find((u) => u.funcionarioId === f.id);

  async function acao(fn) {
    try { await fn(); await recarregar(); } catch (e) { setErro("Não foi possível concluir: " + e.message); }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-rbs-navy">Gestão de Equipe</h1>
          <p className="text-sm text-slate-500">Organize sua equipe e acompanhe os resultados</p>
        </div>
        <button onClick={() => setModalFunc({})} className="inline-flex items-center gap-1 rounded-lg border border-rbs bg-white px-3 py-2 text-sm font-semibold text-rbs"><UserPlus size={16} /> Vincular funcionário</button>
      </header>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}

      <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white"><Users size={22} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-600">Sua equipe</p>
          <p className="font-extrabold text-rbs-navy">{ativos.length === 0 ? "Nenhum funcionário ativo" : `${ativos.length} funcionário(s) ativo(s)`}</p>
        </div>
        <button onClick={() => setAba("funcionarios")} className="text-sm font-bold text-blue-700">Gerenciar →</button>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <Stat icone={DollarSign} rotulo="Comissões" valor={brl(resumo.comissoes)} nota="Este mês" />
        <Stat icone={CircleCheck} rotulo="Realizados" valor={resumo.realizados} nota="Este mês" />
        <Stat icone={ClipboardList} rotulo="Pendentes" valor={resumo.pendentes} nota="Serviços" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {ABAS.map(([id, rotulo, Icone]) => (
          <button key={id} aria-pressed={aba === id} onClick={() => setAba(id)}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 text-xs font-bold ${aba === id ? "border border-blue-300 bg-blue-50 text-blue-700" : "bg-white text-rbs-navy shadow-sm"}`}>
            <Icone size={18} /> {rotulo}
          </button>
        ))}
      </div>

      {carregando && <p className="text-sm text-slate-500">Carregando...</p>}

      {aba === "agenda" && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="flex-1 font-extrabold text-rbs-navy">Agenda semanal da equipe</h2>
            <select aria-label="Filtrar funcionário" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={filtroFunc} onChange={(e) => setFiltroFunc(e.target.value)}>
              <option value="">Todos</option>{funcionarios.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <button onClick={() => setDesvio(0)} className="rounded-lg border border-rbs px-3 py-1.5 text-sm font-semibold text-rbs">Hoje</button>
          </div>
          <div className="mb-3 flex items-center justify-between">
            <button aria-label="Semana anterior" onClick={() => setDesvio((d) => d - 1)} className="rounded-lg bg-slate-100 p-2"><ChevronLeft size={18} /></button>
            <p className="text-sm font-bold text-rbs-navy">{semana[0].toLocaleDateString("pt-BR")} – {semana[6].toLocaleDateString("pt-BR")}</p>
            <button aria-label="Próxima semana" onClick={() => setDesvio((d) => d + 1)} className="rounded-lg bg-slate-100 p-2"><ChevronRight size={18} /></button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {semana.map((d, i) => {
              const chave = paraInputData(d);
              const doDia = visiveis.filter((s) => s.data === chave).sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));
              return (
                <div key={chave} className={`min-w-0 rounded-xl border p-2 ${chave === paraInputData() ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                  <p className="text-sm font-extrabold text-rbs-navy">{DIAS[i]} <span className="text-xs font-normal text-slate-500">{chave.slice(8)}/{chave.slice(5, 7)}</span></p>
                  <div className="mt-1 space-y-1">
                    {doDia.length === 0 ? <p className="text-xs text-slate-400">Livre</p> : doDia.map((s) => <CartaoServico key={s.id} s={s} aoAbrir={setModalServ} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {aba === "funcionarios" && (
        <section className="space-y-2">
          {funcionarios.length === 0 && !carregando ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhum funcionário cadastrado. Use "Vincular funcionário".</p> : funcionarios.map((f) => {
            const usuario = usuarioDe(f);
            const convite = convites.some((c) => c.id === f.email);
            const situacao = f.ativo === false ? "Inativo" : usuario ? "Acesso ativo" : convite ? "Convite pendente" : "Sem acesso";
            return (
              <div key={f.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-rbs-navy">{f.nome}</p>
                  <p className="truncate text-xs text-slate-500">{f.funcao} • {f.email} • comissão {f.comissaoPercentual}%</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{situacao}</span>
                <button onClick={() => setModalFunc(f)} className="text-sm font-bold text-blue-700">Editar</button>
                {f.ativo === false
                  ? <button onClick={() => acao(() => reativarFuncionario(f))} className="text-sm font-bold text-green-700">Reativar</button>
                  : <button onClick={() => window.confirm(`Remover o acesso de ${f.nome}? O histórico de serviços será mantido.`) && acao(() => removerAcesso(f, usuario))} className="text-sm font-bold text-red-700">Remover acesso</button>}
              </div>
            );
          })}
        </section>
      )}

      {aba === "servicos" && (
        <section className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button disabled={ativos.length === 0} onClick={() => setModalServ({})} className="inline-flex items-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Plus size={16} /> Novo serviço</button>
            <select aria-label="Filtrar serviços por funcionário" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={filtroFunc} onChange={(e) => setFiltroFunc(e.target.value)}>
              <option value="">Todos</option>{funcionarios.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          {ativos.length === 0 && <p className="text-sm text-slate-500">Cadastre um funcionário para criar serviços.</p>}
          {visiveis.map((s) => (
            <div key={s.id}>
              <p className="mb-1 text-xs font-semibold text-slate-500">{dataBr(s.data)}</p>
              <CartaoServico s={s} aoAbrir={setModalServ} />
            </div>
          ))}
        </section>
      )}

      {aba === "comissoes" && (
        <section className="space-y-2">
          {aPagar.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhuma comissão a pagar.</p> : aPagar.map(({ funcionario, itens, total }) => (
            <div key={funcionario.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="font-extrabold text-rbs-navy">{funcionario.nome}</p><p className="text-xs text-slate-500">{itens.length} serviço(s) concluído(s)</p></div>
                <p className="font-extrabold text-red-600">{brl(total)}</p>
                <button onClick={() => window.confirm(`Pagar ${brl(total)} para ${funcionario.nome}? Será lançado como saída no Financeiro.`) && acao(() => pagarComissoes(funcionario, itens))} className="rounded-lg bg-rbs px-3 py-1.5 text-sm font-semibold text-white">Pagar comissão</button>
              </div>
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {itens.map((s) => <li key={s.id} className="flex justify-between gap-2 py-1"><span className="truncate">{dataBr(s.data)} • {s.titulo}</span><span>{brl(s.comissaoValor)}</span></li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {aba === "relatorios" && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-extrabold text-rbs-navy">Resultado por funcionário</h2>
            <input aria-label="Mês" type="month" className="rounded-lg border border-slate-300 px-2 py-1 text-sm" value={mes} onChange={(e) => setMes(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="bg-rbs-dark text-left text-white"><th className="p-2">Funcionário</th><th className="p-2 text-right">Realizados</th><th className="p-2 text-right">Pendentes</th><th className="p-2 text-right">Faturado</th><th className="p-2 text-right">Comissão</th></tr></thead>
              <tbody>
                {relatorio.map((r, i) => (
                  <tr key={r.funcionario.id} className={i % 2 ? "bg-rbs-light" : ""}>
                    <td className="p-2 font-semibold">{r.funcionario.nome}</td><td className="p-2 text-right">{r.realizados}</td><td className="p-2 text-right">{r.pendentes}</td><td className="p-2 text-right">{brl(r.faturado)}</td><td className="p-2 text-right">{brl(r.comissao)}</td>
                  </tr>
                ))}
                {relatorio.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Sem dados.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modalFunc && <FormFuncionario inicial={modalFunc} aoFechar={() => setModalFunc(null)} aoSalvar={() => { setModalFunc(null); recarregar(); }} />}
      {modalServ && <FormServico inicial={modalServ} funcionarios={funcionarios} clientes={clientes} aoFechar={() => setModalServ(null)} aoSalvar={() => { setModalServ(null); recarregar(); }} />}
    </div>
  );
}
