export const STATUS_SERVICO = ["Pendente", "Em andamento", "Concluído", "Cancelado"];
export const CORES_SERVICO = {
  Pendente: "bg-amber-100 text-amber-800",
  "Em andamento": "bg-blue-100 text-blue-800",
  "Concluído": "bg-green-100 text-green-800",
  Cancelado: "bg-slate-200 text-slate-700",
};
const emAberto = (s) => s.status === "Pendente" || s.status === "Em andamento";
const concluidoNoMes = (s, mes) => s.status === "Concluído" && (s.data || "").startsWith(mes);
const centavos = (v) => Math.round((Number(v) || 0) * 100);

export function comissaoDoServico(valor, percentual) {
  return Math.round(centavos(valor) * (Number(percentual) || 0) / 100) / 100;
}

export function resumoEquipe(servicos, mes) {
  const feitos = servicos.filter((s) => concluidoNoMes(s, mes));
  return {
    comissoes: feitos.reduce((t, s) => t + centavos(s.comissaoValor), 0) / 100,
    realizados: feitos.length,
    pendentes: servicos.filter(emAberto).length,
  };
}

export function relatorioPorFuncionario(servicos, funcionarios, mes) {
  return funcionarios.map((f) => {
    const dele = servicos.filter((s) => s.funcionarioId === f.id);
    const feitos = dele.filter((s) => concluidoNoMes(s, mes));
    return {
      funcionario: f,
      realizados: feitos.length,
      pendentes: dele.filter(emAberto).length,
      faturado: feitos.reduce((t, s) => t + centavos(s.valor), 0) / 100,
      comissao: feitos.reduce((t, s) => t + centavos(s.comissaoValor), 0) / 100,
    };
  });
}

export function comissoesAPagar(servicos, funcionarios) {
  return funcionarios
    .map((f) => {
      const itens = servicos.filter((s) => s.funcionarioId === f.id && s.status === "Concluído" && !s.comissaoPaga && Number(s.comissaoValor) > 0);
      return { funcionario: f, itens, total: itens.reduce((t, s) => t + centavos(s.comissaoValor), 0) / 100 };
    })
    .filter((g) => g.itens.length > 0);
}

export function diasDaSemana(inicio) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return d;
  });
}
