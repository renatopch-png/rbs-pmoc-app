import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

// Restringe login apenas a usuários já cadastrados na coleção "usuarios_autorizados"
export async function loginComGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const refUsuario = doc(db, "usuarios_autorizados", user.uid);
  const snap = await getDoc(refUsuario);
  if (!snap.exists()) {
    await signOut(auth);
    throw new Error("Usuário não autorizado. Solicite acesso ao administrador.");
  }
  return { ...user, perfil: snap.data() };
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
      const snap = await getDoc(doc(db, "usuarios_autorizados", user.uid));
      const perfil = snap.exists() ? snap.data() : null;
      callback({ ...user, perfil });
    } catch (e) {
      console.warn("Não foi possível carregar o perfil do usuário:", e.message);
      callback({ ...user, perfil: null });
    }
  });
}
