# Sistema de Senha Padrão e Troca Obrigatória

## Visão Geral

Este sistema implementa:

- Criação de usuários com senha padrão `Lavinsky@1234`
- Troca obrigatória de senha no primeiro login
- Validação de senha forte
- Redirecionamento automático via middleware
- Atualização automática de `last_login` em cada login
- Deleção completa de usuários (Auth + Database)
- Reset de senha para senha padrão

## Fluxo do Sistema

```
1. Admin cria novo usuário
   ↓
2. Usuário criado com senha: Lavinsky@1234
   ↓
3. Flag force_password_change = true
   ↓
4. Usuário faz login com senha padrão
   ↓
5. Middleware detecta force_password_change = true
   ↓
6. Redireciona para /change-password
   ↓
7. Usuário define nova senha
   ↓
8. Flag force_password_change = false
   ↓
9. Redireciona para /dashboard
```

## Configuração

### 1. Aplicar Migração do Banco de Dados

Execute a migração para adicionar a coluna `force_password_change`:

```bash
# Via Supabase CLI (recomendado)
npx supabase db push

# Ou execute manualmente no SQL Editor do Supabase Dashboard
```

SQL da migração em: `/supabase/migrations/20251016_add_force_password_change.sql`

### 2. Configurar Variáveis de Ambiente

Adicione no seu arquivo `.env.local`:

```env
# Supabase Service Role Key (encontre no dashboard)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Senha padrão para novos usuários
DEFAULT_USER_PASSWORD=Lavinsky@1234
```

**⚠️ IMPORTANTE**: O `SUPABASE_SERVICE_ROLE_KEY` é diferente da `ANON_KEY`:

1. Acesse: https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/settings/api
2. Copie a chave **`service_role`** (não a `anon` key)
3. **NUNCA exponha esta chave no client-side**

### 3. Aplicar Migração de RLS (Row Level Security)

Execute a migração para permitir que usuários atualizem `force_password_change` e `last_login`:

```bash
# Execute no Supabase SQL Editor
# Dashboard > SQL Editor > New Query
```

SQL da migração em: `/supabase/migrations/20251016_allow_password_change_updates.sql`

Esta migração atualiza a política RLS para permitir que os usuários atualizem seus próprios campos de senha e login, mantendo a segurança de campos críticos como `role`, `is_active` e `is_blocked`.

### 4. Verificar Instalação

Componentes criados:

- ✅ `/app/api/admin/create-user/route.ts` - API para criar usuário com senha
- ✅ `/app/api/admin/reset-password/route.ts` - API para resetar senha para padrão
- ✅ `/app/api/admin/delete-user/route.ts` - API para deletar usuário (Auth + DB)
- ✅ `/app/change-password/page.tsx` - Página de troca de senha
- ✅ `/app/auth/reset-password/page.tsx` - Página de reset de senha
- ✅ `/app/auth/login/page.tsx` - Atualiza `last_login` no login
- ✅ `/supabase/migrations/20251016_add_force_password_change.sql` - Adiciona coluna
- ✅ `/supabase/migrations/20251016_allow_password_change_updates.sql` - Atualiza RLS
- ✅ Middleware atualizado para detectar primeiro login
- ✅ Hooks atualizados (`useUsers`, `useUserActions`)

## Uso

### Criando Usuário

1. Admin acessa `/dashboard/users`
2. Clica em "Novo Usuário"
3. Preenche o formulário
4. Sistema cria usuário com senha `Lavinsky@1234`
5. Toast mostra: "User created successfully with default password: Lavinsky@1234"

### Primeiro Login do Usuário

1. Usuário faz login com:

   - Email: seu-email@exemplo.com
   - Senha: Lavinsky@1234

2. Sistema detecta `force_password_change = true`

3. Redireciona automaticamente para `/change-password`

