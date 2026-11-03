import { Link } from "react-router-dom";

export default function EmBreve({ modulo }) {
  const Icone = modulo.icon;
  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
      <span className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white ${modulo.cor}`}>
        <Icone size={28} />
      </span>
      <h1 className="text-xl font-extrabold text-rbs-navy">{modulo.label}</h1>
      <p className="mt-2 text-sm text-gray-600">Este módulo ainda está em desenvolvimento.</p>
      <Link to="/" className="mt-5 inline-block rounded-lg bg-rbs px-4 py-2 text-sm font-semibold text-white">Voltar ao painel</Link>
    </div>
  );
}
