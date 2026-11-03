import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { CalendarClock, ChevronDown, ChevronRight, ChevronUp, Eye, FileText, ReceiptText, RotateCcw, ShieldCheck, Trash2, Wrench } from "lucide-react";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { paraData } from "../../lib/agenda";
import { CORES_STATUS, brl, numeroFmt } from "../../lib/orcamentos";

function Acao({ icone: Icone, rotulo, cor, ...props }) {
  return (
    <button {...props} className="flex flex-1 items-center justify-center gap-2 rounded-lg p-2 text-sm font-bold text-rbs-navy hover:bg-slate-50">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white ${cor}`}><Icone size={15} /></span>
      {rotulo}
    </button>
  );
}

export default function LinhaOrcamento({ o, ocultarValor = false, aoMudar }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const fechado = o.status === "Aprovado" || o.status === "Concluído";
  const Seta = aberto ? ChevronUp : ChevronDown;

  async function reabrir() {
    if (!window.confirm(`Reabrir o orçamento #${numeroFmt(o.numero)}? Ele voltará para Rascunho.`)) return;
    try {
      await updateDoc(doc(db, "orcamentos", o.id), { status: "Rascunho" });
      aoMudar();
    } catch (e) {
      setErro("Não foi possível reabrir: " + e.message);
    }
  }

  async function excluir() {
    if (!window.confirm(`Excluir o orçamento #${numeroFmt(o.numero)}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteDoc(doc(db, "orcamentos", o.id));
      aoMudar();
    } catch (e) {
      setErro("Não foi possível excluir: " + e.message);
    }
  }

  return (
    <li className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <button aria-expanded={aberto} aria-label={`Orçamento ${numeroFmt(o.numero)} de ${o.clienteNome}`} onClick={() => setAberto((a) => !a)} className="flex w-full items-center gap-3 p-3 text-left">
        <FileText size={20} className="shrink-0 text-blue-600" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-bold text-rbs-navy">
            #{numeroFmt(o.numero)}
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${CORES_STATUS[o.status] || CORES_STATUS.Rascunho}`}>{o.status}</span>
          </span>
          <span className="block truncate text-sm font-semibold text-slate-700">{o.clienteNome}</span>
          <span className="block text-xs text-slate-500">{o.qtdServicos || 1} item(ns) • {paraData(o.criadoEm)?.toLocaleDateString("pt-BR")}</span>
        </span>
        <span className="font-extrabold text-green-700">{ocultarValor ? "•••••" : brl(o.valorTotal)}</span>
        <Seta size={18} className="shrink-0 text-blue-700" />
      </button>
      {aberto && (
        <div className="space-y-2 border-t border-slate-100 p-3">
          <Link to={`/orcamentos/${o.id}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            <Wrench size={15} /> Abrir orçamento <ChevronRight size={16} className="ml-auto text-slate-400" />
          </Link>
          <div className="flex flex-wrap gap-1">
            {fechado && <Acao icone={ReceiptText} rotulo="Recibo" cor="from-emerald-500 to-green-700" onClick={() => navigate(`/orcamentos/${o.id}/recibo`)} />}
            {fechado && <Acao icone={CalendarClock} rotulo={o.preventivoId ? "Agendado" : "Agendar"} cor="from-orange-500 to-red-600" onClick={() => navigate("/preventivo", { state: o.preventivoId ? { abrirId: o.preventivoId } : { deOrcamento: o } })} />}
            {fechado && <Acao icone={ShieldCheck} rotulo="Garantia" cor="from-amber-500 to-yellow-700" onClick={() => navigate(`/orcamentos/${o.id}/garantia`)} />}
            <Acao icone={Eye} rotulo="Ver/Baixar" cor="from-blue-500 to-blue-700" onClick={() => navigate(`/orcamentos/${o.id}/pdf`)} />
            {o.status !== "Rascunho" && <Acao icone={RotateCcw} rotulo="Reabrir" cor="from-slate-500 to-slate-700" onClick={reabrir} />}
            {isAdmin && <Acao icone={Trash2} rotulo="Excluir" cor="from-red-500 to-red-700" onClick={excluir} />}
          </div>
          {erro && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-800">{erro}</p>}
        </div>
      )}
    </li>
  );
}
