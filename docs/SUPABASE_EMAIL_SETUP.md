# Configuração de Email no Supabase

## Problema Atual

O reset de senha está sendo registrado nos logs de auditoria, mas **nenhum email está sendo enviado**.

### Sintomas

- Função `resetPasswordForEmail()` não retorna erro
- Audit log registra a ação corretamente
- Usuário não recebe email (nem no spam)

## Causa Raiz

Por padrão, o Supabase em modo de desenvolvimento **não envia emails reais**. É necessário configurar um provedor SMTP ou usar o serviço de email do Supabase.

## Solução: Configurar Email no Supabase

### Opção 1: Habilitar Email Templates (Recomendado para Desenvolvimento)

1. **Acesse o Supabase Dashboard**

   - Vá para: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Navegue para Authentication → Email Templates**

   - Menu lateral: `Authentication` > `Email Templates`

3. **Configure o template "Reset Password"**

   - Clique em "Reset Password"
   - Verifique se o template está ativo
   - Confirme a URL de redirect: `{{ .ConfirmationURL }}`

4. **Verifique as configurações de SMTP**
   - Vá em: `Project Settings` > `Auth` > `SMTP Settings`
   - Para desenvolvimento, você pode usar o email padrão do Supabase

### Opção 2: Configurar SMTP Customizado (Produção)

Para produção, configure um serviço SMTP profissional:

#### Gmail SMTP (Desenvolvimento/Testes)

1. **Crie uma App Password no Gmail**

   - Acesse: https://myaccount.google.com/apppasswords
   - Crie senha para "Mail"
   - Copie a senha gerada

2. **Configure no Supabase Dashboard**

   - `Project Settings` > `Auth` > `SMTP Settings`
   - **Enable Custom SMTP**: ON
   - **Sender Email**: seu-email@gmail.com
   - **Sender Name**: SurgiScheduler Demo
   - **Host**: smtp.gmail.com
   - **Port Number**: 587
   - **Username**: seu-email@gmail.com
   - **Password**: [App Password copiada]
   - **Minimum Interval**: 60 (segundos entre emails)

3. **Teste a configuração**
   - Clique em "Send Test Email"
   - Verifique se recebeu o email de teste

#### SendGrid (Recomendado para Produção)

1. **Crie conta gratuita no SendGrid**

   - https://sendgrid.com/
   - Plano gratuito: 100 emails/dia

2. **Crie API Key**

   - Settings > API Keys > Create API Key
   - Nome: "Supabase Auth"
   - Permissions: Full Access
   - Copie a API Key

3. **Configure no Supabase**
   - **Enable Custom SMTP**: ON
   - **Host**: smtp.sendgrid.net
   - **Port Number**: 587
   - **Username**: apikey (literal)
   - **Password**: [API Key copiada]
   - **Sender Email**: noreply@seudominio.com
   - **Sender Name**: SurgiScheduler Demo

#### AWS SES (Alta escala)

Para grandes volumes:

- Host: `email-smtp.us-east-1.amazonaws.com`
- Port: 587
- Requer verificação de domínio

### Opção 3: Modo Desenvolvimento - Inbucket (Local)

Se estiver rodando Supabase localmente:

```bash
# No supabase/config.toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[inbucket]
enabled = true
port = 54324
```

Acesse emails em: http://localhost:54324

## Verificando a Configuração

Após configurar, teste o reset de senha:

1. **Teste pelo código**

   - Clique em "Reset Senha" na tela de usuários
   - Verifique console do navegador para logs
   - **Se aparecer `Password reset email sent: {}`** (objeto vazio):
     - ⚠️ Email NÃO foi enviado
     - Verifique Email Templates (passo abaixo)

2. **IMPORTANTE: Habilite Email Templates**

   Esse é o problema mais comum quando `data` retorna vazio:

   - Dashboard > `Authentication` > `Email Templates`
   - Encontre **"Confirm signup"** ou **"Magic Link"**
   - Certifique-se que o template está **HABILITADO** (toggle ON)
   - Verifique se contém `{{ .ConfirmationURL }}`
   - Clique em **Save**

3. **Verifique os logs do Supabase**

   - Dashboard > Logs > Auth Logs
   - Procure por eventos `user.recovery.sent`
   - Se aparecer `user.recovery.failed`, veja a mensagem de erro

4. **Confirme recebimento do email**
   - Verifique inbox
   - Verifique pasta de spam
   - Aguarde até 5 minutos

## Templates de Email Customizados

### Reset Password Template

```html
<h2>Redefinir Senha</h2>
<p>Olá,</p>
<p>
  Você solicitou a redefinição de senha para sua conta no Sistema de Bloco
  SurgiScheduler Demo.
</p>
<p>Clique no link abaixo para criar uma nova senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Este link expira em 60 minutos.</p>
<p>Se você não solicitou esta redefinição, ignore este email.</p>
<p>Atenciosamente,<br />Equipe SurgiScheduler Demo</p>
```

### Variáveis Disponíveis

- `{{ .ConfirmationURL }}` - URL completa com token
- `{{ .Token }}` - Token apenas
- `{{ .SiteURL }}` - URL base do site
- `{{ .Email }}` - Email do usuário

## Configuração da Página de Reset

Crie a página `/app/auth/reset-password/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      alert('Erro ao redefinir senha: ' + error.message)
    } else {
      alert('Senha redefinida com sucesso!')
      router.push('/login')
    }

    setLoading(false)
  }

  return (
    <div>
      <h1>Redefinir Senha</h1>
      <form onSubmit={handleReset}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nova senha"
          minLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>
      </form>
    </div>
  )
}
```

## Troubleshooting

### Email não chega - Objeto vazio retornado: `{}`

**Sintoma**: Console mostra `Password reset email sent: {}` mas email não chega.

**Causa**: Email Templates desabilitados ou mal configurados.

**Solução**:

1. Dashboard > `Authentication` > `Email Templates`
2. Procure **todos os templates** e habilite-os:
   - ✅ Confirm signup
   - ✅ Invite user
   - ✅ Magic Link
   - ✅ Change Email Address
   - ✅ Reset Password (crítico!)
3. Cada template deve conter `{{ .ConfirmationURL }}`
4. Salve e teste novamente

### Email não chega - SMTP configurado

1. **Verifique SMTP Settings**

   - Credenciais corretas?
   - Para Gmail: usou **App Password** (não senha normal)?
   - Firewall bloqueando porta 587?
   - Sender Email = Username?

2. **Teste SMTP diretamente**

   - Na página de SMTP Settings
   - Botão "Send Test Email"
   - Se não funcionar, problema nas credenciais

3. **Verifique Auth Logs**

   - Dashboard > Logs > Auth Logs
   - Procure por erros
   - `user.recovery.failed` = erro ao enviar

4. **Rate Limiting**
   - Aguarde 60 segundos entre tentativas
   - Verifique "Minimum Interval" nas configurações

### Email vai para spam

1. **Configure SPF/DKIM**

   - Necessário para produção
   - Configure no seu domínio

2. **Use domínio verificado**

   - SendGrid/AWS SES requerem verificação

3. **Evite palavras de spam**
   - Revise templates de email

## Checklist de Produção

- [ ] SMTP configurado com provedor confiável (SendGrid/SES)
- [ ] Domínio de email verificado
- [ ] SPF/DKIM configurados
- [ ] Templates de email customizados
- [ ] Rate limiting apropriado
- [ ] Página de reset de senha implementada
- [ ] Testes de envio realizados
- [ ] Monitoramento de bounces/falhas configurado

## Referências

- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SendGrid Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
