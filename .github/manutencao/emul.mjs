import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
const env = await initializeTestEnvironment({ projectId: "demo-rbs", firestore: { rules: readFileSync("../../firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 } });
const seed = async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const d = c.firestore();
    const dados = { "usuarios_autorizados/ad": { papel: "admin" }, "usuarios_autorizados/te": { papel: "tecnico", funcionarioId: "f1" },
      "convites/novo@x.com": { funcionarioId: "f1", papel: "tecnico" }, "funcionarios/f1": { nome: "A" }, "funcionarios/f2": { nome: "B" },
      "servicos_equipe/s": { funcionarioId: "f1", status: "Pendente", valor: 100 }, "servicos_equipe/s2": { funcionarioId: "f2", status: "Pendente", valor: 100 },
      "clientes/c": { nome: "C" }, "equipamentos/e": { nome: "E" }, "ordens_servico/o": { equipamentoId: "e" }, "orcamentos/q": { numero: 1 },
      "historico_publico/e": { itens: [] }, "lancamentos/l": { valor: 1 }, "contas_fixas/l": { valor: 1 }, "tabela_precos/t": { nome: "T" }, "contadores/orcamentos": { ultimo: 1 } };
    for (const [p, v] of Object.entries(dados)) await setDoc(doc(d, p), v);
  });
};
const tk = (email, v = true) => ({ email, email_verified: v });
const an = () => env.unauthenticatedContext().firestore();
const ad = () => env.authenticatedContext("ad", tk("adm@x.com")).firestore();
const te = () => env.authenticatedContext("te", tk("tec@x.com")).firestore();
const no = () => env.authenticatedContext("no", tk("novo@x.com")).firestore();
const so = () => env.authenticatedContext("no", tk("sem@x.com")).firestore();
const nv = () => env.authenticatedContext("no", tk("novo@x.com", false)).firestore();
const perfil = { papel: "tecnico", funcionarioId: "f1", nome: "N", email: "novo@x.com" };
const cria = (d, p, v) => setDoc(doc(d, p), v);
const le = (d, p) => getDoc(doc(d, p));
const lista = (d, c) => getDocs(collection(d, c));
const up = (d, p, v) => updateDoc(doc(d, p), v);
const ex = (d, p) => deleteDoc(doc(d, p));
const OK = 1, NAO = 0;
const casos = [
  ["admin le proprio perfil", OK, () => le(ad(), "usuarios_autorizados/ad")],
  ["admin lista usuarios", OK, () => lista(ad(), "usuarios_autorizados")],
  ["tecnico le proprio perfil", OK, () => le(te(), "usuarios_autorizados/te")],
  ["tecnico nao lista usuarios", NAO, () => lista(te(), "usuarios_autorizados")],
  ["anonimo nao le perfil", NAO, () => le(an(), "usuarios_autorizados/ad")],
  ["tecnico nao vira admin", NAO, () => up(te(), "usuarios_autorizados/te", { papel: "admin" })],
  ["tecnico nao exclui perfil", NAO, () => ex(te(), "usuarios_autorizados/ad")],
  ["admin atualiza perfil", OK, () => up(ad(), "usuarios_autorizados/te", { nome: "X" })],
  ["convidado cria perfil tecnico", OK, () => cria(no(), "usuarios_autorizados/no", perfil)],
  ["convidado nao cria admin", NAO, () => cria(no(), "usuarios_autorizados/no", { ...perfil, papel: "admin" })],
  ["convidado nao adiciona campo", NAO, () => cria(no(), "usuarios_autorizados/no", { ...perfil, extra: 1 })],
  ["convidado nao troca funcionario", NAO, () => cria(no(), "usuarios_autorizados/no", { ...perfil, funcionarioId: "f9" })],
  ["sem convite nao entra", NAO, () => cria(so(), "usuarios_autorizados/no", { ...perfil, email: "sem@x.com" })],
  ["nao usa email alheio", NAO, () => cria(so(), "usuarios_autorizados/no", perfil)],
  ["nao cria perfil de outro uid", NAO, () => cria(no(), "usuarios_autorizados/outro", perfil)],
  ["email nao verificado nao entra", NAO, () => cria(nv(), "usuarios_autorizados/no", perfil)],
  ["convidado le proprio convite", OK, () => le(no(), "convites/novo@x.com")],
  ["convidado nao le convite alheio", NAO, () => le(no(), "convites/outro@x.com")],
  ["tecnico nao lista convites", NAO, () => lista(te(), "convites")],
  ["tecnico nao cria convite", NAO, () => cria(te(), "convites/z@x.com", { funcionarioId: "f1" })],
  ["admin cria convite", OK, () => cria(ad(), "convites/z@x.com", { funcionarioId: "f1" })],
  ["tecnico le proprio cadastro", OK, () => le(te(), "funcionarios/f1")],
  ["tecnico nao le outro cadastro", NAO, () => le(te(), "funcionarios/f2")],
  ["tecnico nao lista funcionarios", NAO, () => lista(te(), "funcionarios")],
  ["tecnico nao altera comissao", NAO, () => up(te(), "funcionarios/f1", { comissaoPercentual: 99 })],
  ["admin lista funcionarios", OK, () => lista(ad(), "funcionarios")],
  ["tecnico lista seus servicos", OK, () => getDocs(query(collection(te(), "servicos_equipe"), where("funcionarioId", "==", "f1")))],
  ["tecnico nao lista servicos alheios", NAO, () => getDocs(query(collection(te(), "servicos_equipe"), where("funcionarioId", "==", "f2")))],
  ["tecnico nao lista todos servicos", NAO, () => lista(te(), "servicos_equipe")],
  ["tecnico le proprio servico", OK, () => le(te(), "servicos_equipe/s")],
  ["tecnico nao le servico alheio", NAO, () => le(te(), "servicos_equipe/s2")],
  ["tecnico inicia proprio servico", OK, () => up(te(), "servicos_equipe/s", { status: "Em andamento" })],
  ["tecnico conclui proprio servico", OK, () => up(te(), "servicos_equipe/s", { status: "Concluído", concluidoEm: new Date() })],
  ["tecnico nao muda valor", NAO, () => up(te(), "servicos_equipe/s", { status: "Concluído", valor: 999 })],
  ["tecnico nao cancela", NAO, () => up(te(), "servicos_equipe/s", { status: "Cancelado" })],
  ["tecnico nao altera servico alheio", NAO, () => up(te(), "servicos_equipe/s2", { status: "Concluído" })],
  ["tecnico nao cria servico", NAO, () => cria(te(), "servicos_equipe/n", { funcionarioId: "f1" })],
  ["tecnico nao exclui servico", NAO, () => ex(te(), "servicos_equipe/s")],
  ["admin altera servico", OK, () => up(ad(), "servicos_equipe/s", { valor: 2 })],
  ["tecnico nao ve financeiro", NAO, () => le(te(), "lancamentos/l")],
  ["tecnico nao lista financeiro", NAO, () => lista(te(), "lancamentos")],
  ["tecnico nao ve contas fixas", NAO, () => lista(te(), "contas_fixas")],
  ["admin ve financeiro", OK, () => lista(ad(), "lancamentos")],
  ["anonimo le cliente por id", OK, () => le(an(), "clientes/c")],
  ["anonimo le equipamento por id", OK, () => le(an(), "equipamentos/e")],
  ["anonimo le OS por id", OK, () => le(an(), "ordens_servico/o")],
  ["anonimo le historico por id", OK, () => le(an(), "historico_publico/e")],
  ...["clientes", "equipamentos", "ordens_servico", "historico_publico", "orcamentos", "lancamentos", "contas_fixas", "funcionarios", "servicos_equipe", "convites", "usuarios_autorizados"]
    .map((n) => [`anonimo nao lista ${n}`, NAO, () => lista(an(), n)]),
  ["tecnico lista clientes", OK, () => lista(te(), "clientes")],
  ["tecnico lista equipamentos", OK, () => lista(te(), "equipamentos")],
  ["tecnico cria orcamento", OK, () => cria(te(), "orcamentos/n", { numero: 2 })],
  ["tecnico cria OS", OK, () => cria(te(), "ordens_servico/n", { equipamentoId: "e" })],
  ["tecnico nao exclui OS", NAO, () => ex(te(), "ordens_servico/o")],
  ["admin exclui OS", OK, () => ex(ad(), "ordens_servico/o")],
];
let falhas = 0;
for (const [nome, esperado, op] of casos) {
  await seed();
  try { await (esperado ? assertSucceeds(op()) : assertFails(op())); } catch (e) { falhas += 1; console.log("CASO FALHOU:", nome, String(e.message).slice(0, 120)); }
}
console.log(`CASOS ${casos.length - falhas}/${casos.length}`);
await env.cleanup();
process.exit(falhas ? 1 : 0);
