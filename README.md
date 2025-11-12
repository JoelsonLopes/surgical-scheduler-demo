# 🏥 SurgiScheduler Demo

> **⚠️ VERSÃO DEMO - Projeto de Portfólio**
>
> Esta é uma **versão completa de demonstração** de um sistema de gestão de centro cirúrgico originalmente desenvolvido para um cliente da área de saúde e atualmente em produção. Esta versão demo foi adaptada para fins de portfólio, com todas as informações específicas do cliente removidas e substituídas por dados fictícios.
>
> **🎯 Propósito:** Demonstrar capacidades de desenvolvimento full-stack, arquitetura limpa e qualidade de código pronto para produção.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Testes](https://img.shields.io/badge/Testes-128%20passando-success)]()
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-Portfolio-blue)](LICENSE)

---

## 📋 Visão Geral

**SurgiScheduler** é uma aplicação web completa para gestão de blocos cirúrgicos, oferecendo aos médicos a capacidade de solicitar e acompanhar reservas cirúrgicas, enquanto fornece aos administradores controle total sobre o fluxo de agendamentos.

### 🎯 Principais Funcionalidades

- ✅ **Controle de Acesso Baseado em Roles** - Papéis de Admin e Médico com permissões granulares
- 📅 **Agendamento em Tempo Real** - Calendário interativo com detecção automática de conflitos
- 👥 **Gestão de Usuários** - CRUD completo com logs de auditoria e políticas de senha
- 📊 **Fluxo de Agendamentos** - Rastreamento de status (Pendente → Confirmado → Concluído)
- 📄 **Gestão de Documentos** - Upload e gerenciamento de documentos cirúrgicos
- 🔐 **Segurança Empresarial** - Políticas RLS, logs de auditoria, rate limiting
- 📱 **Design Responsivo** - UI moderna com Tailwind CSS e shadcn/ui
- 🧪 **Testes Abrangentes** - 128 testes cobrindo funcionalidades críticas

---

## 🚀 Stack Tecnológica

### Frontend

- **Next.js 15** (App Router) - Framework React com componentes de servidor
- **React 19** - Última versão do React com recursos concorrentes
- **TypeScript 5** - Desenvolvimento type-safe
- **Tailwind CSS** - Estilização utility-first
- **shadcn/ui** - Componentes acessíveis de alta qualidade
- **FullCalendar** - Interface interativa de agendamento

### Backend & Banco de Dados

- **Supabase** - Banco PostgreSQL com subscrições em tempo real
- **Row Level Security (RLS)** - Controle de acesso em nível de banco
- **Supabase Auth** - Autenticação baseada em JWT
- **Supabase Storage** - Armazenamento de documentos com políticas de acesso

### Quality Assurance

- **Vitest** - Testes unitários e de integração rápidos
- **Testing Library** - Testes de componentes
- **ESLint** - Linting de código com regras estritas
- **Prettier** - Formatação consistente de código
- **Husky** - Git hooks para gates de qualidade
- **TypeScript Strict Mode** - Máxima segurança de tipos

### DevOps

- **Vercel** - Deploy em produção (projeto original)
- **GitHub Actions** - Pipeline CI/CD pronto
- **Conventional Commits** - Mensagens de commit padronizadas

---

## 🎓 O Que Este Projeto Demonstra

### 🏗️ **Arquitetura & Design**

- Clean Architecture com separação de responsabilidades
- Princípios SOLID ao longo da base de código
- Abordagem Domain-Driven Design (DDD)
- Custom hooks para separação de lógica de negócio
- Handlers de rotas API com tratamento adequado de erros

### 🔒 **Melhores Práticas de Segurança**

- Row Level Security (RLS) para isolamento de dados
- Proteção de Service Role Key (apenas server-side)
- Rate limiting em endpoints críticos
- Logs de auditoria para compliance
- Considerações de conformidade LGPD/HIPAA
- Políticas de senha seguras com mudanças forçadas

### ✅ **Qualidade & Testes**

- 128 testes automatizados (unit, integration, component)
- Pipeline QA abrangente (format → lint → type-check → test)
- Git hooks de pre-commit e pre-push
- Alta cobertura de testes em caminhos críticos
- Vitest UI para debug interativo de testes

