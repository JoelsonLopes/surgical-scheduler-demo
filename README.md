# Sistema de Gestão do Bloco Cirúrgico - Clínica Lavinsky

Sistema web para gestão e agendamento do bloco cirúrgico da Clínica Lavinsky, proporcionando aos médicos a funcionalidade de solicitação e acompanhamento de reservas, enquanto entrega aos administradores o controle completo sobre o fluxo de agendamentos.

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Estilização:** Tailwind CSS v4, shadcn/ui
- **Backend/Database:** Supabase (Auth, Database, Storage)
- **Hospedagem:** Vercel

## 📋 Pré-requisitos

- Node.js 18+ (recomendado: v22.19.0)
- npm ou yarn
- Conta Supabase (para desenvolvimento)

## 🛠️ Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd lavinsky-bloco-cirugico
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEFAULT_USER_PASSWORD=Lavinsky@1234
```

> **⚠️ Importante:** O `SUPABASE_SERVICE_ROLE_KEY` é necessário para funcionalidades administrativas como criação de usuários e reset de senha. Encontre esta chave em Settings > API no dashboard do Supabase.

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas do dashboard
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── layouts/          # Layouts reutilizáveis
│   └── features/         # Componentes de funcionalidades
├── lib/                   # Utilitários e bibliotecas
│   ├── supabase/         # Configuração Supabase
│   ├── hooks/            # Custom hooks
│   └── utils/            # Funções utilitárias
├── types/                 # Definições TypeScript
├── config/               # Arquivos de configuração
└── public/               # Arquivos estáticos
```

## 🏗️ Padrões de Desenvolvimento

### Nomenclatura

**Código:**

- Variáveis/Funções: `camelCase`
- Classes/Interfaces/Tipos TS: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Enums: `PascalCase` (valores em `UPPER_SNAKE_CASE`)

**Arquivos:**

- Componentes: `PascalCase.tsx`
- Hooks: `use[Nome].ts`
- Utils: `camelCase.ts`
- Testes: `[arquivo].test.ts` ou `.spec.ts`

**Banco de Dados:**

- Tabelas/Colunas: `snake_case`
- Índices: `idx_[tabela]_[coluna]`
- Triggers: `trg_[tabela]_[ação]`
- Functions: `fn_[nome_descritivo]`

### Idiomas

- **Código:** Inglês
- **Comentários técnicos:** Português BR
- **UI:** Português BR
- **Documentação:** Português BR (termos técnicos em inglês)
- **Commits:** Inglês (Conventional Commits)

### Princípios

- SOLID
- Clean Code
- DRY, KISS, YAGNI
- Domain-Driven Design (DDD)

## 🔒 Requisitos Não Funcionais

- **Performance:** API e tela de agenda respondendo em < 200ms
- **Segurança:** HTTPS, políticas de acesso granular, logs de auditoria, LGPD/HIPAA
- **Confiabilidade:** Uptime de 99.9%
- **Escalabilidade:** Arquitetura expansível para múltiplos blocos/unidades

## 📦 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
```

### Quality Assurance

```bash
# Testes
npm test             # Executa testes em modo watch
npm run test:run     # Executa todos os testes
npm run test:ui      # Abre interface visual de testes
npm run test:coverage # Relatório de cobertura de código

# Formatação
npm run format       # Formata código com Prettier
npm run format:check # Verifica formatação sem alterar arquivos

# Linting
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas automaticamente

# Type Checking
npm run type-check   # Verifica tipos TypeScript

# Pipeline Completo
npm run qa           # Executa todo pipeline QA (format → lint → type-check → test)
npm run ci           # Pipeline completo + build (usado em CI/CD)
```

### Git Hooks

```bash
npm run pre-commit   # Executa lint-staged (automático no commit)
npm run pre-push     # Executa QA completo (automático no push)
```

## ✅ Quality Assurance

Este projeto possui uma infraestrutura completa de QA com testes automatizados, verificações de qualidade e git hooks.

### Stack de QA

- **Vitest 2.1.8** - Framework de testes (unitários, integração, componentes)
- **Testing Library** - Testes de componentes React
- **Prettier 3.4.2** - Formatação automática de código
- **ESLint 9** - Análise estática e linting
- **TypeScript** - Type checking com regras strict
- **Husky 9.1.7** - Git hooks automatizados
- **lint-staged** - Linting otimizado em arquivos staged

### Executando Testes

```bash
# Modo watch (recomendado durante desenvolvimento)
npm test

# Executar todos os testes uma vez
npm run test:run

# Interface visual interativa
npm run test:ui

