import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { BookOpen, Percent, Plus, RotateCcw, Trash2 } from "lucide-react";
import { db } from "../../services/firebase";
import { TIPOS_ITEM, brl } from "../../lib/orcamentos";
import { CATALOGO, CATEGORIAS_CATALOGO } from "../../data/catalogoRefrigeracao";
import { Busca, Filtros } from "../../components/ui";

const CAMPO = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const UNIDADES = ["un", "m", "m²", "kg", "par", "rolo", "h", "serviço", "un/mês", "pç", "cx"];
const VAZIO = { nome: "", tipo: "Mão de Obra", unidade: "un", preco: "", categoria: "Outros" };
const MERCADO = new Map(CATALOGO.map((c) => [c.nome.toLowerCase(), c]));

// Copia o catálogo de mercado para a tabela, sem duplicar nomes já existentes.
async function importarFaltantes(itens) {
  const existentes = new Set(itens.map((i) => (i.nome || "").trim().toLowerCase()));
  const novos = CATALOGO.filter((c) => !existentes.has(c.nome.toLowerCase()));
  for (let i = 0; i < novos.length; i += 400) {
    const lote = writeBatch(db);
    novos.slice(i, i + 400).forEach((c) => lote.set(doc(collection(db, "tabela_precos")), {
      nome: c.nome, tipo: c.tipo, unidade: c.unidade, preco: c.preco, categoria: c.cat, precoMercado: c.preco, criadoEm: serverTimestamp(),
    }));
    await lote.commit();
  }
  return novos.length;
}

// Linha editável: altera nome, unidade e valor direto na lista (salva ao sair do campo).
function Linha({ item, aoSalvar, aoExcluir }) {
  const [v, setV] = useState({ nome: item.nome, unidade: item.unidade, preco: item.preco });
  const [salvo, setSalvo] = useState(false);
  const timer = useRef(null);
  useEffect(() => { setV({ nome: item.nome, unidade: item.unidade, preco: item.preco }); }, [item.nome, item.unidade, item.preco]);
  const ref = MERCADO.get((item.nome || "").toLowerCase());
  const mercado = item.precoMercado ?? ref?.preco;

  async function salvar(campo) {
    const valor = campo === "preco" ? Number(v.preco) : String(v[campo]).trim();
    if (campo === "preco" && !(valor >= 0)) return;
    if (campo === "nome" && !valor) return setV((x) => ({ ...x, nome: item.nome }));
    if (valor === item[campo]) return;
    await aoSalvar(item, { [campo]: valor });
    setSalvo(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSalvo(false), 1500);
  }

  return (
    <li className="flex flex-wrap items-center gap-2 px-3 py-2">
      <div className="min-w-[220px] flex-1">
        <input aria-label="Descrição" className="w-full rounded-lg border border-transparent px-2 py-1.5 text-sm font-semibold text-rbs-navy hover:border-slate-200 focus:border-blue-400 focus:outline-none" value={v.nome} onChange={(e) => setV({ ...v, nome: e.target.value })} onBlur={() => salvar("nome")} />
        {mercado !== undefined && Number(mercado) !== Number(item.preco) && (
          <p className="flex items-center gap-2 px-2 text-[11px] text-slate-500">
            Mercado: {brl(mercado)}
            <button onClick={() => aoSalvar(item, { preco: Number(mercado) })} className="inline-flex items-center gap-0.5 font-bold text-blue-700"><RotateCcw size={11} /> usar</button>
          </p>
        )}
      </div>
      <input aria-label="Unidade" list="unidades" className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={v.unidade} onChange={(e) => setV({ ...v, unidade: e.target.value })} onBlur={() => salvar("unidade")} />
      <div className="relative w-32">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">R$</span>
        <input aria-label="Valor" type="number" min="0" step="0.01" className={`w-full rounded-lg border px-2 py-1.5 pl-7 text-right text-sm font-bold ${salvo ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 text-green-700"}`} value={v.preco} onChange={(e) => setV({ ...v, preco: e.target.value })} onBlur={() => salvar("preco")} />
      </div>
      <button aria-label={`Excluir ${item.nome}`} onClick={() => aoExcluir(item)} className="p-1 text-slate-300 hover:text-red-600"><Trash2 size={16} /></button>
    </li>
  );
}

