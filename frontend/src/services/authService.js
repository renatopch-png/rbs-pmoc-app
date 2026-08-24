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

export function observarAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
