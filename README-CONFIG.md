# ✅ Resumo: Configuração de Variáveis de Ambiente

## 📁 Arquivos Criados/Atualizados

### ✨ Novos Arquivos
1. **`.env.example`** - Template para configuração (commitado no Git)
2. **`CONFIGURACAO.md`** - Guia completo de configuração

### 🔄 Arquivos Atualizados
1. **`.env.local`** - Configuração local (NÃO commitado)
2. **`render.yaml`** - Todas as variáveis de ambiente configuradas
3. **`DEPLOY.md`** - Instruções de configuração atualizadas

## 🚀 Como Usar

### Para Desenvolvimento Local

```bash
# 1. Copiar template
cp .env.example .env.local

# 2. Instalar e rodar
npm install
npm run dev
```

O `.env.local` já vem configurado para desenvolvimento local (backend em `localhost:3001`)

### Para Deploy no Render

```bash
# 1. Commitar código
git add .
git commit -m "Configurar variáveis de ambiente"
git push origin main

# 2. No Render Dashboard
# - Criar Blueprint (detecta render.yaml automaticamente)
# - OU criar Web Service manualmente e configurar variáveis
```

## 📋 Variáveis de Ambiente

| Variável | Desenvolvimento | Produção |
|----------|----------------|----------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `http://localhost:3001` | `https://loom-backend-api.onrender.com` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xF3fB...` | `0xF3fB...` (mesmo) |
| `NEXT_PUBLIC_RPC_URL` | `https://sepolia-rpc.scroll.io` | (mesmo) |
| `NEXT_PUBLIC_CHAIN_ID` | `534351` | `534351` (mesmo) |

## 🔧 Alterando Configurações

### Localmente (Desenvolvimento)

Edite `.env.local`:

```bash
# Alterar para usar backend em produção durante desenvolvimento
NEXT_PUBLIC_BACKEND_API_URL=https://loom-backend-api.onrender.com
```

Reinicie o servidor:
```bash
# Ctrl+C para parar
rm -rf .next  # Limpar cache
npm run dev   # Reiniciar
```

### No Render (Produção)

**Opção 1: Editar render.yaml e fazer redeploy**

```yaml
envVars:
  - key: NEXT_PUBLIC_BACKEND_API_URL
    value: https://NOVA-URL.onrender.com
```

```bash
git add render.yaml
git commit -m "Atualizar URL do backend"
git push origin main
# Render faz redeploy automático
```

**Opção 2: Editar no Dashboard (sem redeploy do código)**

1. Render Dashboard → `loom-frontend` → Environment
2. Editar `NEXT_PUBLIC_BACKEND_API_URL`
3. Save Changes (redeploy automático)

## 📚 Documentação Completa

- **Guia de Configuração:** `CONFIGURACAO.md`
- **Guia de Deploy:** `DEPLOY.md`
- **Template de Variáveis:** `.env.example`

## ✅ Checklist

- [x] `.env.example` criado como template
- [x] `.env.local` configurado para desenvolvimento
- [x] `render.yaml` com todas as variáveis
- [x] `.gitignore` protegendo `.env.local`
- [x] Documentação completa criada
- [x] Guia de troubleshooting incluído

## 🎯 Próximos Passos

1. **Testar Localmente:**
   ```bash
   npm install
   npm run dev
   # Abrir http://localhost:3000
   ```

2. **Deploy no Render:**
   - Seguir instruções do `DEPLOY.md`
   - Usar Blueprint (mais fácil)
   - Variáveis já configuradas no `render.yaml`

3. **Verificar Funcionamento:**
   - Frontend carrega: ✅
   - Conecta carteira: ✅
   - Busca jobs do backend: ✅
   - Interage com contrato: ✅

---

**Tudo pronto para deploy! 🚀**

Consulte `CONFIGURACAO.md` para detalhes completos.
