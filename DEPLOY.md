# Guia de Deploy do Frontend no Render

## 📋 Visão Geral

O frontend The Loom é uma aplicação Next.js que:
- Conecta com carteiras Web3 (RainbowKit + Wagmi)
- Interage com o smart contract JobManager
- Usa SQLite local para cache de dados
- Consome APIs do backend (opcional)

## 🚀 Preparação para Deploy

### 1. Instalar Dependências e Testar Localmente

```bash
cd The-Loom-FrontEnd

# Limpar instalações antigas
rm -rf node_modules package-lock.json .next

# Instalar com novas configurações
npm install

# Testar build
npm run build

# Testar produção localmente
npm start
```

### 2. Configurar Variáveis de Ambiente

**Passo 1:** Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

**Passo 2:** Edite `.env.local` com suas configurações:

```bash
# .env.local

# Para desenvolvimento local (backend rodando localmente)
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001

# Para produção (backend no Render)
# NEXT_PUBLIC_BACKEND_API_URL=https://loom-backend-api.onrender.com

# Smart Contract (substitua pelo seu contrato)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF3fB58A4083C620c33ea48cD7E597eb18609F992

# RPC da Scroll Sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia-rpc.scroll.io

# Chain ID da Scroll Sepolia
NEXT_PUBLIC_CHAIN_ID=534351
```

**Importante:** O arquivo `.env.local` **não é commitado** no Git (está no `.gitignore`). Use o `.env.example` como template.

### 3. Commitar Alterações

```bash
git add .
git commit -m "Preparar frontend para deploy no Render"
git push origin main
```

## 🌐 Deploy no Render

### Opção 1: Via Blueprint (render.yaml)

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New"** → **"Blueprint"**
3. Conecte o repositório `The-Loom-FrontEnd`
4. O Render detectará o `render.yaml` automaticamente
5. Configure as variáveis de ambiente (ver seção abaixo)
6. Clique em **"Apply"**

### Opção 2: Web Service Manual

1. No Render Dashboard, clique em **"New"** → **"Web Service"**
2. Conecte o repositório `The-Loom-FrontEnd`
3. Configure:
   - **Name**: `loom-frontend`
   - **Region**: Oregon (ou sua preferência)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Adicione as variáveis de ambiente
5. Clique em **"Create Web Service"**

## 🔐 Variáveis de Ambiente no Render

### Configuração Automática via render.yaml

O arquivo `render.yaml` já está configurado com todas as variáveis necessárias. Se você usar o deploy via Blueprint, elas serão configuradas automaticamente.

### Configuração Manual

Se você criar o serviço manualmente, configure estas variáveis no Dashboard do Render:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `https://loom-backend-api.onrender.com` | **OBRIGATÓRIO** - URL da API backend |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xF3fB58A4083C620c33ea48cD7E597eb18609F992` | Endereço do smart contract JobManager |
| `NEXT_PUBLIC_RPC_URL` | `https://sepolia-rpc.scroll.io` | RPC da Scroll Sepolia |
| `NEXT_PUBLIC_CHAIN_ID` | `534351` | Chain ID da Scroll Sepolia |
| `NODE_ENV` | `production` | Ambiente de produção (automático) |

**Como adicionar:**
1. Vá para o serviço no Render Dashboard
2. Clique em **"Environment"** no menu lateral
3. Clique em **"Add Environment Variable"**
4. Adicione cada variável e valor
5. Clique em **"Save Changes"**

## ⚠️ Importante: SQLite no Render

O SQLite funciona localmente, mas no Render **Free Tier**:

- ❌ **Sem disco persistente** (plano gratuito)
- ✅ **Banco é recriado** a cada deploy
- ✅ **Funciona para cache temporário**

### Opções:

**Opção A: Usar SQLite temporário (Grátis)**
- O banco será recriado a cada deploy
- Ideal para MVP/testes
- Dados não persistem entre deploys

**Opção B: Conectar ao Backend PostgreSQL (Recomendado)**
- Use as APIs do backend (`NEXT_PUBLIC_BACKEND_API_URL`)
- Dados persistem no PostgreSQL do backend
- Mais robusto para produção

**Opção C: Disco Persistente (Plano Pago)**
- Adicione ao `render.yaml`:
```yaml
disk:
  name: sqlite-data
  mountPath: /opt/render/project/src
  sizeGB: 1
```
- Requer upgrade para plano pago ($7/mês)

## 🧪 Testar o Deploy

### 1. Verificar URL do Frontend

Após o deploy, acesse:
```
https://loom-frontend.onrender.com
```

### 2. Testar Funcionalidades

- ✅ Página inicial carrega
- ✅ Conectar carteira funciona
- ✅ Listar jobs funciona
- ✅ Criar job funciona
- ✅ Claim job funciona

