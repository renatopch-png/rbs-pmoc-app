import {
  collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const lista = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

export async function carregarEquipe() {
  const [f, s, u, c, cli] = await Promise.all([
    getDocs(collection(db, "funcionarios")),
    getDocs(collection(db, "servicos_equipe")),
    getDocs(collection(db, "usuarios_autorizados")),
    getDocs(collection(db, "convites")),
    getDocs(collection(db, "clientes")),
  ]);
  return {
    funcionarios: lista(f).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")),
    servicos: lista(s).sort((a, b) => `${b.data}${b.hora}`.localeCompare(`${a.data}${a.hora}`)),
    usuarios: lista(u),
    convites: lista(c),
    clientes: lista(cli).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR")),
  };
}

export async function salvarFuncionario(id, dados) {
  const { emailAnterior, ...campos } = dados;
  const email = campos.email.trim().toLowerCase();
  const registro = { ...campos, nome: campos.nome.trim(), email, comissaoPercentual: Number(campos.comissaoPercentual) || 0, atualizadoEm: serverTimestamp() };
  const batch = writeBatch(db);
  const ref = id ? doc(db, "funcionarios", id) : doc(collection(db, "funcionarios"));
  batch.set(ref, id ? registro : { ...registro, ativo: true, criadoEm: serverTimestamp() }, { merge: true });
  if (emailAnterior && emailAnterior !== email) batch.delete(doc(db, "convites", emailAnterior));
  // Funcionário inativo não recebe convite: editar o cadastro não devolve o acesso.
  if (campos.ativo !== false) {
    batch.set(doc(db, "convites", email), { funcionarioId: ref.id, nome: registro.nome, papel: "tecnico", criadoEm: serverTimestamp() });
  }
  await batch.commit();
}

export async function removerAcesso(funcionario, usuario) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "convites", funcionario.email));
  if (usuario) batch.delete(doc(db, "usuarios_autorizados", usuario.id));
  batch.set(doc(db, "funcionarios", funcionario.id), { ativo: false, atualizadoEm: serverTimestamp() }, { merge: true });
  await batch.commit();
}

export async function reativarFuncionario(funcionario) {
  await salvarFuncionario(funcionario.id, {
    nome: funcionario.nome, email: funcionario.email, telefone: funcionario.telefone || "", funcao: funcionario.funcao || "",
    comissaoPercentual: funcionario.comissaoPercentual, ativo: true,
  });
}

export async function salvarServico(id, dados) {
  const batch = writeBatch(db);
  const ref = id ? doc(db, "servicos_equipe", id) : doc(collection(db, "servicos_equipe"));
  batch.set(ref, { ...dados, atualizadoEm: serverTimestamp(), ...(id ? {} : { criadoEm: serverTimestamp() }) }, { merge: true });
  await batch.commit();
}

export const excluirServico = (id) => deleteDoc(doc(db, "servicos_equipe", id));

// ID fixo por serviço: repetir a operação nunca duplica a saída no Financeiro.
export async function pagarComissoes(funcionario, itens) {
  const batch = writeBatch(db);
  itens.forEach((s) => {
    batch.set(doc(db, "lancamentos", `comissao_${s.id}`), {
      tipo: "saida", descricao: `Comissão ${funcionario.nome} - ${s.titulo}`, categoria: "Salários", valor: s.comissaoValor,
      data: new Date(), formaPagamento: "Pix", servicoEquipeId: s.id, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
      criadoPor: auth.currentUser?.uid || null,
    });
    batch.update(doc(db, "servicos_equipe", s.id), { comissaoPaga: true, comissaoPagaEm: serverTimestamp() });
  });
  await batch.commit();
}

export async function meusServicos(funcionarioId) {
  const snap = await getDocs(query(collection(db, "servicos_equipe"), where("funcionarioId", "==", funcionarioId)));
  return lista(snap).sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`));
}

export const mudarStatusTecnico = (id, status) => updateDoc(doc(db, "servicos_equipe", id), {
  status, ...(status === "Concluído" ? { concluidoEm: serverTimestamp() } : {}),
});
