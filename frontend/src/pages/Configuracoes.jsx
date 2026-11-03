import { useState } from "react";
import { DatabaseBackup, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { baixarArquivo, gerarBackup } from "../lib/backup";
import { sincronizarTodos } from "../lib/historicoPublico";

export default function Configuracoes() {
  const { isAdmin } = useAuth();
  const [ocupado, setOcupado] = useState("");
  const [aviso, setAviso] = useState(null);

  async function executar(nome, acao) {
    setOcupado(nome);
    setAviso(null);
    try {
      setAviso({ ok: true, texto: await acao() });
    } catch (e) {
      setAviso({ ok: false, texto: "Não foi possível concluir: " + e.message });
    } finally {
      setOcupado("");
    }
  }

  const fazerBackup = () => executar("backup", async () => {
    const backup = await gerarBackup();
    baixarArquivo(backup);
    const { clientes, equipamentos, ordens_servico: os } = backup.colecoes;
    return `Backup baixado: ${clientes.length} clientes, ${equipamentos.length} equipamentos e ${os.length} ordens de serviço.`;
  });
  const sincronizar = () => executar("sync", async () => `Histórico público atualizado em ${await sincronizarTodos()} equipamentos.`);

  if (!isAdmin) {
    return <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm">Esta área é restrita ao administrador.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-extrabold text-rbs-navy">Configurações</h1>
      {aviso && <p role="status" className={`rounded-xl p-3 text-sm font-semibold ${aviso.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{aviso.texto}</p>}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold text-rbs-navy">Backup do banco de dados</h2>
        <p className="mt-1 text-sm text-gray-600">Baixa um arquivo com os registros do sistema, sem alterar nada. Fotos e assinaturas ficam no Storage; o arquivo guarda apenas os links delas.</p>
        <button disabled={!!ocupado} onClick={fazerBackup} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <DatabaseBackup size={16} /> {ocupado === "backup" ? "Gerando..." : "Baixar backup"}
        </button>
      </section>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold text-rbs-navy">Histórico público do QR Code</h2>
        <p className="mt-1 text-sm text-gray-600">Atualiza o resumo de manutenções mostrado a quem escaneia o QR Code. As ordens de serviço não são alteradas.</p>
        <button disabled={!!ocupado} onClick={sincronizar} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rbs px-4 py-2 text-sm font-semibold text-rbs disabled:opacity-50">
          <RefreshCw size={16} /> {ocupado === "sync" ? "Atualizando..." : "Atualizar histórico"}
        </button>
      </section>
    </div>
  );
}
