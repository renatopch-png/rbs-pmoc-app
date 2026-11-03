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
export function agendaSemanal(equipamentos, ordens, hoje = new Date()) {
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
  return dias;
}
