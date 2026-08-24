# PMOC App — RBS Refrigeração e Elétrica

Scaffold inicial do sistema de PMOC (Plano de Manutenção, Operação e Controle).

## Estrutura
- `frontend/` — React + Vite + Tailwind (login Google, dashboard, módulos)
- `functions/` — Cloud Functions (backend, geração de relatório PDF)
- `firestore.rules`, `storage.rules`, `firebase.json` — configuração do projeto Firebase

## Passo a passo para rodar localmente

### 1. Criar o projeto no Firebase
1. Acesse https://console.firebase.google.com e crie um projeto.
2. Ative **Authentication > Sign-in method > Google**.
3. Ative **Firestore Database** (modo produção).
4. Ative **Storage**.
5. Em **Configurações do projeto > Seus apps**, crie um app Web e copie as credenciais.

### 2. Configurar o frontend
```bash
cd frontend
cp .env.example .env
# preencha o .env com as credenciais do passo 1
npm install
npm run dev
```
Acesse `http://localhost:5173`.

### 3. Autorizar seu primeiro usuário
Como o login exige que o UID exista na coleção `usuarios_autorizados`, faça o primeiro cadastro manualmente:
1. Faça login uma vez (vai dar erro de "não autorizado" — isso é esperado).
2. No Console do Firebase, veja o UID do usuário criado em Authentication.
3. Em Firestore, crie manualmente o documento `usuarios_autorizados/{uid}` com:
   ```json
   { "nome": "Seu Nome", "email": "seu@email.com", "papel": "admin" }
   ```
4. Faça login novamente — agora vai entrar.

### 4. Publicar as regras de segurança
```bash
npm install -g firebase-tools
firebase login
firebase use --add        # selecione o projeto criado
firebase deploy --only firestore:rules,storage:rules
```

### 5. Configurar e rodar as Cloud Functions (opcional nesta etapa)
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 6. Deploy do frontend
```bash
cd frontend
npm run build
firebase deploy --only hosting
# ou, alternativamente: vercel --prod
```

## Instalar o app na tela inicial do celular (PWA)

O app já está configurado como **PWA (Progressive Web App)**: tem manifest,
ícones e service worker (via `vite-plugin-pwa`). Isso permite instalá-lo na
tela inicial do celular como se fosse um app nativo, sem precisar publicar
em loja de aplicativos.

### Pré-requisito
O app precisa estar publicado com **HTTPS** (PWA não instala em `http://`
comum, exceto `localhost`). Ou seja, faça o deploy primeiro:
```bash
cd frontend
npm install
npm run build
cd ..
firebase deploy --only hosting
```
Isso gera uma URL do tipo `https://seu-projeto.web.app`.

### No Android (Chrome)
1. Abra a URL do app no Chrome.
2. Um banner "Instalar o RBS PMOC na tela inicial?" aparece automaticamente
   dentro do próprio app (via `InstallBanner.jsx`). Toque em **Instalar**.
3. Se o banner não aparecer, toque nos **3 pontinhos (⋮) > Instalar app**
   (ou "Adicionar à tela inicial").
4. O ícone azul "RBS PMOC" aparece na tela inicial e abre em tela cheia,
   sem barra de endereço do navegador.

### No iPhone (Safari)
O iOS não permite instalação automática — é sempre manual:
1. Abra a URL do app no **Safari** (tem que ser o Safari, não funciona no Chrome do iOS).
2. Toque no ícone de **Compartilhar** (quadrado com seta para cima).
3. Escolha **"Adicionar à Tela de Início"**.
4. Confirme o nome ("RBS PMOC") e toque em **Adicionar**.
5. O ícone aparece na tela inicial e abre em tela cheia.

### Observações
- O app funciona offline apenas para a interface (telas/estático); os dados
  do Firestore continuam exigindo internet — ainda não há sincronização
  offline de dados nesta versão.
- Depois de qualquer novo `firebase deploy`, o service worker atualiza o
  app automaticamente na próxima vez que o usuário abrir (sem precisar
  reinstalar).

## Próximos passos de desenvolvimento
- Implementar os formulários de CRUD (Clientes, Equipamentos) usando `services/*.js` como camada de acesso ao Firestore.
- Conectar os cards do Dashboard aos dados reais (contagem de equipamentos, OS pendentes/atrasadas).
- Implementar a tela `ExecucaoOS.jsx` com upload de fotos e assinatura digital (ver documento de arquitetura completo).
