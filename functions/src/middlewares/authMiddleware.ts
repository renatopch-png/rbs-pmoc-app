import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split("Bearer ")[1] : null;

  if (!token) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const snap = await admin
      .firestore()
      .collection("usuarios_autorizados")
      .doc(decoded.uid)
      .get();

    if (!snap.exists) {
      return res.status(403).json({ erro: "Usuário não autorizado." });
    }

    (req as any).usuario = { uid: decoded.uid, ...snap.data() };
    next();
  } catch (e) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}
