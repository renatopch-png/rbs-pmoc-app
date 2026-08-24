import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginComGoogle } from "../services/authService";

export default function Login() {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    setErro("");
    setCarregando(true);
    try {
      await loginComGoogle();
      navigate("/");
    } catch (e) {
      setErro(e.message || "Falha ao entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rbs-light">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-rbs mb-1">RBS PMOC</h1>
        <p className="text-sm text-gray-500 mb-8">
          Refrigeração Elétrica • Energia Solar • Engenharia Térmica
        </p>

        <button
          onClick={handleLogin}
          disabled={carregando}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            className="w-5 h-5"
          />
          {carregando ? "Entrando..." : "Entrar com Google"}
        </button>

        {erro && <p className="text-red-600 text-sm mt-4">{erro}</p>}

        <p className="text-xs text-gray-400 mt-8">
          Acesso restrito a usuários autorizados pelo administrador.
        </p>
      </div>
    </div>
  );
}
