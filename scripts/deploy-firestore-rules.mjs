// Publica firestore.rules direto na API Firebase Rules (sem firebase-tools).
// Precisa só do papel "Firebase Rules Admin" na conta de serviço.
// Uso: FIREBASE_SA='<json>' node scripts/deploy-firestore-rules.mjs <projectId> [arquivo]
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const projeto = process.argv[2];
const arquivo = process.argv[3] || "firestore.rules";
const sa = JSON.parse(process.env.FIREBASE_SA || "{}");
if (!projeto || !sa.client_email) throw new Error("Informe o projeto e a variável FIREBASE_SA.");
console.log(`Conta de serviço: ${sa.client_email}`);

const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const agora = Math.floor(Date.now() / 1000);
const jwt = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
  iss: sa.client_email, scope: "https://www.googleapis.com/auth/cloud-platform",
  aud: "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 3600,
})}`;
const assinatura = createSign("RSA-SHA256").update(jwt).sign(sa.private_key, "base64url");

const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${jwt}.${assinatura}` }),
});
const { access_token: token, error_description: erroToken } = await tokenResp.json();
if (!token) throw new Error(`Falha ao obter token: ${erroToken}`);

const api = `https://firebaserules.googleapis.com/v1/projects/${projeto}`;
async function chamar(metodo, url, corpo) {
  const r = await fetch(url, { method: metodo, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, json };
}

const ruleset = await chamar("POST", `${api}/rulesets`, { source: { files: [{ name: "firestore.rules", content: readFileSync(arquivo, "utf8") }] } });
if (!ruleset.ok) throw new Error(`Erro ao compilar/criar regras (${ruleset.status}): ${JSON.stringify(ruleset.json.error || ruleset.json)}`);
console.log(`Regras compiladas: ${ruleset.json.name}`);

const nomeRelease = `projects/${projeto}/releases/cloud.firestore`;
let release = await chamar("PATCH", `${api}/releases/cloud.firestore`, { release: { name: nomeRelease, rulesetName: ruleset.json.name } });
if (release.status === 404) release = await chamar("POST", `${api}/releases`, { name: nomeRelease, rulesetName: ruleset.json.name });
if (!release.ok) throw new Error(`Erro ao publicar (${release.status}): ${JSON.stringify(release.json.error || release.json)}`);
console.log(`Regras do Firestore publicadas em ${release.json.updateTime || "agora"}.`);
