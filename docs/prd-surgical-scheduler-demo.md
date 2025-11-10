PRD – Sistema de Gestão e Agendamento do Bloco Cirúrgico SurgiScheduler Demo
🎯 Visão Geral
Objetivo
Desenvolver um sistema web que permita a gestão eficiente do bloco cirúrgico da SurgiScheduler Demo, proporcionando aos médicos a funcionalidade de solicitação e acompanhamento de reservas, enquanto entrega aos administradores o controle completo sobre o fluxo de agendamentos. O sistema será seguro, escalável, responsivo e com alta performance, atendendo normas de compliance como LGPD/HIPAA.

Principais Valores
Performance: Resposta inferior a 200ms para operações críticas.

Segurança: Proteção integral dos dados médicos sensíveis conforme LGPD e HIPAA.

Confiabilidade: Disponibilidade mínima garantida de 99.9%.

Usabilidade: Interface intuitiva e responsiva, acessível em diversos dispositivos.

Usuários-Alvo
Administradores: Gerenciam o sistema, aprovam/negam solicitações, editam horários e monitoram a agenda.

Médicos: Solicitam, acompanham e visualizam agendamentos de procedimentos no bloco cirúrgico.

🏗️ Arquitetura e Stack Tecnológica
Frontend
Next.js (React)

TypeScript

shadcn/ui

Tailwind CSS

Backend
Supabase (autenticação, banco de dados, APIs, storage)

Hospedagem
Vercel para frontend e integração contínua.

📐 Convenções e Padrões
Nomenclatura
typescript
// PADRÕES ESTABELECIDOS

/_ Código _/

- Variáveis/Funções: camelCase
- Classes/Interfaces/Tipos TS: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Enums: PascalCase (valores em UPPER_SNAKE_CASE)

/_ Arquivos _/

- Componentes: PascalCase.tsx
- Hooks: use[Nome].ts
- Utils: camelCase.ts
- Testes: [arquivo].test.ts ou .spec.ts

/_ Banco de Dados _/

- Tabelas/Colunas: snake_case
- Índices: idx*[tabela]*[coluna]
- Triggers: trg*[tabela]*[ação]
- Functions: fn\_[nome_descritivo]

/_ Git _/

- Branches: feature/[nome], fix/[nome], hotfix/[nome]
- Commits: Conventional Commits (feat:, fix:, docs:, etc.)
  Idiomas
  Código: Inglês

Comentários técnicos: Português BR

UI: Português BR

Documentação: Português BR (termos técnicos em inglês)

Mensagens de commit: Inglês

🛠️ Princípios de Desenvolvimento
SOLID (Responsabilidade Única, Aberto/Fechado, Substituição de Liskov, Segregação de Interface, Inversão de Dependência)

Clean Code (legibilidade, manutenibilidade)

DRY, KISS, YAGNI

DDD: separação clara de camadas/domínios

🔒 Requisitos Não Funcionais
Performance: API e tela de agenda respondendo em < 200ms em condições normais.

Segurança: Criptografia em trânsito (HTTPS), políticas de acesso granular, logs de auditoria e aderência à LGPD/HIPAA.

Confiabilidade: Uptime de 99.9% com monitoramento ativo, backups automáticos diários.

Escalabilidade: Arquitetura expansível para múltiplos blocos/unidades clínicas.

📋 Work in Progress (Task-Master-IA)
Cada etapa do projeto será documentada e controlada via Task-Master-IA para garantir rastreabilidade e entregas ágeis e alinhadas com o PRD.
