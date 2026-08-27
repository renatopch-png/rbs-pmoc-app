import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import InstallBanner from "./components/layout/InstallBanner";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ListaClientes from "./pages/Clientes/ListaClientes";
import ListaEquipamentos from "./pages/Equipamentos/ListaEquipamentos";
import PublicoEquipamento from "./pages/Equipamentos/PublicoEquipamento";
import Cronograma from "./pages/Cronograma";
import ListaOS from "./pages/OrdemServico/ListaOS";
import ExecucaoOS from "./pages/OrdemServico/ExecucaoOS";
import GeradorPMOC from "./pages/Relatorios/GeradorPMOC";
import GeradorPMOCConsolidado from "./pages/Relatorios/GeradorPMOCConsolidado";
import RelatorioPublico from "./pages/Relatorios/RelatorioPublico";
import GeradorART from "./pages/Relatorios/GeradorART";
import GeradorContrato from "./pages/Relatorios/GeradorContrato";
import Agendador from "./pages/Relatorios/Agendador";
import Relatorios from "./pages/Relatorios/Relatorios";

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
      </Routes>
      <InstallBanner />
    </>
  );
}