### 3. Verificar Logs

No Render Dashboard → `loom-frontend` → **Logs**

Procure por:
- ✅ "Compiled successfully"
- ✅ "Ready on http://0.0.0.0:10000"
- ❌ Erros de conexão com RPC
- ❌ Erros de contrato não encontrado

## 🔧 Troubleshooting

### Erro: "Cannot connect to contract"

**Causa**: RPC URL incorreta ou contrato não existe

**Solução**:
1. Verifique `NEXT_PUBLIC_CONTRACT_ADDRESS`
2. Verifique `NEXT_PUBLIC_RPC_URL`
3. Teste o contrato localmente:
```bash
npx hardhat verify --network scrollSepolia 0xF3fB58A4083C620c33ea48cD7E597eb18609F992
```

### Erro: "WalletConnect not working"

**Causa**: CORS ou configuração de domínio

**Solução**:
1. Configure domínio customizado no Render
2. Adicione domínio no WalletConnect Cloud
3. Atualize configuração do RainbowKit

### Erro: "Database locked" (SQLite)

**Causa**: Múltiplas instâncias tentando acessar SQLite

**Solução**:
1. Use PostgreSQL do backend
2. Ou upgrade para plano com disco persistente
3. Ou desative SQLite em produção

### Build muito lento

**Causa**: Dependências grandes (wagmi, viem, etc)

**Solução**:
1. Use `npm ci` em vez de `npm install`:
```yaml
buildCommand: npm ci && npm run build
```
2. Configure cache do Render (automático)

## 🔄 CI/CD Automático

O Render faz deploy automático quando você faz push para `main`:

```bash
# Fazer alterações
git add .
git commit -m "Atualizar frontend"
git push origin main

# Render detecta e faz redeploy automaticamente
```

Para desabilitar auto-deploy:
- Render Dashboard → Serviço → Settings → Auto-Deploy → OFF

## 🌍 Domínio Customizado (Opcional)

### 1. No Render Dashboard

1. Vá para o serviço `loom-frontend`
2. Clique em **"Settings"** → **"Custom Domain"**
3. Adicione seu domínio: `app.theloom.com`

### 2. No seu Provedor de DNS

Adicione um registro CNAME:
```
CNAME   app   loom-frontend.onrender.com
```

### 3. Aguardar Propagação

- DNS pode levar até 24h
- Render provê SSL automático (Let's Encrypt)

## 📊 Monitoramento

### Métricas Disponíveis

No Render Dashboard:
- **Uptime**: Disponibilidade do serviço
- **Response Time**: Tempo de resposta
- **CPU/Memory**: Uso de recursos
- **Bandwidth**: Tráfego de rede

### Logs em Tempo Real

```bash
# Via Dashboard: Logs tab
# Ou via CLI:
render logs -s loom-frontend --tail
```

## 💰 Custos

### Plano Free (Recomendado para Início)

- ✅ 750 horas/mês grátis
- ⚠️ Serviço hiberna após 15min inatividade
- ⚠️ Primeira requisição pode demorar ~30s
- ❌ Sem disco persistente
- ❌ SSL compartilhado

### Plano Starter ($7/mês)

- ✅ Sem hibernação
- ✅ Mais recursos (CPU/RAM)
- ✅ Disco persistente disponível (+$1/GB)
- ✅ SSL customizado

## ✅ Checklist de Deploy

- [ ] Código commitado e pushed no GitHub
- [ ] `render.yaml` configurado
- [ ] Variáveis de ambiente definidas
- [ ] Build local testado e funcionando
- [ ] Serviço criado no Render
- [ ] Primeiro deploy concluído com sucesso
- [ ] Frontend acessível via URL do Render
- [ ] Conexão com carteira funcionando
- [ ] Smart contract respondendo
- [ ] (Opcional) Backend conectado
- [ ] (Opcional) Domínio customizado configurado

## 🔗 Links Úteis

- [Documentação do Render](https://render.com/docs)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [RainbowKit Docs](https://www.rainbowkit.com/docs)
- [Wagmi Docs](https://wagmi.sh)

## 📞 Próximos Passos

1. **Deploy Backend**: Siga o guia `DEPLOY.md` do Backend
2. **Conectar Frontend ↔ Backend**: Atualize `NEXT_PUBLIC_BACKEND_API_URL`
3. **Testar End-to-End**: Criar job no frontend → Ver no backend
4. **Monitorar**: Verificar logs e métricas
5. **Otimizar**: Adicionar cache, CDN, etc.

---

**URLs Importantes:**
- Frontend: `https://loom-frontend.onrender.com`
- Backend API: `https://loom-backend-api.onrender.com`
- Render Dashboard: `https://dashboard.render.com`

Boa sorte com o deploy! 🚀
