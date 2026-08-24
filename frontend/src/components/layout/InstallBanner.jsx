import { useInstallPrompt } from "../../hooks/useInstallPrompt";

export default function InstallBanner() {
  const { instalavel, instalar } = useInstallPrompt();

  if (!instalavel) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-rbs-dark text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
      <span className="text-sm">Instalar o RBS PMOC na tela inicial?</span>
      <button
        onClick={instalar}
        className="bg-white text-rbs-dark text-sm font-semibold rounded-lg px-3 py-1.5"
      >
        Instalar
      </button>
    </div>
  );
}
