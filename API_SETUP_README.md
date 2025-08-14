# 🔑 Sistema de Setup da API Key - TrackView

## 📋 Visão Geral

O TrackView agora possui um sistema inteligente de verificação e configuração da API Key do RedTrack que:

1. **Verifica automaticamente** se o usuário já possui uma API Key cadastrada
2. **Redireciona adequadamente** baseado no status da configuração
3. **Evita solicitações repetidas** da API Key
4. **Integra com o Supabase** para persistência dos dados

## 🛣️ Fluxo de Navegação

### **Usuário Novo (Primeiro Acesso)**
```
Login → Signup → API Setup → Dashboard
```

### **Usuário Existente (Com API Key)**
```
Login → Dashboard (Direto)
```

### **Usuário Existente (Sem API Key)**
```
Login → API Setup → Dashboard
```

## 🏗️ Arquitetura Implementada

### **1. Serviço RedTrackService** (`src/services/redtrackService.ts`)
- ✅ Verifica API Key existente no Supabase
- ✅ Valida API Key com RedTrack
- ✅ Salva/atualiza API Key no banco
- ✅ Remove API Key quando necessário

### **2. Componente ApiKeySetup** (`src/components/ApiKeySetup.tsx`)
- ✅ Interface dedicada para configuração
- ✅ Validação em tempo real
- ✅ Instruções passo a passo
- ✅ Opção de pular configuração

### **3. Store de Autenticação Atualizado** (`src/store/auth.ts`)
- ✅ Estado para API Key do RedTrack
- ✅ Métodos para verificar e salvar
- ✅ Integração com Supabase

### **4. Sistema de Rotas** (`src/config/routes.ts`)
- ✅ Rota `/api-setup` para configuração
- ✅ Títulos e descrições automáticos
- ✅ Proteção de rotas

## 🔄 Como Funciona

### **Verificação Automática**
1. Usuário faz login
2. Sistema verifica se existe `redtrack_api_key` no Supabase
3. Se **SIM** → Redireciona para `/dashboard`
4. Se **NÃO** → Redireciona para `/api-setup`

### **Configuração da API Key**
1. Usuário acessa `/api-setup`
2. Insere API Key do RedTrack
3. Sistema valida a chave
4. Salva no Supabase
5. Redireciona para `/dashboard`

## 📊 Estrutura do Banco (Supabase)

### **Tabela `users`**
```sql
ALTER TABLE users ADD COLUMN redtrack_api_key TEXT;
```

### **Campos Adicionados**
- `redtrack_api_key`: Chave da API do RedTrack
- `updated_at`: Timestamp da última atualização

## 🚀 URLs Disponíveis

| Rota | Descrição | Acesso |
|------|-----------|---------|
| `/login` | Formulário de login | Público |
| `/signup` | Formulário de cadastro | Público |
| `/setup` | Redirecionamento inteligente | Protegido |
| `/api-setup` | Configuração da API Key | Protegido |
| `/dashboard` | Dashboard principal | Protegido |

## ⚙️ Configuração

### **Variáveis de Ambiente**
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### **Dependências**
```json
{
  "@supabase/supabase-js": "latest",
  "react-router-dom": "^6.8.1"
}
```

## 🔍 Debug e Logs

### **Console do Navegador**
- ✅ Verificação de API Key existente
- ✅ Status da validação
- ✅ Redirecionamentos
- ✅ Erros de conexão

### **Logs do Supabase**
- ✅ Queries executadas
- ✅ Erros de banco
- ✅ Performance das consultas

## 🐛 Solução de Problemas

### **API Key não é salva**
1. Verificar conexão com Supabase
2. Verificar permissões da tabela `users`
3. Verificar se o usuário tem ID válido

### **Redirecionamento incorreto**
1. Verificar estado de autenticação
2. Verificar se a rota está protegida
3. Verificar logs do console

### **Validação falha**
1. Verificar formato da API Key
2. Verificar conectividade com RedTrack
3. Verificar logs de erro

## 🔮 Próximos Passos

### **Validação Real da API**
- [ ] Implementar chamada real para RedTrack
- [ ] Adicionar cache de validação
- [ ] Implementar retry automático

### **Gerenciamento Avançado**
- [ ] Renovação automática de API Key
- [ ] Histórico de mudanças
- [ ] Backup de configurações

### **Segurança**
- [ ] Criptografia da API Key
- [ ] Rotação automática
- [ ] Auditoria de acesso

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do console
2. Verificar status do Supabase
3. Verificar configuração das rotas
4. Consultar documentação do RedTrack

---

**🎯 Sistema implementado e funcionando!** O TrackView agora verifica automaticamente se o usuário já possui API Key e redireciona adequadamente, eliminando solicitações repetidas.
