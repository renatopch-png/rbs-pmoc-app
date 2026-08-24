import { useEffect, useState } from "react";

// Captura o evento 'beforeinstallprompt' (Android/Chrome/Edge) para permitir
// disparar a instalação por um botão dentro do próprio app.
// No iOS (Safari) esse evento não existe — lá a instalação é manual via
// "Compartilhar > Adicionar à Tela de Início".
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [instalavel, setInstalavel] = useState(false);

  useEffect(() => {
    function handler(e) {
      e.preventDefault();
      setPromptEvent(e);
      setInstalavel(true);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function instalar() {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
    setInstalavel(false);
  }

  return { instalavel, instalar };
}