4. Usuário define nova senha com requisitos:

   - Mínimo 8 caracteres
   - Pelo menos 1 letra maiúscula
   - Pelo menos 1 letra minúscula
   - Pelo menos 1 número
   - Pelo menos 1 caractere especial (!@#$%^&\*)

5. Após alterar, redireciona para `/dashboard`

### Recuperação de Senha (Esqueceu a Senha)

1. Usuário clica em "Esqueceu sua senha?" na tela de login

2. É redirecionado para `/auth/reset-password`

3. Digita seu email e clica em "Resetar Senha"

4. Sistema reseta a senha para `Lavinsky@1234` e define `force_password_change = true`

5. Usuário vê mensagem de sucesso com instruções:

   - Voltar para o login
   - Usar senha padrão: `Lavinsky@1234`
   - Será redirecionado para criar nova senha

6. Usuário faz login com senha padrão

7. Middleware detecta `force_password_change = true`

8. Redireciona para `/change-password`

9. Usuário define nova senha personalizada

10. Após alterar, redireciona para `/dashboard`

**Nota**: Esta funcionalidade **não envia emails**. O reset é instantâneo e a senha é alterada diretamente para o padrão.

## Validações de Senha

A página `/change-password` valida:

```typescript
✅ Mínimo 8 caracteres
✅ Letra maiúscula (A-Z)
✅ Letra minúscula (a-z)
✅ Número (0-9)
✅ Caractere especial (!@#$%^&*(),.?":{}|<>)
✅ Senhas coincidem
```

Exemplos de senhas válidas:

- `Senha@123`
- `MinhaSenha$2024`
- `Bloco#Cirurgico1`

## Segurança

### Por que usar Service Role Key?

A criação de usuários requer permissões administrativas que a `anon_key` não possui:

- ✅ Criar usuário em Supabase Auth
- ✅ Definir senha inicial
- ✅ Auto-confirmar email
- ✅ Inserir registro na tabela `users`

### Proteções Implementadas

1. **API Route Server-Side**

   - Service Role Key nunca exposta no client
   - Validação de campos obrigatórios
   - Rollback se inserção na tabela falhar

2. **Middleware**

   - Verifica `force_password_change` em toda navegação
   - Redireciona antes de acessar qualquer rota protegida
   - Impede bypass da troca de senha

3. **Validação de Senha**
   - Client-side: feedback imediato
   - Server-side: Supabase Auth policies

## Customização

### Mudar Senha Padrão

Edite `.env.local`:

```env
DEFAULT_USER_PASSWORD=SuaNovaSenha@2024
```

### Ajustar Requisitos de Senha

Edite `/app/change-password/page.tsx`, função `validatePassword()`:

```typescript
const validatePassword = (password: string): string | null => {
  if (password.length < 12) {
    // Aumentar mínimo
    return 'A senha deve ter no mínimo 12 caracteres'
  }
  // Adicione mais validações conforme necessário
}
```

### Customizar Página de Troca de Senha

Componente em: `/app/change-password/page.tsx`

- Layout: Card com gradiente azul
- Ícones: Lucide React (KeyRound, Eye, EyeOff)
- Tema: Tailwind CSS + shadcn/ui

## Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY is not defined"

1. Verifique se `.env.local` existe
2. Confirme que a variável está definida
3. Reinicie o servidor Next.js

### Usuário não é redirecionado para /change-password

1. Verifique se middleware está ativo
2. Confirme que `force_password_change = true` no banco
3. Limpe cache do navegador
4. Verifique logs do console

### "Failed to create auth user"

1. Verifique se Service Role Key está correta
2. Confirme que email não existe
3. Veja logs no Supabase Dashboard > Logs > Auth

### Erro: "A user with this email address has already been registered"

Este erro ocorre quando você deleta um usuário da tabela `users` mas ele ainda existe no Supabase Auth.

**Solução:**

1. Acesse: Dashboard > Authentication > Users
2. Delete o usuário manualmente do Supabase Auth
3. Ou use a função de delete da interface que agora remove de ambos os lugares

**Prevenção:**

- Sempre use a função de delete da interface do sistema
- Ela remove o usuário tanto do Auth quanto da tabela automaticamente

### Senha não atualiza no banco (`force_password_change` continua `true`)

Isso indica que a migração de RLS não foi aplicada.

**Solução:**

1. Execute a migração: `/supabase/migrations/20251016_allow_password_change_updates.sql`
2. No Supabase SQL Editor
3. Verifique se a política foi atualizada:
   ```sql
   SELECT policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename = 'users' AND policyname = 'Users can update their own profile';
   ```

### `last_login` não está sendo atualizado

Verifique:

1. Se a migração de RLS foi aplicada corretamente
2. Se o código de login está chamando o update após `signInWithPassword`
3. Logs de erro no console do navegador

## Fluxo de Dados

### Criação de Usuário

```
Client (useUserActions)
  ↓ POST /api/admin/create-user
Server (API Route)
  ↓ supabaseAdmin.auth.admin.createUser()
Supabase Auth
  ✅ Usuário criado com senha
  ↓
Server (API Route)
  ↓ supabaseAdmin.from('users').insert()
Supabase Database
  ✅ Registro criado com force_password_change = true
```

### Troca de Senha

```
Client (/change-password)
  ↓ supabase.auth.updateUser({ password })
Supabase Auth
  ✅ Senha atualizada
  ↓
Client
  ↓ supabase.from('users').update({ force_password_change: false, updated_at })
Supabase Database (com RLS policy atualizada)
  ✅ Flag atualizada
  ↓
Redirect para /dashboard
```

### Login

```
Client (/auth/login)
  ↓ supabase.auth.signInWithPassword({ email, password })
Supabase Auth
  ✅ Autenticação bem-sucedida
  ↓
Client
  ↓ supabase.from('users').update({ last_login, updated_at })
Supabase Database
  ✅ Timestamp de login registrado
  ↓
Middleware verifica force_password_change
  ↓ true? Redirect para /change-password
  ↓ false? Permite acesso ao /dashboard
```

### Deleção de Usuário

```
Client (useUserActions.deleteUser)
  ↓ DELETE /api/admin/delete-user { userId }
Server (API Route)
  ↓ supabaseAdmin.from('users').delete()
Supabase Database
  ✅ Registro removido da tabela
  ↓
Server (API Route)
  ↓ supabaseAdmin.auth.admin.deleteUser(userId)
Supabase Auth
  ✅ Usuário removido do Auth
  ↓
Client
  ✅ Usuário completamente removido do sistema
```

### Reset de Senha

```
Client (/auth/reset-password)
  ↓ POST /api/admin/reset-password { email }
Server (API Route)
  ↓ supabaseAdmin.from('users').select('id').eq('email')
Supabase Database
  ✅ Verifica se usuário existe
  ↓
Server (API Route)
  ↓ supabaseAdmin.auth.admin.updateUserById({ password })
Supabase Auth
  ✅ Senha resetada para padrão
  ↓
Server (API Route)
  ↓ supabaseAdmin.from('users').update({ force_password_change: true })
Supabase Database
  ✅ Flag atualizada
  ↓
Client
  ✅ Mostra instruções para login com senha padrão
```

## Testes

### Teste Manual

1. **Criar usuário**:

   ```
   Email: teste@exemplo.com
   Nome: Usuário Teste
   Role: DOCTOR
   ```

2. **Fazer logout** do admin

3. **Fazer login** como novo usuário:

   ```
   Email: teste@exemplo.com
   Senha: Lavinsky@1234
   ```

4. **Verificar redirecionamento** para `/change-password`

5. **Definir nova senha**: `MinhaS enha@123`

6. **Verificar redirecionamento** para `/dashboard`

7. **Fazer logout** e **login novamente** com nova senha

8. **Confirmar** que não redireciona mais para change-password

### Teste de Reset de Senha

1. **Na tela de login**, clicar em "Esqueceu sua senha?"

2. **Digitar email** de um usuário existente

3. **Clicar em "Resetar Senha"**

4. **Verificar mensagem de sucesso** com instruções

5. **Voltar para login** e usar senha padrão `Lavinsky@1234`

6. **Verificar redirecionamento** para `/change-password`

7. **Definir nova senha personalizada**

8. **Verificar redirecionamento** para `/dashboard`

### Teste de Segurança

```bash
# Tentar acessar dashboard sem trocar senha
# Deve redirecionar para /change-password

# Tentar acessar /change-password sem login
# Deve redirecionar para /auth/login

# Tentar senha fraca
# Deve mostrar erro de validação
```

## Manutenção

### Resetar Senha de Usuário Existente

Para forçar um usuário existente a trocar senha:

```sql
UPDATE users
SET force_password_change = true
WHERE email = 'usuario@exemplo.com';
```

### Listar Usuários com Senha Não Alterada

```sql
SELECT id, email, name, created_at
FROM users
WHERE force_password_change = true
ORDER BY created_at DESC;
```

### Remover Obrigação de Troca

```sql
UPDATE users
SET force_password_change = false
WHERE id = 'user-id-aqui';
```

## Referências

- [Supabase Admin API](https://supabase.com/docs/reference/javascript/admin-api)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