### 📊 **Funcionalidades do Mundo Real**

- Gerenciamento de estado complexo
- Upload e armazenamento de arquivos
- Detecção de conflitos em tempo real
- Formulários multi-step com validação
- Tabelas e calendários responsivos
- Notificações toast e modais
- Estados de loading e tratamento de erros

---

## 📸 Screenshots

> 🚧 Screenshots serão adicionados após a conclusão do setup demo

---

## 🔑 Credenciais Demo

**Conta Admin:**

```
Email: admin@demo.surgischeduler.app
Senha: Demo@2024!
```

**Conta Médico:**

```
Email: doctor@demo.surgischeduler.app
Senha: Demo@2024!
```

> **Nota:** A demo inclui 8 pacientes fictícios e agendamentos pré-configurados em vários estados.

---

## 🛠️ Instalação Local

### Pré-requisitos

- Node.js 18+ (recomendado: v22.19.0)
- npm ou yarn
- Conta Supabase (tier gratuito funciona)

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/JoelsonLopes/surgical-scheduler-demo.git
cd surgical-scheduler-demo

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
```

### Variáveis de Ambiente

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
DEFAULT_USER_PASSWORD=Demo@2024!
```

> ⚠️ **Importante:** A `SUPABASE_SERVICE_ROLE_KEY` é necessária para funções admin como criação de usuários e reset de senha. Encontre esta chave em Settings → API no dashboard do Supabase.

### Configuração do Banco de Dados

```bash
# Opção 1: Usando Supabase CLI (recomendado)
npm install -g supabase
supabase link --project-ref SEU_PROJECT_REF
supabase db push

# Opção 2: Manual via Dashboard
# Execute os arquivos de migration em ordem da pasta /supabase/migrations/
```

Para instruções detalhadas de configuração do banco, veja o [Guia de Setup do Banco](./supabase/setup-demo-database.md).

### Executar Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📦 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção
```

### Quality Assurance

```bash
# Testes
npm test             # Executar testes em modo watch
npm run test:run     # Executar todos os testes uma vez
npm run test:ui      # Abrir Vitest UI
npm run test:coverage # Gerar relatório de cobertura

# Qualidade de Código
npm run format       # Formatar código com Prettier
npm run lint         # Lint código com ESLint
npm run type-check   # Verificar tipos TypeScript

# Pipeline QA Completo
npm run qa           # Executar pipeline QA completo
npm run ci           # Pipeline QA + build (CI/CD)
```

---

## 📁 Estrutura do Projeto

```
├── app/                    # Next.js App Router
│   ├── api/               # Handlers de rotas API
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Rotas protegidas do dashboard
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── admin/            # Features específicos de admin
│   ├── scheduling/       # Features de agendamento
│   └── users/            # Gestão de usuários
├── hooks/                 # Custom React hooks
├── lib/                   # Utilitários e bibliotecas
│   ├── supabase/         # Clientes Supabase
│   ├── validations/      # Schemas Zod
│   └── utils/            # Funções auxiliares
├── types/                 # Definições TypeScript
├── supabase/             # Migrations do banco
└── test/                  # Suítes de teste
```

---

## 🎯 Funcionalidades Principais

### 👥 Gestão de Usuários

- Operações CRUD completas
- Permissões baseadas em roles (Admin/Médico)
- Gerenciamento de senhas com reset forçado
- Ativação/desativação de usuários
- Logs de auditoria para todas as ações
- Filtros avançados e busca

### 📅 Sistema de Agendamento

- Interface de calendário interativa
- Detecção automática de conflitos
- Validação de slots de tempo
- Workflow multi-status
- Suporte a anexo de documentos
- Verificação de disponibilidade em tempo real

### 📄 Gestão de Documentos

- Upload seguro de arquivos para Supabase Storage
- Controle de acesso via políticas RLS
- Preview e download de arquivos
- Rastreamento de metadados

### 🔐 Recursos de Segurança

- Autenticação JWT via Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Isolamento de Service Role Key
- Rate limiting em APIs críticas
- Logs de auditoria abrangentes
- Considerações de conformidade LGPD/HIPAA

---

## 🧪 Estratégia de Testes

### Cobertura de Testes

- **128 testes** cobrindo funcionalidade crítica
- **Testes unitários** para utilitários e validações
- **Testes de integração** para rotas API e operações de banco
- **Testes de componentes** para interações de UI

### Estrutura de Testes

```
test/
├── unit/              # Testes de utilitários e validações
├── integration/       # Testes de API e banco de dados
├── components/        # Testes de componentes
└── hooks/             # Testes de custom hooks
```

### Executar Testes

```bash
# Modo watch (desenvolvimento)
npm test

