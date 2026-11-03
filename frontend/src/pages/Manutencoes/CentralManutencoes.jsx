import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle, CalendarClock, CheckCircle2, FileText, HandCoins, Plus, ShieldCheck, Snowflake, Wrench,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { modulo } from "../../data/menu";
import { paraData } from "../../lib/agenda";
import { mesReferencia } from "../../lib/financeiro";
import { CORES_STATUS, brl, numeroFmt } from "../../lib/orcamentos";
import { statusCobranca, nomeMes } from "../../lib/cobrancas";
import { proximaManutencaoEquipamento, dataBR, diasAte, fimGarantia, lerColecao, paraInput, statusGarantia, statusPreventivo } from "../../lib/modulos";
import { Badge, Busca, CAMPO, Cabecalho, Filtros, Vazio } from "../../components/ui";

const MOD = modulo("/manutencoes");
const nomeEq = (e) => [e.nome || e.tipo, e.capacidade, e.local].filter(Boolean).join(" • ");

function Kpi({ rotulo, valor, cor = "text-rbs-navy", destaque, className = "" }) {
  return (
    <div className={`rounded-2xl p-3 shadow-sm ${className} ${destaque ? "bg-red-50 ring-1 ring-red-200" : "bg-white"}`}>
      <p className="text-xs font-semibold text-slate-500">{rotulo}</p>
      <p className={`text-xl font-extrabold ${cor}`}>{valor}</p>
    </div>
  );
}

