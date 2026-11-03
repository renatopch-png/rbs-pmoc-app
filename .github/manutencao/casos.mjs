const D = "/databases/(default)/documents";
const usr = (uid) => `${D}/usuarios_autorizados/${uid}`;
const mockUser = (uid, data) => [
  { function: "exists", args: [{ exactValue: usr(uid) }], result: { value: !!data } },
  { function: "get", args: [{ exactValue: usr(uid) }], result: data ? { value: { data } } : { undefined: {} } },
];
const mockConvite = (email, data) => [
  { function: "exists", args: [{ exactValue: `${D}/convites/${email}` }], result: { value: !!data } },
  { function: "get", args: [{ exactValue: `${D}/convites/${email}` }], result: data ? { value: { data } } : { undefined: {} } },
];
const ADM = { uid: "ad", token: { email: "adm@x.com", email_verified: true } };
const TEC = { uid: "te", token: { email: "tec@x.com", email_verified: true } };
const NOV = { uid: "no", token: { email: "novo@x.com", email_verified: true } };
const adm = mockUser("ad", { papel: "admin" });
const tec = mockUser("te", { papel: "tecnico", funcionarioId: "f1" });
const nov = mockUser("no", null);
const perfil = { papel: "tecnico", funcionarioId: "f1", nome: "N", email: "novo@x.com" };
const c = (nome, expectation, auth, method, path, mocks = [], extra = {}) => ({
  nome,
  caso: {
    expectation,
    request: { auth: auth || null, method, path: `${D}/${path}`, time: "2026-11-03T00:00:00Z", ...(extra.novo ? { resource: { data: extra.novo } } : {}) },
    ...(extra.atual ? { resource: { data: extra.atual } } : {}),
    functionMocks: mocks,
  },
});
const conv = mockConvite("novo@x.com", { funcionarioId: "f1" });
const sv = { funcionarioId: "f1", status: "Pendente", valor: 100 };
const sv2 = { funcionarioId: "f2", status: "Pendente", valor: 100 };
export const CASOS = [
  c("admin le proprio perfil", "ALLOW", ADM, "get", "usuarios_autorizados/ad", adm),
  c("admin lista usuarios", "ALLOW", ADM, "list", "usuarios_autorizados/x", adm),
  c("tecnico le proprio perfil", "ALLOW", TEC, "get", "usuarios_autorizados/te", tec),
  c("tecnico nao lista usuarios", "DENY", TEC, "list", "usuarios_autorizados/x", tec),
  c("anonimo nao le perfil", "DENY", null, "get", "usuarios_autorizados/ad"),
  c("tecnico nao vira admin", "DENY", TEC, "update", "usuarios_autorizados/te", tec, { atual: { papel: "tecnico" }, novo: { papel: "admin" } }),
  c("tecnico nao exclui perfil", "DENY", TEC, "delete", "usuarios_autorizados/ad", tec),
  c("convidado cria perfil tecnico", "ALLOW", NOV, "create", "usuarios_autorizados/no", [...nov, ...conv], { novo: perfil }),
  c("convidado nao cria admin", "DENY", NOV, "create", "usuarios_autorizados/no", [...nov, ...conv], { novo: { ...perfil, papel: "admin" } }),
  c("convidado nao adiciona campo", "DENY", NOV, "create", "usuarios_autorizados/no", [...nov, ...conv], { novo: { ...perfil, extra: 1 } }),
  c("convidado nao troca funcionario", "DENY", NOV, "create", "usuarios_autorizados/no", [...nov, ...conv], { novo: { ...perfil, funcionarioId: "f9" } }),
  c("sem convite nao entra", "DENY", NOV, "create", "usuarios_autorizados/no", [...nov, ...mockConvite("novo@x.com", null)], { novo: perfil }),
  c("nao cria perfil de outro uid", "DENY", NOV, "create", "usuarios_autorizados/outro", [...nov, ...conv, ...mockUser("outro", null)], { novo: perfil }),
  c("email nao verificado nao entra", "DENY", { uid: "no", token: { email: "novo@x.com", email_verified: false } }, "create", "usuarios_autorizados/no", [...nov, ...conv], { novo: perfil }),
  c("convidado le proprio convite", "ALLOW", NOV, "get", "convites/novo@x.com", nov),
  c("convidado nao le convite alheio", "DENY", NOV, "get", "convites/outro@x.com", nov),
  c("tecnico nao lista convites", "DENY", TEC, "list", "convites/x", tec),
  c("tecnico nao cria convite", "DENY", TEC, "create", "convites/z@x.com", tec, { novo: { funcionarioId: "f1" } }),
  c("admin cria convite", "ALLOW", ADM, "create", "convites/z@x.com", adm, { novo: { funcionarioId: "f1" } }),
  c("tecnico le proprio cadastro", "ALLOW", TEC, "get", "funcionarios/f1", tec),
  c("tecnico nao le outro cadastro", "DENY", TEC, "get", "funcionarios/f2", tec),
  c("tecnico nao lista funcionarios", "DENY", TEC, "list", "funcionarios/x", tec),
  c("tecnico le proprio servico", "ALLOW", TEC, "get", "servicos_equipe/s", tec, { atual: sv }),
  c("tecnico nao le servico alheio", "DENY", TEC, "get", "servicos_equipe/s", tec, { atual: sv2 }),
  c("tecnico inicia proprio servico", "ALLOW", TEC, "update", "servicos_equipe/s", tec, { atual: sv, novo: { ...sv, status: "Em andamento" } }),
  c("tecnico nao muda valor", "DENY", TEC, "update", "servicos_equipe/s", tec, { atual: sv, novo: { ...sv, status: "Concluído", valor: 999 } }),
  c("tecnico nao cancela", "DENY", TEC, "update", "servicos_equipe/s", tec, { atual: sv, novo: { ...sv, status: "Cancelado" } }),
  c("tecnico nao altera servico alheio", "DENY", TEC, "update", "servicos_equipe/s", tec, { atual: sv2, novo: { ...sv2, status: "Concluído" } }),
  c("tecnico nao cria servico", "DENY", TEC, "create", "servicos_equipe/s", tec, { novo: sv }),
  c("tecnico nao exclui servico", "DENY", TEC, "delete", "servicos_equipe/s", tec, { atual: sv }),
  c("admin altera servico", "ALLOW", ADM, "update", "servicos_equipe/s", adm, { atual: sv, novo: { ...sv, valor: 2 } }),
  c("tecnico nao ve financeiro", "DENY", TEC, "get", "lancamentos/l", tec),
  c("tecnico nao lista financeiro", "DENY", TEC, "list", "lancamentos/l", tec),
  c("tecnico nao ve contas fixas", "DENY", TEC, "get", "contas_fixas/l", tec),
  c("admin ve financeiro", "ALLOW", ADM, "list", "lancamentos/l", adm),
  c("anonimo le cliente por id", "ALLOW", null, "get", "clientes/c"),
  c("anonimo nao lista clientes", "DENY", null, "list", "clientes/c"),
  c("anonimo le OS por id", "ALLOW", null, "get", "ordens_servico/o"),
  c("anonimo nao lista OS", "DENY", null, "list", "ordens_servico/o"),
  c("tecnico lista clientes", "ALLOW", TEC, "list", "clientes/c", tec),
  c("tecnico cria OS", "ALLOW", TEC, "create", "ordens_servico/o", tec, { novo: { equipamentoId: "e" } }),
  c("tecnico nao exclui OS", "DENY", TEC, "delete", "ordens_servico/o", tec),
  c("admin exclui OS", "ALLOW", ADM, "delete", "ordens_servico/o", adm),
];
