import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { gerarRelatorioPMOC } from "../services/pdfGenerator";

const app = express();
app.use(authMiddleware);

app.get("/:clienteId/:edificioId", async (req, res) => {
  const { clienteId, edificioId } = req.params;
  const db = admin.firestore();

  const clienteSnap = await db.collection("clientes").doc(clienteId).get();
  const edificioSnap = await db
    .collection("clientes").doc(clienteId)
    .collection("edificios").doc(edificioId)
    .get();

  if (!clienteSnap.exists || !edificioSnap.exists) {
    return res.status(404).json({ erro: "Cliente ou edifício não encontrado." });
  }

  const equipamentosSnap = await edificioSnap.ref.collection("equipamentos").get();
  const equipamentos = equipamentosSnap.docs.map((d) => d.data());

  const ordensServico: any[] = [];
  for (const eqDoc of equipamentosSnap.docs) {
    const osSnap = await eqDoc.ref.collection("ordensServico").get();
    osSnap.docs.forEach((d) => ordensServico.push(d.data()));
  }

  gerarRelatorioPMOC(
    {
      cliente: clienteSnap.data(),
      edificio: edificioSnap.data(),
      equipamentos,
      ordensServico,
    },
    res
  );
});

export const relatorios = functions.https.onRequest(app);
