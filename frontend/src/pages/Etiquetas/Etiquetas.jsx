import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import QRCode from "qrcode.react";
import { Printer } from "lucide-react";
import { modulo } from "../../data/menu";
import { DADOS_RBS } from "../../services/ServicoWhatsApp";
import { paraData } from "../../lib/agenda";
import { dataBR, lerColecao, paraInput, somarPeriodo } from "../../lib/modulos";
import { BOTAO, CAMPO, Cabecalho, Campo, Vazio } from "../../components/ui";

const MOD = modulo("/etiquetas");

// Formatos de impressão. "pagina" = tamanho da folha; "etiqueta" = cada etiqueta.
const FORMATOS = {
  "100x50": { nome: "Térmica 100 × 50 mm", pagina: "100mm 50mm", w: 100, h: 50, porPagina: 1 },
  "60x40": { nome: "Térmica 60 × 40 mm", pagina: "60mm 40mm", w: 60, h: 40, porPagina: 1 },
  "a4": { nome: "Folha A4 — 10 etiquetas (99 × 55 mm)", pagina: "A4", w: 99, h: 55, porPagina: 10 },
};

// Informações que podem aparecer na etiqueta (escolha salva no aparelho).
const CAMPOS = [
  ["empresa", "Nome da empresa", true],
  ["cliente", "Cliente", true],
  ["equipamento", "Nome do equipamento", true],
  ["detalhes", "Tipo, capacidade e local", true],
  ["marca", "Marca e modelo", false],
  ["serie", "Nº de série", false],
  ["gas", "Fluido refrigerante", false],
  ["periodicidade", "Periodicidade", false],
  ["manutencao", "Data da manutenção", true],
  ["proxima", "Próxima manutenção", true],
  ["tecnico", "Técnico responsável", false],
  ["telefone", "Telefone da empresa", true],
  ["qr", "QR Code", true],
];
const CAMPOS_PADRAO = Object.fromEntries(CAMPOS.map(([id, , padrao]) => [id, padrao]));
const CHAVE_CAMPOS = "rbs.etiqueta.campos";
const lerCampos = () => {
  try { return { ...CAMPOS_PADRAO, textoLivre: "", ...JSON.parse(localStorage.getItem(CHAVE_CAMPOS) || "{}") }; } catch { return { ...CAMPOS_PADRAO, textoLivre: "" }; }
};

const nomeEq = (e) => e.nome || e.tipo || "Equipamento";
const detalheEq = (e) => [e.nome ? e.tipo : "", e.capacidade, e.local].filter(Boolean).join(" • ");
const linkPublico = (id) => `${window.location.origin}/eq/${id}`;

