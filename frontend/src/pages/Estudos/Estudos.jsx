import { useState } from "react";
import { modulo } from "../../data/menu";
import { SERIES, TOTAL_FICHAS } from "../../data/fichas";
import { Busca, Cabecalho, Filtros, Vazio } from "../../components/ui";
import FichasSecao from "./FichasSecao";
import SalvarOffline from "./SalvarOffline";

const MOD = modulo("/estudos");

// Todos os PDFs de estudo, para o botão "Salvar offline".
const TODOS_PDFS = SERIES.flatMap((s) => [s.pdf, ...s.fichas.map((f) => f.pdf)]);

const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Estudos() {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");

  const termo = normalizar(busca.trim());
  const series = SERIES
    .filter((s) => filtro === "todas" || filtro === s.id)
    .map((s) => ({ ...s, visiveis: s.fichas.filter((f) => !termo || normalizar([f.titulo, f.sub, f.atencao, f.chave, ...f.partes.flat(), ...f.exemplo.flat()].join(" ")).includes(termo)) }))
    .filter((s) => s.visiveis.length > 0);
  const opcoes = [
    { valor: "todas", rotulo: "Todas", qtd: TOTAL_FICHAS },
    ...SERIES.map((s) => ({ valor: s.id, rotulo: s.nome, qtd: s.fichas.length })),
  ];

  return (
    <div className="space-y-4">
      <Cabecalho modulo={MOD} subtitulo={`${TOTAL_FICHAS} fichas visuais com simulado e exemplos resolvidos`} />

      <SalvarOffline urls={TODOS_PDFS} />

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar ficha, fórmula ou termo (ex.: Pt100, degelo, 4–20 mA)" />
        <Filtros opcoes={opcoes} valor={filtro} aoMudar={setFiltro} />
      </div>

      {series.length === 0 && <Vazio>Nenhuma ficha encontrada para “{busca}”.</Vazio>}

      {series.map((s) => <FichasSecao key={s.id} serie={s} visiveis={s.visiveis} />)}
    </div>
  );
}
