// Link "Adicionar ao Google Agenda": abre o evento já preenchido no app/site do Google,
// na conta logada no aparelho. Não precisa de permissão nem de chave de API.
const doisDig = (n) => String(n).padStart(2, "0");

function carimbo(data, hora) {
  const [a, m, d] = String(data).split("-");
  const [h, min] = String(hora || "08:00").split(":");
  return `${a}${m}${d}T${doisDig(h)}${doisDig(min || 0)}00`;
}

function somarMinutos(hora, minutos) {
  const [h, m] = String(hora || "08:00").split(":").map(Number);
  const total = Math.min(h * 60 + (m || 0) + minutos, 23 * 60 + 59);
  return `${doisDig(Math.floor(total / 60))}:${doisDig(total % 60)}`;
}

export function linkGoogleAgenda({ titulo, data, hora, horaFim, duracaoMin = 120, local = "", descricao = "" }) {
  if (!data) return "";
  const fim = horaFim || somarMinutos(hora, duracaoMin);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: titulo || "Serviço RBS",
    dates: `${carimbo(data, hora)}/${carimbo(data, fim)}`,
    ctz: "America/Sao_Paulo",
    details: descricao,
    location: local,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// Monta o link a partir de um serviço da Equipe (servicos_equipe).
export function linkDoServico(s, cliente) {
  const valor = Number(s.valor) ? `Valor: R$ ${Number(s.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "";
  return linkGoogleAgenda({
    titulo: `${s.titulo}${s.clienteNome ? ` – ${s.clienteNome}` : ""}`,
    data: s.data, hora: s.hora, horaFim: s.horaFim,
    local: s.local || cliente?.endereco || "",
    descricao: [s.clienteNome && `Cliente: ${s.clienteNome}`, (s.telefone || cliente?.telefone) && `Contato: ${s.telefone || cliente?.telefone}`, s.descricao, valor].filter(Boolean).join("\n"),
  });
}
