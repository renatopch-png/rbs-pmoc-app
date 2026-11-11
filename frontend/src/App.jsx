import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import InstallBanner from "./components/layout/InstallBanner";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ListaClientes from "./pages/Clientes/ListaClientes";
import ListaEquipamentos from "./pages/Equipamentos/ListaEquipamentos";
import PublicoEquipamento from "./pages/Equipamentos/PublicoEquipamento";
import ListaOS from "./pages/OrdemServico/ListaOS";
import ExecucaoOS from "./pages/OrdemServico/ExecucaoOS";
import GeradorPMOC from "./pages/Relatorios/GeradorPMOC";
import GeradorPMOCConsolidado from "./pages/Relatorios/GeradorPMOCConsolidado";
import RelatorioPublico from "./pages/Relatorios/RelatorioPublico";
import GeradorART from "./pages/Relatorios/GeradorART";
import GeradorContrato from "./pages/Relatorios/GeradorContrato";
import Agendador from "./pages/Relatorios/Agendador";
import Relatorios from "./pages/Relatorios/Relatorios";
import EmBreve from "./pages/EmBreve";
import Configuracoes from "./pages/Configuracoes";
import ListaOrcamentos from "./pages/Orcamentos/ListaOrcamentos";
import FormOrcamento from "./pages/Orcamentos/FormOrcamento";
import PDFOrcamento from "./pages/Orcamentos/PDFOrcamento";
import ReciboOrcamento from "./pages/Orcamentos/ReciboOrcamento";
import GarantiaOrcamento from "./pages/Orcamentos/GarantiaOrcamento";
import TabelaPrecos from "./pages/Orcamentos/TabelaPrecos";
import Financeiro from "./pages/Financeiro/Financeiro";
import Extrato from "./pages/Financeiro/Extrato";
import ContasFixas from "./pages/Financeiro/ContasFixas";
import CobrancasPMOC from "./pages/Financeiro/CobrancasPMOC";
import DemonstrativoCobranca from "./pages/Financeiro/DemonstrativoCobranca";
import ReciboCobranca from "./pages/Financeiro/ReciboCobranca";
import GestaoEquipe from "./pages/Equipe/GestaoEquipe";
import Garantias from "./pages/Garantias/Garantias";
import Preventivo from "./pages/Preventivo/Preventivo";
import ListaLaudos from "./pages/Laudos/ListaLaudos";
import FormLaudo from "./pages/Laudos/FormLaudo";
import PDFLaudo from "./pages/Laudos/PDFLaudo";
import Anotacoes from "./pages/Anotacoes/Anotacoes";
import CentralManutencoes from "./pages/Manutencoes/CentralManutencoes";
import Etiquetas from "./pages/Etiquetas/Etiquetas";
// Carregada sob demanda: o material de estudo (fichas, mapas, prática) é grande.
const Estudos = lazy(() => import("./pages/Estudos/Estudos"));
import { MODULOS_EM_BREVE } from "./data/menu";

function Privada({ children }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Públicas (sem autenticação) */}
        <Route path="/eq/:equipamentoId" element={<PublicoEquipamento />} />
        <Route path="/relatorio/:osId" element={<RelatorioPublico />} />

        {/* Autenticadas */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Privada><Dashboard /></Privada>} />
        <Route path="/clientes" element={<Privada><ListaClientes /></Privada>} />
        <Route path="/equipamentos" element={<Privada><ListaEquipamentos /></Privada>} />
        <Route path="/cronograma" element={<Privada><Agendador /></Privada>} />
        <Route path="/ordens-servico" element={<Privada><ListaOS /></Privada>} />
        <Route path="/ordens-servico/executar/:equipamentoId" element={<Privada><ExecucaoOS /></Privada>} />
        <Route path="/relatorios/pmoc/:osId" element={<Privada><GeradorPMOC /></Privada>} />
        <Route path="/relatorios/pmoc-consolidado/:clienteId" element={<Privada><GeradorPMOCConsolidado /></Privada>} />
        <Route path="/relatorios/art/:osId" element={<Privada><GeradorART /></Privada>} />
        <Route path="/relatorios/contrato/:clienteId" element={<Privada><GeradorContrato /></Privada>} />
        <Route path="/relatorios" element={<Privada><Relatorios /></Privada>} />
        <Route path="/orcamentos" element={<Privada><ListaOrcamentos /></Privada>} />
        <Route path="/orcamentos/novo" element={<Privada><FormOrcamento /></Privada>} />
        <Route path="/orcamentos/:id" element={<Privada><FormOrcamento /></Privada>} />
        <Route path="/orcamentos/:id/pdf" element={<Privada><PDFOrcamento /></Privada>} />
        <Route path="/orcamentos/:id/recibo" element={<Privada><ReciboOrcamento /></Privada>} />
        <Route path="/orcamentos/:id/garantia" element={<Privada><GarantiaOrcamento /></Privada>} />
        <Route path="/tabela-precos" element={<Privada><TabelaPrecos /></Privada>} />
        <Route path="/financeiro" element={<Privada><Financeiro /></Privada>} />
        <Route path="/financeiro/extrato" element={<Privada><Extrato /></Privada>} />
        <Route path="/financeiro/cobrancas" element={<Privada><CobrancasPMOC /></Privada>} />
        <Route path="/financeiro/cobrancas/:id" element={<Privada><DemonstrativoCobranca /></Privada>} />
        <Route path="/financeiro/cobrancas/:id/recibo" element={<Privada><ReciboCobranca /></Privada>} />
        <Route path="/financeiro/contas-fixas" element={<Privada><ContasFixas /></Privada>} />
        <Route path="/equipe" element={<Privada><GestaoEquipe /></Privada>} />
        <Route path="/garantias" element={<Privada><Garantias /></Privada>} />
        <Route path="/preventivo" element={<Privada><Preventivo /></Privada>} />
        <Route path="/laudos" element={<Privada><ListaLaudos /></Privada>} />
        <Route path="/laudos/novo" element={<Privada><FormLaudo /></Privada>} />
        <Route path="/laudos/:id" element={<Privada><FormLaudo /></Privada>} />
        <Route path="/laudos/:id/pdf" element={<Privada><PDFLaudo /></Privada>} />
        <Route path="/etiquetas" element={<Privada><Etiquetas /></Privada>} />
        <Route path="/manutencoes" element={<Privada><CentralManutencoes /></Privada>} />
        <Route path="/estudos" element={<Privada><Suspense fallback={<p className="p-6 text-center text-sm text-slate-500">Carregando material de estudo…</p>}><Estudos /></Suspense></Privada>} />
        <Route path="/anotacoes" element={<Privada><Anotacoes /></Privada>} />
        <Route path="/configuracoes" element={<Privada><Configuracoes /></Privada>} />
        {MODULOS_EM_BREVE.map((m) => (
          <Route key={m.to} path={m.to} element={<Privada><EmBreve modulo={m} /></Privada>} />
        ))}
      </Routes>
      <InstallBanner />
    </>
  );
}
