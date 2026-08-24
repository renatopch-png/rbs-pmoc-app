/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta institucional RBS (azul)
        rbs: {
          light: "#EFF6FF",   // fundo de linhas alternadas / faixas claras
          DEFAULT: "#0B5394", // azul de títulos de seção
          dark: "#1E40AF",    // azul escuro de cabeçalhos de tabela
        },
      },
    },
  },
  plugins: [],
};
