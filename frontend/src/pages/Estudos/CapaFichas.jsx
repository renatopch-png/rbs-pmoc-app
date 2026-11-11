// Capa A4 de uma série de fichas, usada só na geração dos PDFs completos.
const pad = (x) => String(x).padStart(2, "0");

export default function CapaFichas({ serie }) {
  const porModulo = serie.modulos.map((m, i) => ({ m, fs: serie.fichas.filter((f) => f.mod === i) }));
  return (
    <div className="flex h-[1123px] w-[794px] flex-col bg-rbs-navy p-14 text-white">
      <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-blue-200">Meu Estudo</p>
      <h1 className="mt-12 text-6xl font-black leading-[0.95]">Fichas de<br />{serie.nome}</h1>
      <p className="mt-6 max-w-md text-lg text-blue-100">
        {serie.fichas.length} fichas visuais em {serie.modulos.length} módulos. Cada ficha: peças numeradas, cadeia funcional, exemplo numérico, atenção e ponto-chave.
      </p>
      <div className="mt-auto grid grid-cols-2 gap-2.5">
        {porModulo.map(({ m, fs }, i) => (
          <div key={m} className="rounded-lg bg-white/10 px-4 py-2">
            <span className="text-[11px] font-bold text-blue-200">MÓDULO {pad(i + 1)} · FICHAS {pad(fs[0].num)}–{pad(fs[fs.length - 1].num)}</span>
            <span className="block text-base font-extrabold">{m}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-blue-200">Valores típicos: confirme sempre no datasheet do fabricante e na norma vigente.</p>
    </div>
  );
}
