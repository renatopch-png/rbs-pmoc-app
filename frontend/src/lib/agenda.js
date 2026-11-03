const DIAS_PERIODO = { Mensal: 30, Bimestral: 60, Trimestral: 90, Semestral: 180, Anual: 365 };

export function paraData(v) {
  if (!v) return null;
  const d = v.toDate ? v.toDate() : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function inicioDaSemana(hoje = new Date()) {
  const d = new Date(hoje);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // segunda-feira
  return d;
}

// Mesma regra do Agendador: última OS do equipamento + periodicidade.
// Os itens do Cadastro Preventivo entram pela data da próxima visita.
export function agendaSemanal(equipamentos, ordens, hoje = new Date(), preventivos = []) {
  const inicio = inicioDaSemana(hoje);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + i);
    return { data, servicos: [] };
  });

  equipamentos.forEach((eq) => {
    const ultima = ordens
      .filter((os) => os.equipamentoId === eq.id)
      .map((os) => paraData(os.dataExecucao))
      .filter(Boolean)
      .sort((a, b) => b - a)[0];
    if (!ultima) return;
    const proxima = new Date(ultima);
    proxima.setDate(proxima.getDate() + (DIAS_PERIODO[eq.periodicidade] || 30));
    proxima.setHours(0, 0, 0, 0);
    const dia = dias.find((d) => d.data.getTime() === proxima.getTime());
    if (dia) dia.servicos.push(eq);
  });

  preventivos.filter((p) => p.ativo !== false && p.proximaData).forEach((p) => {
    const [a, m, d] = String(p.proximaData).split("-").map(Number);
    const data = new Date(a, m - 1, d);
    const dia = dias.find((x) => x.data.getTime() === data.getTime());
    if (dia) dia.servicos.push({ id: `prev-${p.id}`, nome: `${p.clienteNome} • ${p.servico}`, preventivo: true });
  });
  return dias;
}
