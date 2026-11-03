import admin from "firebase-admin";
import { writeFileSync } from "fs";
admin.initializeApp({ projectId: "rbs-pmoc" });
const db = admin.firestore();
const acao = process.argv[2];
const ESS = ["clientes", "equipamentos", "ordens_servico"];
const OPC = ["plano_atividades", "orcamentos", "tabela_precos", "contadores", "historico_publico"];
const ser = (v) => v?.toDate ? { __data: v.toDate().toISOString() } : Array.isArray(v) ? v.map(ser)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ser(x)])) : v;
const ler = async (n) => (await db.collection(n).get()).docs.map((d) => ({ id: d.id, ...ser(d.data()) }));
if (acao === "backup") {
  const colecoes = {};
  for (const n of [...ESS, ...OPC]) colecoes[n] = await ler(n);
  writeFileSync(process.argv[3], JSON.stringify({ sistema: "RBS PMOC", geradoEm: new Date().toISOString(), colecoes }, null, 2));
  console.log("contagens", Object.fromEntries(Object.entries(colecoes).map(([k, v]) => [k, v.length])));
}
if (acao === "sync") {
  const eqs = await db.collection("equipamentos").get();
  let n = 0;
  for (const e of eqs.docs) {
    const os = await db.collection("ordens_servico").where("equipamentoId", "==", e.id).get();
    const itens = os.docs.map((d) => {
      const o = d.data(); const c = o.itensChecklist || [];
      return { id: d.id, dataExecucao: o.dataExecucao || null, tecnicoNome: o.tecnicoNome || "", total: c.length,
        feitos: c.filter((i) => i.feito || i.concluido || i.checked).length };
    }).sort((a, b) => (b.dataExecucao?.toMillis?.() || 0) - (a.dataExecucao?.toMillis?.() || 0));
    await db.collection("historico_publico").doc(e.id).set({ itens, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() });
    n += 1;
  }
  console.log("historico sincronizado:", n);
}
if (acao === "regras") {
  const { readFileSync } = await import("fs");
  const token = (await admin.credential.applicationDefault().getAccessToken()).access_token;
  const api = "https://firebaserules.googleapis.com/v1/projects/rbs-pmoc";
  const req = async (m, url, body) => {
    const r = await fetch(url, { method: m, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) throw new Error(`${m} ${url.split("/v1/")[1]}: ${r.status} ${j.error?.status} ${j.error?.message}`);
    return j;
  };
  const rel = (await req("GET", `${api}/releases`)).releases || [];
  rel.forEach((r) => console.log("ATUAL", r.name.split("/releases/")[1], r.rulesetName.split("/").pop()));
  const publicar = async (arquivo, nomeRelease) => {
    const conteudo = readFileSync(arquivo, "utf8");
    const rs = await req("POST", `${api}/rulesets`, { source: { files: [{ name: arquivo.split("/").pop(), content: conteudo }] } });
    await req("PATCH", `${api}/releases/${encodeURIComponent(nomeRelease.split("/releases/")[1])}`, { release: { name: nomeRelease, rulesetName: rs.name } }).catch(async (e) => {
      throw e;
    });
    console.log("NOVO", nomeRelease.split("/releases/")[1], rs.name.split("/").pop());
  };
  const { CASOS } = await import("./casos.mjs");
  const fonte = { files: [{ name: "firestore.rules", content: readFileSync("../../firestore.rules", "utf8") }] };
  const res = await req("POST", "https://firebaserules.googleapis.com/v1/projects/rbs-pmoc:test", { source: fonte, testSuite: { testCases: CASOS.map((x) => x.caso) } });
  if (res.issues?.length) res.issues.forEach((i) => console.log("ISSUE", i.severity, i.description));
  let falhas = 0;
  (res.testResults || []).forEach((r, i) => {
    if (r.state !== "SUCCESS") { falhas += 1; console.log("CASO FALHOU:", CASOS[i].nome, CASOS[i].caso.expectation, (r.debugMessages || []).join(" | ").slice(0, 200)); }
  });
  console.log(`CASOS ${CASOS.length - falhas}/${CASOS.length}`);
  if (falhas || (res.testResults || []).length !== CASOS.length) throw new Error("Regras reprovadas: publicacao cancelada");
  const fs_ = rel.find((r) => r.name.endsWith("/cloud.firestore"));
  if (!fs_) throw new Error("release nao encontrado");
  await publicar("../../firestore.rules", fs_.name);
}
if (acao === "teste") {
  const base = "https://firestore.googleapis.com/v1/projects/rbs-pmoc/databases/(default)/documents";
  const st = async (p) => (await fetch(base + p)).status;
  const ids = {};
  for (const n of ["clientes", "equipamentos"]) ids[n] = (await db.collection(n).limit(1).get()).docs[0]?.id;
  for (const n of [...ESS, "historico_publico", "orcamentos", "lancamentos", "contas_fixas", "funcionarios", "servicos_equipe", "convites", "usuarios_autorizados"]) console.log("anonimo LISTA", n, await st(`/${n}?pageSize=1`));
  for (const [n, id] of Object.entries(ids)) if (id) console.log("anonimo LE 1 doc", n, await st(`/${n}/${id}`));
  if (ids.equipamentos) console.log("anonimo LE historico", await st(`/historico_publico/${ids.equipamentos}`));
}