# Execução única (CI/CD)
npm run test:run

# UI interativa
npm run test:ui

# Relatório de cobertura
npm run test:coverage
```

---

## 🏗️ Padrões de Desenvolvimento

### Estilo de Código

- **Variáveis/Funções:** `camelCase`
- **Classes/Interfaces:** `PascalCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Arquivos:** `PascalCase.tsx` para componentes, `camelCase.ts` para utilitários

### Princípios

- **SOLID** - Design orientado a objetos manutenível
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **Clean Code** - Código legível e auto-documentado

### Convenção de Commits

```
feat: Adicionar nova funcionalidade
fix: Corrigir bug
docs: Atualizar documentação
style: Formatar código
refactor: Refatorar código
test: Adicionar testes
chore: Tarefas de manutenção
```

---

## 📊 Métricas de Performance (Produção Original)

- ⚡ Tempo de resposta da API: < 200ms
- 📈 Uptime: 99.9%
- 🔒 Zero incidentes de segurança
- ✅ 100% de conformidade com requisitos

---

## 👨‍💻 Sobre o Desenvolvedor

**Joelson Lopes** - Desenvolvedor Full-Stack

Este projeto demonstra:

- ✅ Desenvolvimento TypeScript full-stack
- ✅ Padrões modernos do React e melhores práticas
- ✅ Design e otimização de banco de dados
- ✅ Abordagem de desenvolvimento security-first
- ✅ Estratégias de testes abrangentes
- ✅ Arquitetura de código limpa e manutenível
- ✅ Experiência com deploy pronto para produção

**Conecte-se:**

- 🌐 Portfolio: [joelsonlopes.dev](https://joelsonlopes.dev)
- 💼 LinkedIn: [linkedin.com/in/joelsonlopes](https://linkedin.com/in/joelsonlopes)
- 📧 Email: dev@joelsonlopes.dev
- 🐙 GitHub: [github.com/JoelsonLopes](https://github.com/JoelsonLopes)

---

## 📄 Documentação

Documentação adicional disponível em `/docs`:

- [Guia de Quality Assurance](./docs/QA.md)
- [Configuração do Sistema de Senhas](./docs/DEFAULT_PASSWORD_SETUP.md)
- [Estrutura do Projeto](./docs/ESTRUTURA_PROJETO.md)
- [Detalhes de Implementação](./docs/IMPLEMENTACAO-AGENDAMENTOS.md)

---

## ⚖️ Licença

**Projeto de Demonstração para Portfólio**

Este projeto é uma versão de demonstração criada para fins de portfólio.

**Permissões:**

- ✅ Visualizar e revisar código
- ✅ Referenciar em discussões técnicas
- ✅ Usar como exemplo para aprendizado

**Restrições:**

- ❌ Uso comercial sem permissão
- ❌ Redistribuição
- ❌ Deploy em produção sem autorização

O projeto original foi desenvolvido para um cliente da área de saúde e está atualmente em uso em produção. Esta versão demo não contém lógica de negócio proprietária ou informações específicas do cliente.

Para consultas comerciais ou oportunidades de colaboração, entre em contato com o desenvolvedor.

---

## 🙏 Agradecimentos

- Construído com [Next.js](https://nextjs.org/)
- Componentes UI de [shadcn/ui](https://ui.shadcn.com/)
- Banco de dados e auth por [Supabase](https://supabase.com/)
- Ícones por [Lucide](https://lucide.dev/)

---

<div align="center">
  <p><strong>⭐ Se este projeto te ajudou, considere dar uma estrela!</strong></p>
  <sub>Desenvolvido com ❤️ por Joelson Lopes usando Claude Code</sub>
</div>