export default function TabelaPrecos() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [tipo, setTipo] = useState("Mão de Obra");
  const [busca, setBusca] = useState("");
  const [reajuste, setReajuste] = useState("");

  async function ler() {
    const snap = await getDocs(collection(db, "tabela_precos"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async function carregar() {
    try {
      let lista = await ler();
      // Primeira vez (tabela vazia): já vem preenchida com os valores de mercado.
      if (lista.length === 0) {
        const n = await importarFaltantes(lista);
        if (n) { lista = await ler(); setAviso(`Tabela criada com ${n} itens de mão de obra e materiais a valores médios de mercado. Edite à vontade.`); }
      }
      setItens(lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")));
    } catch (e) {
      setErro("Não foi possível carregar a tabela. " + e.message);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { carregar(); }, []);

  async function atualizar(item, dados) {
    try {
      await updateDoc(doc(db, "tabela_precos", item.id), dados);
      setItens((l) => l.map((x) => (x.id === item.id ? { ...x, ...dados } : x)));
    } catch (e) {
      setErro("Não foi possível salvar: " + e.message);
    }
  }

  async function adicionar(e) {
    e.preventDefault();
    if (!form.nome.trim() || form.preco === "") return;
    setSalvando(true);
    try {
      await addDoc(collection(db, "tabela_precos"), { ...form, tipo, nome: form.nome.trim(), preco: Number(form.preco), criadoEm: serverTimestamp() });
      setForm({ ...VAZIO, tipo: form.tipo, categoria: form.categoria });
      setItens(await ler().then((l) => l.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))));
    } catch (e2) {
      setErro("Não foi possível adicionar: " + e2.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(item) {
    if (!window.confirm(`Excluir "${item.nome}" da tabela? Orçamentos já criados não mudam.`)) return;
    try {
      await deleteDoc(doc(db, "tabela_precos", item.id));
      setItens((l) => l.filter((x) => x.id !== item.id));
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  async function importarCatalogo() {
    setSalvando(true);
    try {
      const n = await importarFaltantes(itens);
      setAviso(n ? `${n} itens de mercado adicionados.` : "Todos os itens de mercado já estão na sua tabela.");
      if (n) setItens((await ler()).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")));
    } catch (e) {
      setErro("Não foi possível importar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  const termo = busca.trim().toLowerCase();
  const doTipo = itens.filter((i) => (i.tipo || "Mão de Obra") === tipo);
  const visiveis = doTipo.filter((i) => !termo || (i.nome || "").toLowerCase().includes(termo));

  // Reajuste em % de todos os itens visíveis (ex.: 10 = +10%, -5 = -5%).
  async function aplicarReajuste() {
    const pct = Number(reajuste);
    if (!pct || !visiveis.length) return;
    if (!window.confirm(`Aplicar ${pct > 0 ? "+" : ""}${pct}% em ${visiveis.length} item(ns) de ${tipo}${termo ? ` filtrados por "${busca}"` : ""}?`)) return;
    setSalvando(true);
    try {
      const lote = writeBatch(db);
      const novos = new Map();
      visiveis.forEach((i) => {
        const preco = Math.round(Number(i.preco || 0) * (1 + pct / 100) * 100) / 100;
        novos.set(i.id, preco);
        lote.update(doc(db, "tabela_precos", i.id), { preco });
      });
      await lote.commit();
      setItens((l) => l.map((x) => (novos.has(x.id) ? { ...x, preco: novos.get(x.id) } : x)));
      setReajuste("");
      setAviso(`Reajuste de ${pct}% aplicado em ${novos.size} item(ns).`);
    } catch (e) {
      setErro("Não foi possível reajustar: " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  // Agrupa por categoria (as do catálogo primeiro).
  const grupos = useMemo(() => {
    const ordem = [...CATEGORIAS_CATALOGO, "Outros"];
    const mapa = new Map();
    visiveis.forEach((i) => {
      const cat = i.categoria || MERCADO.get((i.nome || "").toLowerCase())?.cat || "Outros";
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat).push(i);
    });
    return [...mapa.entries()].sort((a, b) => (ordem.indexOf(a[0]) + 99) % 99 - (ordem.indexOf(b[0]) + 99) % 99);
  }, [visiveis]);

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <datalist id="unidades">{UNIDADES.map((u) => <option key={u} value={u} />)}</datalist>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-rbs-navy">Tabela de Preços</h1>
          <p className="text-sm text-slate-500">Mão de obra e materiais • clique no nome, unidade ou valor para editar</p>
        </div>
        <button onClick={importarCatalogo} disabled={salvando} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          <BookOpen size={16} /> Completar com itens de mercado
        </button>
      </div>
      {erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</p>}
      {aviso && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{aviso}</p>}

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm">
        {TIPOS_ITEM.map((t) => (
          <button key={t} aria-pressed={tipo === t} onClick={() => setTipo(t)} className={`rounded-xl py-2.5 text-sm font-extrabold ${tipo === t ? "bg-rbs text-white" : "bg-slate-100 text-slate-700"}`}>
            {t === "Material" ? "Materiais" : t} <span className="font-semibold opacity-75">({itens.filter((i) => (i.tipo || "Mão de Obra") === t).length})</span>
          </button>
        ))}
      </div>

      <form onSubmit={adicionar} className="grid gap-2 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-[1fr_150px_90px_110px_auto]">
        <input aria-label="Novo item" required placeholder={`Novo item de ${tipo === "Material" ? "material" : "mão de obra"}`} className={CAMPO} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <select aria-label="Categoria" className={CAMPO} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
          {[...CATEGORIAS_CATALOGO, "Outros"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <input aria-label="Unidade" list="unidades" placeholder="Un." className={CAMPO} value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} />
        <input aria-label="Preço" required type="number" min="0" step="0.01" placeholder="R$" className={CAMPO} value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
        <button disabled={salvando} className="inline-flex items-center justify-center gap-1 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} /> Adicionar</button>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Busca valor={busca} aoMudar={setBusca} placeholder={`Buscar em ${tipo === "Material" ? "materiais" : "mão de obra"}...`} />
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm">
          <Percent size={16} className="ml-2 text-slate-500" />
          <input aria-label="Reajuste em %" type="number" step="0.1" placeholder="Reajuste %" className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={reajuste} onChange={(e) => setReajuste(e.target.value)} />
          <button onClick={aplicarReajuste} disabled={salvando || !Number(reajuste)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">Aplicar</button>
        </div>
      </div>

      {carregando ? <p className="text-sm text-gray-500">Carregando...</p> : visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhum item. Use “Completar com itens de mercado” ou adicione acima.</p>
      ) : grupos.map(([cat, lista]) => (
        <section key={cat} className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h2 className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 text-sm font-extrabold text-rbs-navy">
            {cat} <span className="text-xs font-semibold text-slate-500">{lista.length} item(ns)</span>
          </h2>
          <ul className="divide-y divide-slate-100">
            {lista.map((i) => <Linha key={i.id} item={i} aoSalvar={atualizar} aoExcluir={excluir} />)}
          </ul>
        </section>
      ))}
      <p className="text-center text-[11px] text-slate-400">Valores de mercado = médias de referência (RJ, 2026). Ajuste conforme região, acesso e fornecedores.</p>
    </div>
  );
}
