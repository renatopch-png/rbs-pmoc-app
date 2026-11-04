import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { CATALOGO, CATEGORIAS_CATALOGO } from "../data/catalogoRefrigeracao";
import { brl } from "../lib/orcamentos";
import { Busca, Filtros, Painel } from "./ui";

// Janela do catálogo: adiciona serviços/materiais ao orçamento. Se o item
// existir na Tabela de Preços (mesmo nome), usa o seu preço no lugar da média.
export default function CatalogoServicos({ precos = [], aoAdicionar, aoFechar }) {
  const [cat, setCat] = useState(CATEGORIAS_CATALOGO[0]);
  const [busca, setBusca] = useState("");
  const [adicionados, setAdicionados] = useState({});
  const meuPreco = new Map(precos.map((p) => [p.nome.trim().toLowerCase(), p]));
  const termo = busca.trim().toLowerCase();
  const lista = CATALOGO.filter((i) => (termo ? i.nome.toLowerCase().includes(termo) : i.cat === cat));

  function adicionar(i) {
    const proprio = meuPreco.get(i.nome.toLowerCase());
    aoAdicionar({ descricao: i.nome, tipo: i.tipo, qtd: 1, unidade: i.unidade, valorUnit: proprio ? proprio.preco : i.preco });
    setAdicionados((a) => ({ ...a, [i.nome]: (a[i.nome] || 0) + 1 }));
  }

  return (
    <Painel titulo="Catálogo de serviços e materiais" aoFechar={aoFechar}>
      <div className="space-y-3">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar: split, carga de gás, cobre, capacitor..." />
        {!termo && <Filtros valor={cat} aoMudar={setCat} opcoes={CATEGORIAS_CATALOGO.map((c) => ({ valor: c, rotulo: c }))} />}
        <ul className="max-h-[50vh] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
          {lista.map((i) => {
            const proprio = meuPreco.get(i.nome.toLowerCase());
            const n = adicionados[i.nome];
            return (
              <li key={i.nome} className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{i.nome}</p>
                  <p className="text-xs text-slate-500">
                    {i.tipo} • {i.unidade} • {proprio ? <b className="text-emerald-700">{brl(proprio.preco)} (sua tabela)</b> : <>{brl(i.preco)} <span className="text-slate-400">(média)</span></>}
                  </p>
                </div>
                <button type="button" onClick={() => adicionar(i)} className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${n ? "bg-emerald-100 text-emerald-800" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                  {n ? <><Check size={14} /> {n}×</> : <><Plus size={14} /> Adicionar</>}
                </button>
              </li>
            );
          })}
          {lista.length === 0 && <li className="p-4 text-center text-sm text-slate-500">Nada encontrado.</li>}
        </ul>
        <p className="text-[11px] text-slate-500">Valores médios de referência (RJ, 2026). Ajuste quantidade e valor no orçamento. Para usar seus valores sempre, importe o catálogo em <b>Tabela de Preços</b> e edite lá.</p>
        <button type="button" onClick={aoFechar} className="w-full rounded-xl bg-rbs py-2 text-sm font-semibold text-white">Concluir</button>
      </div>
    </Painel>
  );
}