# Com relatório de cobertura
npm run test:coverage
```

### Pipeline QA Completo

O comando `npm run qa` executa sequencialmente:

1. **Formatação** - Verifica se código está formatado (Prettier)
2. **Linting** - Analisa problemas de código (ESLint)
3. **Type Check** - Verifica tipos TypeScript
4. **Testes** - Executa todos os testes (Vitest)

⏱️ Tempo estimado: 10-30 segundos

### Git Hooks Automáticos

**Pre-commit (antes de cada commit):**

- Executa `lint-staged` nos arquivos modificados
- Aplica formatação e linting apenas nos arquivos staged
- Bloqueia commit se houver erros

**Pre-push (antes de cada push):**

- Executa pipeline QA completo
- Garante que código no repositório remoto passou por todas verificações
- Bloqueia push se houver falhas

### Estrutura de Testes

```
test/
├── setup.ts                      # Configuração global de testes
├── unit/                        # Testes unitários
│   ├── utils.test.ts           # Funções utilitárias
│   ├── validations.test.ts     # Validações de formulários
│   └── supabase-helpers.test.ts # Helpers do Supabase
├── integration/                 # Testes de integração
│   ├── auth.test.ts            # Fluxos de autenticação
│   ├── surgeries-crud.test.ts  # CRUD de cirurgias
│   └── patients-crud.test.ts   # CRUD de pacientes
└── components/                  # Testes de componentes
    ├── ui/                     # Componentes UI
    │   ├── Button.test.tsx
    │   └── Input.test.tsx
    └── forms/                  # Formulários
        └── LoginForm.test.tsx
```

### Boas Práticas

- Sempre execute `npm run qa` antes de fazer push
- Use `npm run format` para formatar código antes de commitar
- Rode `npm run type-check` para verificar erros de TypeScript
- Mantenha cobertura de testes > 80% para código crítico
- Escreva testes para novos recursos e correções de bugs

Para mais detalhes sobre testes e QA, consulte [docs/QA.md](./docs/QA.md).

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/minha-feature`
4. Abra um Pull Request

### Formato de Commits (Conventional Commits)

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 🎯 Funcionalidades Implementadas

### ✅ Gestão de Usuários (Task 11)

Sistema completo de gerenciamento de usuários com:

- **CRUD Completo**: Criar, listar, editar e deletar usuários
- **Roles & Permissões**: Sistema com roles ADMIN e MEDICO
- **Autenticação**: Middleware de proteção de rotas por role
- **Validações**: Client-side (Zod) e server-side (Supabase RLS)
- **Funcionalidades Avançadas**:
  - Reset de senha instantâneo (sem envio de email)
  - Senha padrão `Lavinsky@1234` para novos usuários
  - Troca obrigatória de senha no primeiro login
  - Bloquear/desbloquear usuários
  - Ativar/desativar contas
  - Histórico de ações (audit log)
  - Rate limiting para proteção de API
- **UI/UX**: Filtros, busca, modais, toast notifications
- **Testes**: 128 testes passando (100% de cobertura em funcionalidades críticas)

**Rotas:**

- `/dashboard/users` - Gestão de usuários (admin)
- `/auth/reset-password` - Recuperação de senha
- `/change-password` - Troca obrigatória de senha

Para mais detalhes, consulte:

- [Task 11 Documentation](./docs/tasks/TASK-11-20251015.md)
- [Sistema de Senha Padrão](./docs/DEFAULT_PASSWORD_SETUP.md)

## 🔐 Segurança

### Sistema de Senhas

O sistema implementa um fluxo seguro de gerenciamento de senhas:

- **Criação de Usuários**: Novos usuários recebem senha padrão `Lavinsky@1234`
- **Primeiro Login**: Usuário é obrigado a trocar a senha antes de acessar o sistema
- **Recuperação de Senha**: Reset instantâneo para senha padrão sem envio de email
- **Validação de Senha Forte**:
  - Mínimo 8 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 letra minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial

### Proteções Implementadas

- **Row Level Security (RLS)** no Supabase
- **Middleware de Autenticação** com verificação de roles
- **Service Role Key** isolada no servidor (nunca exposta no client)
- **Audit Logging** para rastreamento de ações
- **Rate Limiting** nas APIs críticas
- **HTTPS obrigatório** em produção
- **Conformidade LGPD/HIPAA**

Para configuração detalhada, consulte [DEFAULT_PASSWORD_SETUP.md](./docs/DEFAULT_PASSWORD_SETUP.md)

## 📄 Documentação

Para mais detalhes sobre o projeto, consulte:

- [PRD - Product Requirements Document](./docs/prd-lavinsky-bloco-cirugico.md)
- [Sistema de Senha Padrão e Recuperação](./docs/DEFAULT_PASSWORD_SETUP.md)
- [Configuração de Email no Supabase](./docs/SUPABASE_EMAIL_SETUP.md)
- [CLAUDE.md](./CLAUDE.md) - Instruções para Claude Code
- [Tasks Implementadas](./docs/tasks/) - Documentação detalhada das tasks

## 📝 Licença

Este projeto é proprietário da Clínica Lavinsky.
