# 🔧 Guia Rápido de Configuração - The Loom Frontend

## 📝 Configuração de Variáveis de Ambiente

### Para Desenvolvimento Local

```bash
# 1. Copiar o arquivo de exemplo
cp .env.example .env.local

# 2. Editar o arquivo (use seu editor favorito)
nano .env.local
# ou
code .env.local

# 3. Configurar para desenvolvimento local:
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF3fB58A4083C620c33ea48cD7E597eb18609F992
NEXT_PUBLIC_RPC_URL=https://sepolia-rpc.scroll.io
NEXT_PUBLIC_CHAIN_ID=534351
```

### Para Deploy no Render

As variáveis já estão configuradas no `render.yaml`. Se precisar alterar:

**Opção 1: Editar render.yaml antes do deploy**

```yaml
envVars:
  - key: NEXT_PUBLIC_BACKEND_API_URL
    value: https://SEU-BACKEND.onrender.com  # Altere aqui
```

**Opção 2: Alterar no Dashboard do Render após deploy**

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Vá para o serviço `loom-frontend`
3. Clique em **"Environment"** no menu lateral
4. Edite a variável `NEXT_PUBLIC_BACKEND_API_URL`
5. Salve e aguarde o redeploy automático

## 🔗 URLs Importantes

### Desenvolvimento Local

```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

### Produção (Render)

```
Frontend: https://loom-frontend.onrender.com
Backend:  https://loom-backend-api.onrender.com
```

## ✅ Checklist de Configuração

### Antes de Rodar Localmente

- [ ] Arquivo `.env.local` criado (copiar de `.env.example`)
- [ ] `NEXT_PUBLIC_BACKEND_API_URL` aponta para `http://localhost:3001`
- [ ] Backend rodando em `http://localhost:3001`
- [ ] Dependências instaladas (`npm install`)

### Antes do Deploy

- [ ] Arquivo `render.yaml` atualizado
- [ ] `NEXT_PUBLIC_BACKEND_API_URL` aponta para o backend em produção
- [ ] Código commitado e pushed no GitHub
- [ ] Backend já deployado no Render

## 🚀 Comandos Úteis

### Desenvolvimento

```bash
# Verificar variáveis de ambiente
cat .env.local

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção (testar localmente)
npm run build
npm start
```

### Testar Conexão com Backend

```bash
# Testar backend local
curl http://localhost:3001/api/health

# Testar backend em produção
curl https://loom-backend-api.onrender.com/api/health
```

## 🔧 Troubleshooting

### Erro: "Backend não disponível"

**Causa:** `NEXT_PUBLIC_BACKEND_API_URL` incorreta ou backend não está rodando

**Solução:**
1. Verificar se o backend está rodando
2. Verificar URL no `.env.local` (desenvolvimento) ou render.yaml (produção)
3. Testar URL do backend diretamente no navegador

```bash
# Verificar valor atual
echo $NEXT_PUBLIC_BACKEND_API_URL

# Ou verificar no código
grep NEXT_PUBLIC_BACKEND_API_URL .env.local
```

### Erro: "Cannot connect to contract"

**Causa:** RPC URL incorreta ou contrato não existe

**Solução:**
1. Verificar `NEXT_PUBLIC_RPC_URL`
2. Verificar `NEXT_PUBLIC_CONTRACT_ADDRESS`
3. Confirmar que o contrato está deployado

```bash
# Verificar na Scroll Sepolia Explorer
open https://sepolia.scrollscan.com/address/0xF3fB58A4083C620c33ea48cD7E597eb18609F992
```

### Erro: "Chain ID mismatch"

**Causa:** `NEXT_PUBLIC_CHAIN_ID` incorreto

**Solução:**
- Scroll Sepolia = `534351`
- Certifique-se que a carteira está na rede correta

### Frontend não atualiza após mudar `.env.local`

**Causa:** Next.js cacheia variáveis de ambiente

**Solução:**
```bash
# Parar o servidor (Ctrl+C)
# Limpar cache
rm -rf .next

# Reiniciar
npm run dev
```

## 📚 Estrutura de Arquivos de Configuração

```
The-Loom-FrontEnd/
├── .env.example          # Template (commitado no Git)
├── .env.local            # Configuração local (NÃO commitado)
├── render.yaml           # Configuração do Render (commitado)
├── next.config.mjs       # Configuração do Next.js
└── lib/
    └── constants.ts      # Constantes que usam env vars
```

## 🔒 Segurança

### ✅ O que PODE ser commitado:
- `.env.example` (template sem valores sensíveis)
- `render.yaml` (com valores públicos ou placeholders)

### ❌ O que NÃO PODE ser commitado:
- `.env.local` (configuração local com valores reais)
- `.env` (nunca use este arquivo)
- Qualquer arquivo com chaves privadas ou secrets

**O `.gitignore` já está configurado para proteger esses arquivos!**

## 📋 Referências

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [The Loom Backend API](../The-Loom-Backend/DEPLOY.md)

---

**Dica:** Sempre teste localmente antes de fazer deploy! 🧪

```bash
npm run build && npm start
```

Se funcionar local, funcionará no Render! 🚀
