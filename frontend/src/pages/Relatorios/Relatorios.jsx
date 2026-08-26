// Este arquivo delega toda a lógica para o novo RelatoriosPDF.jsx
// (que ganhou exportação em PDF, além do CSV que já existia), sem
// precisar mexer na rota /relatorios já registrada em App.jsx.
import RelatoriosPDF from "./RelatoriosPDF";

export default function Relatorios() {
  return <RelatoriosPDF />;
}
