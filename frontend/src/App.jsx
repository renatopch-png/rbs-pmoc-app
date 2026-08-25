import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import InstallBanner from "./components/layout/InstallBanner";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ListaClientes from "./pages/Clientes/ListaClientes";
import ListaEquipamentos from "./pages/Equipamentos/ListaEquipamentos";
import Cronograma from "./pages/Cronograma";
import ListaOS from "./pages/OrdemServico/ListaOS";
import ExecucaoOS from "./pages/OrdemServico/ExecucaoOS";
import Relatorios from "./pages/Relatorios/Relatorios";

function Privada({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Privada><Dashboard /></Privada>} />
      <Route path="/clientes" element={<Privada><ListaClientes /></Privada>} />
      <Route path="/equipamentos" element={<Privada><ListaEquipamentos /></Privada>} />
      <Route path="/cronograma" element={<Privada><Cronograma /></Privada>} />
      <Route path="/ordens-servico" element={<Privada><ListaOS /></Privada>} />
      <Route path="/ordens-servico/executar/:equipamentoId" element={<Privada><ExecucaoOS /></Privada>} />
      <Route path="/relatorios" element={<Privada><Relatorios /></Privada>} />
    </Routes>
    <InstallBanner />
    </>
  );
}
