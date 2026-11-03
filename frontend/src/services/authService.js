import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// Retorna o perfil do usuário. Quem não tem perfil, mas foi convidado pelo
// administrador com este e-mail Google, ganha o perfil de técnico neste login.
async function garantirPerfil(user) {
  const ref = doc(db, "usuarios_autorizados", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const email = (user.email || "").toLowerCase();
  if (!email) return null;
  let convite;
  try {
    convite = await getDoc(doc(db, "convites", email));
  } catch {
    return null;
  }
  if (!convite.exists()) return null;
  const perfil = { papel: "tecnico", funcionarioId: convite.data().funcionarioId, nome: user.displayName || convite.data().nome || "", email };
  try {
    await setDoc(ref, perfil);
    return perfil;
  } catch {
    const novo = await getDoc(ref); // a outra aba/observador pode ter criado antes
    return novo.exists() ? novo.data() : null;
  }
}

// Restringe login apenas a usuários já cadastrados na coleção "usuarios_autorizados"
export async function loginComGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const perfil = await garantirPerfil(user);
  if (!perfil) {
    await signOut(auth);
    throw new Error("Usuário não autorizado. Solicite acesso ao administrador.");
  }
  return { ...user, perfil };
}

export function logout() {
  return signOut(auth);
}

// Toda vez que o Firebase confirma o login (inclusive ao recarregar a página),
// busca também o perfil em "usuarios_autorizados" para saber o papel (admin/técnico).
// Sem isso, a informação de admin se perdia depois de um F5.
export function observarAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    try {
      callback({ ...user, perfil: await garantirPerfil(user) });
    } catch (e) {
      console.warn("Não foi possível carregar o perfil do usuário:", e.message);
      callback({ ...user, perfil: null });
    }
  });
}