export default function CentralManutencoes() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const clienteId = params.get("cliente") || "";
  const [aba, setAba] = useState(params.get("aba") || "agenda");
  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState(null);

  useEffect(() => {
    (async () => {
      const nomes = ["clientes", "equipamentos", "preventivos", "ordens_servico", "garantias", "orcamentos"];
      const lidos = await Promise.all([...nomes.map(lerColecao), isAdmin ? lerColecao("cobrancas") : Promise.resolve([])]);
      const [clientes, equipamentos, preventivos, ordens, garantias, orcamentos, cobrancas] = lidos;
      ordens.sort((a, b) => (paraData(b.dataExecucao) || 0) - (paraData(a.dataExecucao) || 0));
      clientes.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      setDados({ clientes, equipamentos, preventivos, ordens, garantias, orcamentos, cobrancas });
    })();
  }, [isAdmin]);

  function escolherCliente(id) {
    const p = new URLSearchParams(params);
    if (id) p.set("cliente", id); else p.delete("cliente");
    setParams(p, { replace: true });
  }

  // Tudo filtrado pelo cliente escolhido (ou todos).
  const v = useMemo(() => {
    if (!dados) return null;
    const doCliente = (x) => !clienteId || x.clienteId === clienteId;
    const equipamentos = dados.equipamentos.filter(doCliente);
    const idsEq = new Set(equipamentos.map((e) => e.id));
    const preventivos = dados.preventivos.filter((p) => doCliente(p) || (p.equipamentoIds || []).some((id) => idsEq.has(id)));
    const ordens = dados.ordens.filter((o) => doCliente(o) || idsEq.has(o.equipamentoId));
    const garantiasManuais = dados.garantias.filter(doCliente);
    const orcamentos = dados.orcamentos.filter(doCliente).sort((a, b) => (b.numero || 0) - (a.numero || 0));
    const garantias = [
      ...garantiasManuais,
      ...orcamentos.filter((o) => o.garantiaValidaAte).map((o) => ({
        id: `orc-${o.id}`, clienteNome: o.clienteNome, descricao: o.objeto || `Orçamento #${numeroFmt(o.numero)}`, dataFim: o.garantiaValidaAte,
      })),
    ];
    const cobrancas = dados.cobrancas.filter(doCliente).sort((a, b) => (b.vencimento || "").localeCompare(a.vencimento || ""));

    // Por equipamento: última OS, próxima visita (contrato ou periodicidade) e garantia ativa.
    const linhasEq = equipamentos.map((e) => {
      const ultima = ordens.find((o) => o.equipamentoId === e.id);
      const r = proximaManutencaoEquipamento(e, ordens, preventivos);
      const proxima = r.proxima ? paraInput(r.proxima) : "";
      const garantia = garantiasManuais.find((g) => g.equipamentoId === e.id && statusGarantia(g).rotulo !== "Vencida");
      return { e, ultima, contrato: r.contrato, proxima, dias: r.dias, garantia, qtdOS: ordens.filter((o) => o.equipamentoId === e.id).length };
    }).sort((a, b) => (a.dias ?? 9999) - (b.dias ?? 9999));

    const mes = mesReferencia();
    return {
      equipamentos, preventivos, ordens, garantias, orcamentos, cobrancas, linhasEq,
      atrasados: linhasEq.filter((l) => l.dias !== null && l.dias < 0).length,
      osMes: ordens.filter((o) => { const d = paraData(o.dataExecucao); return d && mesReferencia(d) === mes; }).length,
      contratosAtivos: preventivos.filter((p) => p.ativo !== false).length,
      aReceber: cobrancas.filter((c) => c.status !== "Pago").reduce((t, c) => t + (Number(c.valor) || 0), 0),
      vencido: cobrancas.some((c) => statusCobranca(c).vencida),
    };
  }, [dados, clienteId]);

  if (!dados || !v) return <p className="p-4 text-sm text-slate-500">Carregando...</p>;
  const cliente = dados.clientes.find((c) => c.id === clienteId);
  const termo = busca.trim().toLowerCase();
  const casa = (...t) => !termo || t.some((x) => (x || "").toLowerCase().includes(termo));

  const abas = [
    { valor: "agenda", rotulo: "Agenda e contratos", qtd: v.preventivos.length },
    { valor: "equipamentos", rotulo: "Equipamentos", qtd: v.equipamentos.length },
    { valor: "historico", rotulo: "Histórico de OS", qtd: v.ordens.length },
    { valor: "garantias", rotulo: "Garantias", qtd: v.garantias.length },
    ...(isAdmin ? [{ valor: "financeiro", rotulo: "Financeiro", qtd: v.cobrancas.length + v.orcamentos.length }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <Cabecalho modulo={MOD} titulo={cliente ? cliente.nome : "Central de Manutenções"} subtitulo={cliente ? [cliente.edificio, cliente.endereco].filter(Boolean).join(" — ") || "Manutenções do cliente" : "Clientes, equipamentos, OS, garantias e financeiro num só lugar"}>
        <button onClick={() => navigate("/preventivo")} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rbs px-4 py-2 text-sm font-semibold text-white shadow-sm"><Plus size={16} /> Contrato</button>
        {cliente && <Link to={`/relatorios/pmoc-consolidado/${cliente.id}`} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><FileText size={16} /> PMOC</Link>}
      </Cabecalho>

      <select aria-label="Cliente" className={`${CAMPO} font-semibold`} value={clienteId} onChange={(e) => escolherCliente(e.target.value)}>
        <option value="">Todos os clientes ({dados.clientes.length})</option>
        {dados.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.edificio ? ` — ${c.edificio}` : ""}</option>)}
      </select>

      <div className={`grid grid-cols-2 gap-2 ${isAdmin ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
        <Kpi rotulo="Equipamentos" valor={v.equipamentos.length} />
        <Kpi rotulo="Contratos ativos" valor={v.contratosAtivos} />
        <Kpi rotulo="Manutenções atrasadas" valor={v.atrasados} cor={v.atrasados ? "text-red-600" : "text-rbs-navy"} destaque={v.atrasados > 0} />
        <Kpi rotulo="OS neste mês" valor={v.osMes} cor="text-emerald-700" />
        {isAdmin && <Kpi className="col-span-2 sm:col-span-1" rotulo="A receber" valor={brl(v.aReceber)} cor={v.vencido ? "text-red-600" : "text-amber-600"} destaque={v.vencido} />}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Filtros valor={aba} aoMudar={setAba} opcoes={abas} />
        <div className="sm:ml-auto sm:w-72"><Busca valor={busca} aoMudar={setBusca} placeholder="Filtrar..." /></div>
      </div>

      {aba === "agenda" && (() => {
        const lista = v.preventivos.map((p) => ({ ...p, st: statusPreventivo(p) }))
          .filter((p) => casa(p.clienteNome, p.servico, p.responsavel))
          .sort((a, b) => (a.st.dias ?? 9999) - (b.st.dias ?? 9999));
        return lista.length === 0 ? <Vazio>Nenhum contrato/manutenção recorrente. Toque em <b>+ Contrato</b> para cadastrar.</Vazio> : (
          <ul className="grid gap-2 md:grid-cols-2">
            {lista.map((p) => (
              <li key={p.id}>
                <Link to="/preventivo" className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md">
                  <CalendarClock size={20} className={p.st.dias !== null && p.st.dias < 0 ? "text-red-600" : "text-orange-600"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-bold text-rbs-navy">{p.clienteNome} <Badge cor={p.st.cor}>{p.st.rotulo}</Badge></span>
                    <span className="block text-sm text-slate-700">{p.servico}</span>
                    <span className="block text-xs text-slate-500">
                      {p.periodicidade} • próxima {dataBR(p.proximaData)} • {(p.equipamentoIds || []).length} equip.
                      {isAdmin && p.cobrancaMensal && Number(p.valor) > 0 && ` • ${brl(p.valor)}/mês`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        );
      })()}

      {aba === "equipamentos" && (() => {
        const lista = v.linhasEq.filter((l) => casa(nomeEq(l.e), l.e.marca, l.e.modelo, dados.clientes.find((c) => c.id === l.e.clienteId)?.nome));
        return lista.length === 0 ? <Vazio>Nenhum equipamento {cliente ? "deste cliente" : ""}.</Vazio> : (
          <ul className="space-y-2">
            {lista.map(({ e, ultima, contrato, proxima, dias, garantia, qtdOS }) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-700 text-white"><Snowflake size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-rbs-navy">{nomeEq(e)}</p>
                  <p className="text-xs text-slate-500">
                    {!cliente && `${dados.clientes.find((c) => c.id === e.clienteId)?.nome || "Sem cliente"} • `}
                    {[e.marca, e.modelo].filter(Boolean).join(" ")}{e.marca || e.modelo ? " • " : ""}{qtdOS} OS
                    {ultima && ` • última ${paraData(ultima.dataExecucao)?.toLocaleDateString("pt-BR")}`}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-1">
                    {proxima && <Badge cor={dias < 0 ? "bg-red-100 text-red-800" : dias <= 7 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}>{dias < 0 ? `Atrasada ${-dias}d` : `Próxima ${dataBR(proxima)}`}</Badge>}
                    {contrato && <Badge cor="bg-orange-50 text-orange-700">Contrato {contrato.periodicidade.toLowerCase()}</Badge>}
                    {garantia && <Badge cor="bg-amber-50 text-amber-700">Garantia até {dataBR(fimGarantia(garantia))}</Badge>}
                  </p>
                </div>
                <Link to={`/etiquetas?cliente=${e.clienteId || ""}&eq=${e.id}`} className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">🏷️ Etiqueta</Link>
                <Link to={`/ordens-servico/executar/${e.id}`} className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100"><Wrench size={14} /> Executar OS</Link>
              </li>
            ))}
          </ul>
        );
      })()}

      {aba === "historico" && (() => {
        const lista = v.ordens.filter((o) => casa(o.equipamentoNome, o.clienteNome, o.tecnicoNome, o.tipoAtendimento));
        return lista.length === 0 ? <Vazio>Nenhuma OS registrada.</Vazio> : (
          <ul className="space-y-2">
            {lista.slice(0, 100).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <CheckCircle2 size={18} className={o.tipoAtendimento === "Corretiva" ? "text-orange-600" : "text-emerald-600"} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-rbs-navy">{o.equipamentoNome || "Equipamento"} <span className="text-xs font-semibold text-slate-500">• {o.tipoAtendimento || "Preventiva"}</span></p>
                  <p className="text-xs text-slate-500">{paraData(o.dataExecucao)?.toLocaleString("pt-BR")} • {o.tecnicoNome || "—"}{!cliente && o.clienteNome && ` • ${o.clienteNome}`}</p>
                </div>
                <Link to={`/relatorios/pmoc/${o.id}`} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">📄 PDF</Link>
              </li>
            ))}
            {lista.length > 100 && <p className="text-center text-xs text-slate-500">Mostrando as 100 mais recentes. Veja todas em <Link to="/ordens-servico" className="font-bold text-blue-700">Ordens de Serviço</Link>.</p>}
          </ul>
        );
      })()}

      {aba === "garantias" && (() => {
        const lista = v.garantias.map((g) => ({ ...g, st: statusGarantia(g) })).filter((g) => casa(g.clienteNome, g.descricao));
        return lista.length === 0 ? <Vazio>Nenhuma garantia registrada.</Vazio> : (
          <ul className="grid gap-2 md:grid-cols-2">
            {lista.map((g) => (
              <li key={g.id}>
                <Link to="/garantias" className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md">
                  <ShieldCheck size={20} className="text-amber-600" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-bold text-rbs-navy">{g.descricao} <Badge cor={g.st.cor}>{g.st.rotulo}</Badge></span>
                    <span className="block text-xs text-slate-500">{!cliente && `${g.clienteNome} • `}até {dataBR(fimGarantia(g))}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        );
      })()}

      {aba === "financeiro" && isAdmin && (
        <div className="grid gap-3 lg:grid-cols-2">
          <section className="space-y-2">
            <h2 className="flex items-center gap-1.5 px-1 font-extrabold text-rbs-navy"><HandCoins size={18} /> Cobranças PMOC</h2>
            {v.cobrancas.filter((c) => casa(c.clienteNome, c.descricao)).length === 0 ? <Vazio>Nenhuma cobrança gerada.</Vazio> : v.cobrancas.filter((c) => casa(c.clienteNome, c.descricao)).map((c) => {
              const st = statusCobranca(c);
              return (
                <Link key={c.id} to="/financeiro/cobrancas" className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md">
                  {st.vencida && <AlertTriangle size={16} className="text-red-600" />}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-rbs-navy">{nomeMes(c.mesReferencia)} <Badge cor={st.cor}>{st.rotulo}</Badge></span>
                    <span className="block text-xs text-slate-500">{!cliente && `${c.clienteNome} • `}vence {dataBR(c.vencimento)}</span>
                  </span>
                  <span className="font-extrabold text-green-700">{brl(c.valor)}</span>
                </Link>
              );
            })}
          </section>
          <section className="space-y-2">
            <h2 className="flex items-center gap-1.5 px-1 font-extrabold text-rbs-navy"><FileText size={18} /> Orçamentos</h2>
            {v.orcamentos.filter((o) => casa(o.clienteNome, o.objeto)).length === 0 ? <Vazio>Nenhum orçamento.</Vazio> : v.orcamentos.filter((o) => casa(o.clienteNome, o.objeto)).slice(0, 30).map((o) => (
              <Link key={o.id} to={`/orcamentos/${o.id}/pdf`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-rbs-navy">#{numeroFmt(o.numero)} <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${CORES_STATUS[o.status] || CORES_STATUS.Rascunho}`}>{o.status}</span></span>
                  <span className="block truncate text-xs text-slate-500">{!cliente && `${o.clienteNome} • `}{o.objeto || `${o.qtdServicos || 1} item(ns)`}</span>
                </span>
                <span className="font-extrabold text-green-700">{brl(o.valorTotal)}</span>
              </Link>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
