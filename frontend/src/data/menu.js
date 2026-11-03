import {
  LayoutDashboard, Plus, History, CalendarDays, Users, Snowflake, Wrench, Wallet, Tag,
  ShieldCheck, CalendarClock, FileText, ClipboardList, ClipboardCheck,
  UsersRound, Settings,
} from "lucide-react";

// Módulos com `novo: true` ainda não existem: abrem a página "Em breve".
export const MENU = [
  { to: "/orcamentos/novo", label: "Novo orçamento", icon: Plus, desc: "Crie orçamento e OS", cor: "from-blue-500 to-blue-700" },
  { to: "/orcamentos", label: "Orçamentos", icon: History, desc: "Ver orçamentos", cor: "from-violet-500 to-indigo-700" },
  { to: "/cronograma", label: "Agenda", icon: CalendarDays, desc: "Próximas manutenções", cor: "from-sky-500 to-blue-700" },
  { to: "/clientes", label: "Clientes", icon: Users, desc: "Clientes e edifícios", cor: "from-indigo-500 to-blue-700" },
  { to: "/equipamentos", label: "Equipamentos", icon: Snowflake, desc: "Cadastro e QR Code", cor: "from-cyan-500 to-sky-700" },
  { to: "/ordens-servico", label: "Ordens de Serviço", icon: Wrench, desc: "Executar e consultar", cor: "from-orange-400 to-orange-700" },
  { to: "/financeiro", admin: true, label: "Financeiro", icon: Wallet, desc: "Receitas e despesas", cor: "from-teal-400 to-cyan-700" },
  { to: "/tabela-precos", label: "Tabela de Preços", icon: Tag, desc: "Gerenciar serviços", cor: "from-teal-500 to-emerald-700" },
  { to: "/garantias", label: "Garantias", icon: ShieldCheck, desc: "Ver garantias ativas", cor: "from-amber-500 to-yellow-700" },
  { to: "/preventivo", label: "Cadastro Preventivo", icon: CalendarClock, desc: "Manutenções recorrentes", cor: "from-orange-500 to-red-600" },
  { to: "/laudos", label: "Relatórios Técnicos", icon: FileText, desc: "Criar relatórios", cor: "from-green-500 to-green-700" },
  { to: "/anotacoes", label: "Anotações", icon: ClipboardList, desc: "Lembretes e tarefas", cor: "from-purple-500 to-violet-700" },
  { to: "/relatorios", label: "PMOC", icon: ClipboardCheck, desc: "Plano de manutenção", cor: "from-blue-700 to-blue-900" },
  { to: "/equipe", label: "Equipe", icon: UsersRound, desc: "Equipe e permissões", cor: "from-blue-500 to-indigo-700" },
];

export const CONFIGURACOES = { to: "/configuracoes", admin: true, label: "Configurações", icon: Settings, desc: "Ajustes do app", cor: "from-slate-500 to-slate-700" };
export const PAINEL = { to: "/", label: "Painel principal", icon: LayoutDashboard };
export const MODULOS_EM_BREVE = [...MENU, CONFIGURACOES].filter((m) => m.novo);

// Busca os dados (ícone, cor, descrição) de um módulo pela rota.
export const modulo = (to) => [...MENU, CONFIGURACOES].find((m) => m.to === to);