function Etiqueta({ item, formato, campos: c }) {
  const f = FORMATOS[formato];
  const pequeno = f.h <= 40;
  const qr = pequeno ? 26 : 34;
  const linha = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const menor = { ...linha, fontSize: pequeno ? "2.1mm" : "2.4mm", color: "#475569" };
  const e = item.e;
  const marca = [e.marca, e.modelo].filter(Boolean).join(" ");
  return (
    <div className="etiqueta" style={{
      width: `${f.w}mm`, height: `${f.h}mm`, boxSizing: "border-box", padding: pequeno ? "2mm" : "3mm",
      display: "flex", gap: "2.5mm", alignItems: "center", border: "0.3mm solid #0B5394", borderRadius: "2mm",
      background: "#fff", color: "#0f172a", fontFamily: "Arial, Helvetica, sans-serif", overflow: "hidden", breakInside: "avoid",
    }}>
      {c.qr && (
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <QRCode value={linkPublico(e.id)} renderAs="svg" size={256} level="M" includeMargin={false} style={{ width: `${qr}mm`, height: `${qr}mm`, display: "block" }} />
          <div style={{ fontSize: "1.9mm", marginTop: "0.8mm", color: "#475569" }}>Escaneie p/ histórico</div>
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
        {c.empresa && <div style={{ fontSize: pequeno ? "2.3mm" : "2.6mm", fontWeight: 800, color: "#0B5394", letterSpacing: "0.1mm" }}>RBS REFRIGERAÇÃO E ELÉTRICA</div>}
        {c.cliente && item.cliente && <div style={{ ...linha, fontSize: pequeno ? "2.9mm" : "3.4mm", fontWeight: 800, marginTop: "0.8mm" }}>{item.cliente}</div>}
        {c.equipamento && <div style={{ ...linha, fontSize: pequeno ? "2.6mm" : "3mm", fontWeight: 700 }}>{nomeEq(e)}</div>}
        {c.detalhes && detalheEq(e) && <div style={menor}>{detalheEq(e)}</div>}
        {c.marca && marca && <div style={menor}>{marca}</div>}
        {c.serie && e.numeroSerie && <div style={menor}>Série: {e.numeroSerie}</div>}
        {c.gas && e.tipoGas && <div style={menor}>Fluido: {e.tipoGas}</div>}
        {c.periodicidade && <div style={menor}>Manutenção {String(item.periodicidade).toLowerCase()}</div>}
        {c.manutencao && <div style={{ marginTop: "1mm", fontSize: pequeno ? "2.5mm" : "2.9mm" }}>Manutenção: <b>{dataBR(item.manut)}</b></div>}
        {c.proxima && (
          <div style={{ marginTop: "0.6mm", fontSize: pequeno ? "2.8mm" : "3.3mm", fontWeight: 800, color: "#b91c1c", border: "0.3mm solid #b91c1c", borderRadius: "1mm", padding: "0.3mm 1mm", display: "inline-block" }}>
            Próxima: {dataBR(item.prox)}
          </div>
        )}
        {c.tecnico && item.tecnico && <div style={{ ...menor, marginTop: "0.6mm" }}>Técnico: {item.tecnico}</div>}
        {c.textoLivre && <div style={{ ...linha, fontSize: pequeno ? "2.2mm" : "2.5mm", fontWeight: 700, marginTop: "0.6mm" }}>{c.textoLivre}</div>}
        {c.telefone && <div style={{ fontSize: "2.2mm", color: "#475569", marginTop: "0.8mm" }}>{DADOS_RBS.telefoneFmt}</div>}
      </div>
    </div>
  );
}

export default function Etiquetas() {
  const [params] = useSearchParams();
  const [dados, setDados] = useState(null);
  const [clienteId, setClienteId] = useState(params.get("cliente") || "");
  const [selecionados, setSelecionados] = useState(() => new Set((params.get("eq") || "").split(",").filter(Boolean)));
  const [base, setBase] = useState("ultima"); // "ultima" OS ou "hoje"
  const [datas, setDatas] = useState({}); // ajustes manuais por equipamento
  const [campos, setCampos] = useState(lerCampos);
  const [formato, setFormato] = useState(() => { try { return localStorage.getItem("rbs.etiqueta.formato") || "100x50"; } catch { return "100x50"; } });

  useEffect(() => {
    Promise.all(["clientes", "equipamentos", "ordens_servico", "preventivos"].map(lerColecao)).then(([clientes, equipamentos, ordens, preventivos]) => {
      clientes.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
      setDados({ clientes, equipamentos, ordens, preventivos });
    });
  }, []);

  // Datas sugeridas: manutenção = última OS (ou hoje); próxima = contrato ou periodicidade.
  const itens = useMemo(() => {
    if (!dados) return [];
    const nomeCli = new Map(dados.clientes.map((c) => [c.id, c.nome]));
    return dados.equipamentos
      .filter((e) => !clienteId || e.clienteId === clienteId)
      .sort((a, b) => nomeEq(a).localeCompare(nomeEq(b), "pt-BR"))
      .map((e) => {
        const osDoEq = dados.ordens.filter((o) => o.equipamentoId === e.id && paraData(o.dataExecucao)).sort((a, b) => paraData(b.dataExecucao) - paraData(a.dataExecucao));
        const ultimaOS = osDoEq[0] ? paraData(osDoEq[0].dataExecucao) : undefined;
        const tecnico = osDoEq[0]?.tecnicoNome || "";
        const contrato = dados.preventivos.find((p) => p.ativo !== false && (p.equipamentoIds || []).includes(e.id));
        const periodicidade = contrato?.periodicidade || e.periodicidade || "Mensal";
        const manutSug = base === "hoje" ? paraInput(new Date()) : (ultimaOS ? paraInput(ultimaOS) : "");
        let proxSug = "";
        if (base === "ultima" && contrato?.proximaData) proxSug = contrato.proximaData;
        else if (manutSug) proxSug = paraInput(somarPeriodo(manutSug, periodicidade));
        const ajuste = datas[e.id] || {};
        return { e, cliente: nomeCli.get(e.clienteId) || "", periodicidade, tecnico, manut: ajuste.manut ?? manutSug, prox: ajuste.prox ?? proxSug };
      });
  }, [dados, clienteId, base, datas]);

  const paraImprimir = itens.filter((i) => selecionados.has(i.e.id));
  const f = FORMATOS[formato];

  function alternar(id) {
    setSelecionados((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  const todosMarcados = itens.length > 0 && itens.every((i) => selecionados.has(i.e.id));
  const marcarTodos = () => setSelecionados(todosMarcados ? new Set() : new Set(itens.map((i) => i.e.id)));
  const ajustar = (id, campo, valor) => setDatas((d) => ({ ...d, [id]: { ...d[id], [campo]: valor } }));
  function mudarCampo(id, valor) {
    setCampos((atual) => {
      const novo = { ...atual, [id]: valor };
      try { localStorage.setItem(CHAVE_CAMPOS, JSON.stringify(novo)); } catch { /* opcional */ }
      return novo;
    });
  }

  function mudarFormato(v) {
    setFormato(v);
    try { localStorage.setItem("rbs.etiqueta.formato", v); } catch { /* opcional */ }
  }

  if (!dados) return <p className="p-4 text-sm text-slate-500">Carregando...</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      {/* Na impressão só a área das etiquetas aparece, no tamanho do formato escolhido. */}
      <style>{`
        #impressao-etiquetas { display: none; }
        @media print {
          @page { size: ${f.pagina}; margin: ${f.porPagina > 1 ? "10mm 6mm" : "0"}; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body > *:not(#impressao-etiquetas) { display: none !important; }
          #impressao-etiquetas { display: ${f.porPagina > 1 ? "grid" : "block"} !important; grid-template-columns: repeat(2, ${f.w}mm); }
          ${f.porPagina === 1 ? "#impressao-etiquetas .etiqueta { border-radius: 0 !important; } #impressao-etiquetas .etiqueta:not(:last-child) { break-after: page; }" : ""}
        }
      `}</style>

      <div className="space-y-3">
        <Cabecalho modulo={MOD} subtitulo="Cliente, equipamento, QR Code, data da manutenção e da próxima">
          <button disabled={!paraImprimir.length} onClick={() => window.print()} className={BOTAO}>
            <Printer size={16} /> Imprimir {paraImprimir.length || ""}
          </button>
        </Cabecalho>

        <div className="grid gap-2 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-3">
          <Campo rotulo="Cliente">
            <select className={CAMPO} value={clienteId} onChange={(e) => { setClienteId(e.target.value); setSelecionados(new Set()); }}>
              <option value="">Todos os clientes</option>
              {dados.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Data da manutenção">
            <select className={CAMPO} value={base} onChange={(e) => { setBase(e.target.value); setDatas({}); }}>
              <option value="ultima">Última OS registrada</option>
              <option value="hoje">Hoje (serviço feito agora)</option>
            </select>
          </Campo>
          <Campo rotulo="Formato">
            <select className={CAMPO} value={formato} onChange={(e) => mudarFormato(e.target.value)}>
              {Object.entries(FORMATOS).map(([id, x]) => <option key={id} value={id}>{x.nome}</option>)}
            </select>
          </Campo>
        </div>

        <details className="rounded-2xl bg-white p-4 shadow-sm" open>
          <summary className="cursor-pointer text-sm font-extrabold text-rbs-navy">Informações na etiqueta</summary>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {CAMPOS.map(([id, rotulo]) => (
              <label key={id} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={!!campos[id]} onChange={(e) => mudarCampo(id, e.target.checked)} /> {rotulo}
              </label>
            ))}
          </div>
          <label className="mt-3 block text-xs font-bold text-slate-600">Texto livre (opcional)
            <input className={`${CAMPO} mt-1`} maxLength={60} placeholder="Ex.: Não desligar o disjuntor sem autorização" value={campos.textoLivre} onChange={(e) => mudarCampo("textoLivre", e.target.value)} />
          </label>
          <p className="mt-2 text-xs text-slate-500">Dica: na etiqueta pequena (60 × 40 mm), use poucas informações para não cortar o texto.</p>
        </details>

        {itens.length === 0 ? <Vazio>Nenhum equipamento {clienteId ? "deste cliente" : "cadastrado"}.</Vazio> : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <label className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={todosMarcados} onChange={marcarTodos} /> Selecionar todos ({itens.length})
            </label>
            <ul className="divide-y divide-slate-100">
              {itens.map((i) => (
                <li key={i.e.id} className="flex flex-wrap items-center gap-3 px-4 py-2">
                  <label className="flex min-w-0 flex-1 items-center gap-2">
                    <input type="checkbox" checked={selecionados.has(i.e.id)} onChange={() => alternar(i.e.id)} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-rbs-navy">{nomeEq(i.e)}</span>
                      <span className="block truncate text-xs text-slate-500">{[!clienteId && i.cliente, detalheEq(i.e), i.periodicidade].filter(Boolean).join(" • ")}</span>
                    </span>
                  </label>
                  <label className="text-[11px] font-semibold text-slate-500">Manutenção
                    <input type="date" className="ml-1 rounded-lg border border-slate-300 px-2 py-1 text-xs" value={i.manut} onChange={(e) => ajustar(i.e.id, "manut", e.target.value)} />
                  </label>
                  <label className="text-[11px] font-semibold text-slate-500">Próxima
                    <input type="date" className="ml-1 rounded-lg border border-slate-300 px-2 py-1 text-xs" value={i.prox} onChange={(e) => ajustar(i.e.id, "prox", e.target.value)} />
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {paraImprimir.length > 0 && <h2 className="px-1 text-sm font-extrabold uppercase tracking-wide text-slate-500">Prévia</h2>}
      </div>

      <div className="flex flex-wrap gap-3">
        {paraImprimir.map((i) => <Etiqueta key={i.e.id} item={i} formato={formato} campos={campos} />)}
      </div>

      {/* Cópia fora do layout do app: só ela aparece na impressão. */}
      {createPortal(
        <div id="impressao-etiquetas">{paraImprimir.map((i) => <Etiqueta key={i.e.id} item={i} formato={formato} campos={campos} />)}</div>,
        document.body,
      )}
    </div>
  );
}
