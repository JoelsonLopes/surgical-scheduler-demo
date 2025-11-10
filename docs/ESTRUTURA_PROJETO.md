# Documentação da Estrutura do Projeto

## Sistema de Gestão do Bloco Cirúrgico - Clínica Lavinsky

**Versão:** 1.0.0
**Data:** 13 de Outubro de 2025
**Stack:** Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Autenticação e Segurança](#autenticação-e-segurança)
6. [Rotas da Aplicação](#rotas-da-aplicação)
7. [Componentes UI](#componentes-ui)
8. [Configurações](#configurações)
9. [Fluxos de Usuário](#fluxos-de-usuário)
10. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

Sistema web para gestão e agendamento do bloco cirúrgico da Clínica Lavinsky, desenvolvido com foco em:

- **Performance**: Respostas em menos de 200ms para operações críticas
- **Segurança**: Conformidade com LGPD e HIPAA
- **Confiabilidade**: Disponibilidade de 99.9%

### Tecnologias Principais

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Notificações**: Sonner (Toast notifications)
- **Ícones**: Lucide React

---

## 🏗️ Arquitetura do Projeto

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  Landing Page (/)  │  Auth Pages  │  Dashboard (Protegido) │
│                    │  /auth/*     │  /dashboard            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware (Proteção)                     │
│              Verifica autenticação em todas                  │
│              as rotas, exceto públicas                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase (Backend)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth API   │  │  PostgreSQL  │  │  Realtime    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
lavinsky-bloco-cirugico/
│
├── app/                          # Next.js App Router
│   ├── auth/                     # Páginas de autenticação
│   │   ├── login/
│   │   │   └── page.tsx         # Página de login
│   │   └── reset-password/
│   │       └── page.tsx         # Recuperação e redefinição de senha
│   │
│   ├── dashboard/               # Área autenticada
│   │   ├── layout.tsx          # Layout do dashboard
│   │   └── page.tsx            # Dashboard principal
│   │
│   ├── layout.tsx              # Layout raiz da aplicação
│   ├── page.tsx                # Landing page (home)
│   └── globals.css             # Estilos globais
│
├── components/                  # Componentes React
│   ├── ui/                     # Componentes UI (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── sonner.tsx         # Toast notifications
│   └── theme-provider.tsx     # Provider de tema (dark/light)
│
├── lib/                        # Utilitários e configurações
│   └── supabase/
│       ├── client.ts          # Cliente Supabase (browser)
│       ├── server.ts          # Cliente Supabase (server)
│       └── middleware.ts      # Middleware de autenticação
│
├── hooks/                      # React Hooks customizados
│
├── public/                     # Arquivos estáticos
│   ├── logo-lavinsky.jpg      # Logo da clínica
│   └── favicon.svg
│
├── docs/                       # Documentação do projeto
│   └── ESTRUTURA_PROJETO.md   # Este arquivo
│
├── .env.local                 # Variáveis de ambiente (não versionado)
├── .env.example              # Exemplo de variáveis de ambiente
├── middleware.ts             # Middleware global do Next.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## ✨ Funcionalidades Implementadas

### 1. Sistema de Autenticação

#### Login de Usuário

- **Rota**: `/auth/login`
- **Funcionalidades**:
  - Formulário de login com email e senha
  - Validação em tempo real
  - Autocomplete configurado para melhor UX
  - Mensagens de erro amigáveis
  - Redirecionamento automático para dashboard após login
  - Loading state durante autenticação

#### Recuperação de Senha

- **Rota**: `/auth/reset-password`
- **Funcionalidades**:

  - **Modo 1 - Solicitar recuperação**:

    - Envio de email com link de recuperação
    - Integração com Supabase Auth
    - Confirmação visual de envio

  - **Modo 2 - Redefinir senha** (mesma página):
    - Detecção automática do token de recuperação
    - Formulário para nova senha com confirmação
    - Validação de força de senha
    - Toggle de visibilidade de senha
    - Redirecionamento automático após sucesso

### 2. Dashboard Protegido

- **Rota**: `/dashboard`
- **Funcionalidades**:
  - Acesso restrito a usuários autenticados
  - Exibição de informações do usuário logado
  - Status do sistema
  - Cards de funcionalidades (preparados para expansão)
  - Botão de logout funcional
  - Design responsivo

### 3. Landing Page

- **Rota**: `/`
- **Funcionalidades**:
  - Apresentação do sistema
  - Link para login
  - Link para documentação
  - Cards informativos sobre o sistema

---

## 🔐 Autenticação e Segurança

### Middleware de Proteção

Localização: `/middleware.ts` e `/lib/supabase/middleware.ts`

**Rotas Públicas** (não requerem autenticação):

- `/` - Landing page
- `/auth/login` - Login
- `/auth/reset-password` - Recuperação de senha
- Todas as rotas que começam com `/auth/`

**Rotas Protegidas** (requerem autenticação):

- `/dashboard` e todas as sub-rotas
- Qualquer rota não explicitamente pública

**Comportamento**:

1. Middleware verifica sessão do usuário em cada requisição
2. Se não autenticado e tentando acessar rota protegida → redireciona para `/auth/login`
3. Se autenticado → permite acesso
4. Gerencia cookies de sessão automaticamente

### Fluxo de Autenticação

```
┌─────────────────┐
│  Usuário acessa │
│  rota protegida │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Middleware verifica│
│  sessão Supabase    │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Autenticado  Não Autenticado
    │         │
    │         └──────► Redireciona para /auth/login
    │
    └──────► Permite acesso
```

---

## 🗺️ Rotas da Aplicação

### Rotas Públicas

| Rota                  | Arquivo                            | Descrição                          |
| --------------------- | ---------------------------------- | ---------------------------------- |
| `/`                   | `app/page.tsx`                     | Landing page do sistema            |
| `/auth/login`         | `app/auth/login/page.tsx`          | Página de login                    |
| `/auth/rest-password` | `app/auth/reset-password/page.tsx` | Recuperação e redefinição de senha |

### Rotas Protegidas

| Rota         | Arquivo                  | Descrição                         |
| ------------ | ------------------------ | --------------------------------- |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard principal (autenticado) |

### URLs de Redirecionamento

- **Após login bem-sucedido**: `/dashboard`
- **Após logout**: `/auth/login`
- **Após redefinição de senha**: `/auth/login`
- **Usuário não autenticado tenta acessar rota protegida**: `/auth/login`

---

## 🎨 Componentes UI

### shadcn/ui Components

Todos localizados em `components/ui/`:

1. **Button** (`button.tsx`)

   - Variantes: default, destructive, outline, secondary, ghost, link
   - Tamanhos: default, sm, lg, icon

2. **Card** (`card.tsx`)

   - Card, CardHeader, CardTitle, CardDescription, CardContent
   - Usado para containers de conteúdo

3. **Input** (`input.tsx`)

   - Input de texto configurado com Tailwind
   - Suporte a autocomplete

4. **Label** (`label.tsx`)

   - Labels para formulários acessíveis

5. **Sonner** (`sonner.tsx`)
   - Sistema de notificações toast
   - Suporte a temas (dark/light)

### Componentes Customizados

1. **ThemeProvider** (`components/theme-provider.tsx`)
   - Gerenciamento de tema dark/light
   - Integração com next-themes

---

## ⚙️ Configurações

### Variáveis de Ambiente

Arquivo: `.env.local` (não versionado)

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

**Importante**:

- Nunca commitar `.env.local`
- Usar `.env.example` como referência
- Configurar no Supabase Dashboard:
  - Email templates (Reset Password)
  - Redirect URLs
  - Email provider

### Supabase Configuration

**URL de Redirecionamento para Produção**:

```
https://seu-dominio.com/auth/recuperar-senha
```

**URL de Redirecionamento para Desenvolvimento**:

```
http://localhost:3000/auth/recuperar-senha
```

Configurar em: **Supabase Dashboard → Authentication → URL Configuration**

### Next.js Configuration

Arquivo: `next.config.ts`

- App Router habilitado
- TypeScript strict mode
- Otimização de imagens
- Configuração de domínios permitidos para imagens

### Tailwind Configuration

Arquivo: `tailwind.config.ts`

- Tema personalizado para Clínica Lavinsky
- Cores: primary, secondary, destructive, etc.
- Breakpoints responsivos
- Plugins: tailwindcss-animate

---

## 👤 Fluxos de Usuário

### 1. Fluxo de Login

```
Início
  │
  ▼
Usuário acessa /auth/login
  │
  ▼
Preenche email e senha
  │
  ▼
Clica em "Entrar"
  │
  ├─► Credenciais inválidas → Exibe erro
  │
  └─► Credenciais válidas
        │
        ▼
      Toast de sucesso
        │
        ▼
      Redireciona para /dashboard
        │
        ▼
      Dashboard carrega dados do usuário
```

### 2. Fluxo de Recuperação de Senha

```
Início
  │
  ▼
Usuário acessa /auth/reset-password
  │
  ▼
Preenche email
  │
  ▼
Clica em "Enviar link"
  │
  ▼
Sistema envia email via Supabase
  │
  ▼
Usuário recebe email
  │
  ▼
Clica no link do email
  │
  ▼
Sistema detecta token de recovery
  │
  ▼
Exibe formulário de nova senha
  │
  ▼
Usuário define nova senha
  │
  ▼
Senha atualizada com sucesso
  │
  ▼
Redireciona para /auth/login
```

### 3. Fluxo de Logout

```
Usuário está em /dashboard
  │
  ▼
Clica em "Sair"
  │
  ▼
Sistema chama supabase.auth.signOut()
  │
  ▼
Sessão é encerrada
  │
  ▼
Toast de confirmação
  │
  ▼
Redireciona para /auth/login
```

---

## 📱 Design Responsivo

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Componentes Adaptáveis

Todos os componentes foram desenvolvidos com mobile-first:

```tsx
// Exemplo de grid responsivo
className = 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
```

---

## 🎨 Temas e Estilos

### Paleta de Cores

Definida em `globals.css`:

```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--secondary: 210 40% 96.1%;
--muted: 210 40% 96.1%;
--destructive: 0 84.2% 60.2%;
--border: 214.3 31.8% 91.4%;
```

### Dark Mode

Suporte total a dark mode via `next-themes`:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

---

## 🔧 Boas Práticas Implementadas

### 1. Acessibilidade

- ✅ Autocomplete em inputs de formulário
- ✅ Labels associados a inputs
- ✅ Contraste adequado de cores
- ✅ Foco visível em elementos interativos
- ✅ Mensagens de erro descritivas

### 2. Performance

- ✅ Next.js Image optimization com `sizes` prop
- ✅ Lazy loading de componentes
- ✅ Server-side rendering onde apropriado
- ✅ Cache de assets estáticos
- ✅ Minimização de bundle

### 3. Segurança

- ✅ Proteção de rotas via middleware
- ✅ Variáveis de ambiente nunca expostas
- ✅ Validação de inputs
- ✅ HTTPS em produção
- ✅ Conformidade LGPD/HIPAA

### 4. UX/UI

- ✅ Loading states em todas as ações
- ✅ Toast notifications para feedback
- ✅ Mensagens de erro amigáveis
- ✅ Design consistente
- ✅ Responsividade total

---

## 📊 Status do Projeto

### ✅ Implementado

- [x] Sistema de autenticação completo
- [x] Recuperação de senha
- [x] Dashboard protegido
- [x] Middleware de proteção de rotas
- [x] Landing page
- [x] Design system (shadcn/ui)
- [x] Tema dark/light
- [x] Toast notifications
- [x] Validações de formulário
- [x] Design responsivo

### 🚧 Em Desenvolvimento

- [ ] Gestão de agendamentos cirúrgicos
- [ ] Gestão de equipe médica
- [ ] Sistema de relatórios
- [ ] Notificações em tempo real
- [ ] Dashboard com métricas

### 📋 Próximos Passos

#### Fase 2 - Agendamentos

1. CRUD de cirurgias
2. Calendário interativo
3. Gestão de salas cirúrgicas
4. Gestão de equipamentos
5. Sistema de conflitos

#### Fase 3 - Equipe

1. CRUD de médicos
2. CRUD de enfermeiros
3. Gestão de especialidades
4. Escalas de trabalho
5. Disponibilidade

#### Fase 4 - Relatórios

1. Dashboard com métricas
2. Relatórios de ocupação
3. Relatórios financeiros
4. Exportação (PDF/Excel)
5. Gráficos interativos

#### Fase 5 - Integrações

1. Integração com sistemas hospitalares
2. API pública
3. Webhooks
4. Notificações por email/SMS

---

## 🚀 Como Executar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Iniciar servidor de desenvolvimento
npm run dev
```

### Produção

```bash
# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

### Comandos Úteis

```bash
# Verificar tipos TypeScript
npm run type-check

# Limpar cache do Next.js
rm -rf .next

# Atualizar dependências
npm update
```

---

## 📚 Documentação Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Suporte

Para problemas ou dúvidas:

- **Email**: suporte@clinicalavinsky.com.br
- **Issues**: GitHub Repository Issues

---

## 📄 Licença

© 2025 Clínica Lavinsky. Todos os direitos reservados.

Sistema proprietário - Uso restrito e confidencial.

---

**Última atualização**: 13 de Outubro de 2025
**Versão do documento**: 1.0.0
