# Guia de Quality Assurance (QA)

Este documento descreve a infraestrutura de QA do projeto, como escrever testes, executar verificações de qualidade e seguir as melhores práticas.

## 📋 Índice

- [Infraestrutura de Testes](#infraestrutura-de-testes)
- [Executando Testes](#executando-testes)
- [Escrevendo Testes](#escrevendo-testes)
- [Pipeline de QA](#pipeline-de-qa)
- [Git Hooks](#git-hooks)
- [Formatação e Linting](#formatação-e-linting)
- [Type Checking](#type-checking)
- [Boas Práticas](#boas-práticas)
- [Troubleshooting](#troubleshooting)

---

## 🧪 Infraestrutura de Testes

### Stack de Ferramentas

| Ferramenta                      | Versão | Propósito                                  |
| ------------------------------- | ------ | ------------------------------------------ |
| **Vitest**                      | 2.1.8  | Framework de testes (Jest-compatible)      |
| **@vitest/ui**                  | 2.1.8  | Interface visual para testes               |
| **@testing-library/react**      | 16.1.0 | Testes de componentes React                |
| **@testing-library/user-event** | 14.5.2 | Simulação de interações do usuário         |
| **@testing-library/jest-dom**   | 6.6.3  | Matchers customizados para DOM             |
| **jsdom**                       | 25.0.1 | Implementação do DOM para ambiente Node.js |
| **Prettier**                    | 3.4.2  | Formatação automática de código            |
| **prettier-plugin-tailwindcss** | 0.6.9  | Ordenação de classes Tailwind              |
| **ESLint**                      | 9.x    | Análise estática e detecção de problemas   |
| **TypeScript**                  | 5.x    | Type checking com regras strict            |
| **Husky**                       | 9.1.7  | Git hooks para automação                   |
| **lint-staged**                 | 15.3.0 | Linting otimizado em arquivos git staged   |

### Estrutura de Diretórios

```
test/
├── setup.ts                      # Configuração global de testes
├── unit/                        # Testes unitários (funções isoladas)
│   ├── utils.test.ts           # Funções utilitárias (cn, etc)
│   ├── validations.test.ts     # Validações de formulários
│   └── supabase-helpers.test.ts # Helpers do Supabase (com mocks)
├── integration/                 # Testes de integração (APIs, fluxos)
│   ├── auth.test.ts            # Fluxos de autenticação completos
│   ├── surgeries-crud.test.ts  # CRUD de cirurgias
│   └── patients-crud.test.ts   # CRUD de pacientes
└── components/                  # Testes de componentes React
    ├── ui/                     # Componentes UI básicos
    │   ├── Button.test.tsx     # Botões, variantes, estados
    │   └── Input.test.tsx      # Inputs, validação, tipos
    └── forms/                  # Componentes de formulário
        └── LoginForm.test.tsx  # Formulário de login completo
```

### Configuração do Vitest

**Arquivo:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom', // Simula ambiente de browser
    globals: true, // Habilita APIs globais (describe, it, expect)
    setupFiles: ['./test/setup.ts'], // Setup executado antes de cada teste
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/postcss.config.*',
    ],
    coverage: {
      provider: 'v8', // Provedor de cobertura nativo
      reporter: ['text', 'json', 'html'], // Formatos de relatório
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.d.ts',
        '**/types/',
        '.next/',
        'out/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'), // Resolve imports com @/
    },
  },
})
```

**Pontos importantes:**

- `environment: 'jsdom'` - Necessário para testes de componentes React
- `globals: true` - Não precisa importar `describe`, `it`, `expect`
- `setupFiles` - Configuração global executada antes de cada teste
- `alias` - Resolve imports `@/` corretamente

---

## ▶️ Executando Testes

### Comandos Disponíveis

```bash
# Modo watch - reexecuta testes automaticamente ao modificar arquivos
npm test
npm run test:watch  # Alias

# Executar todos os testes uma vez (útil em CI/CD)
npm run test:run

# Interface visual interativa do Vitest
npm run test:ui
# Abre em http://localhost:51204/__vitest__/

# Executar com relatório de cobertura
npm run test:coverage
# Gera relatórios em coverage/ (text, json, html)

# Executar testes específicos
npm test -- utils.test.ts                    # Arquivo específico
npm test -- --grep "should validate email"   # Padrão de nome
npm test -- test/unit/                       # Diretório específico
```

### Interface Visual (Vitest UI)

O Vitest UI oferece uma interface web poderosa para debug:

```bash
npm run test:ui
```

**Recursos:**

- Visualização em tempo real dos testes
- Filtros por arquivo, nome, status (passed/failed)
- Detalhes de cada teste (tempo, erro, stack trace)
- Reexecutar testes individualmente
- Visualizar cobertura de código

### Relatório de Cobertura

```bash
npm run test:coverage
```

Gera três formatos:

1. **Terminal (text)** - Resumo rápido no console
2. **JSON** - `coverage/coverage-final.json` - Para CI/CD
3. **HTML** - `coverage/index.html` - Navegue visualmente pelo código

Abra o relatório HTML:

```bash
open coverage/index.html   # macOS
xdg-open coverage/index.html   # Linux
start coverage/index.html  # Windows
```

---

## ✍️ Escrevendo Testes

### 1. Testes Unitários

Testam funções isoladas, sem dependências externas.

**Exemplo: Testando função utilitária**

```typescript
// test/unit/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-4', 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toBe('base active')
  })

  it('should remove duplicate classes', () => {
    const result = cn('px-4', 'px-2')
    expect(result).toBe('px-2') // Tailwind merge resolve conflitos
  })
})
```

**Exemplo: Testando validações**

```typescript
// test/unit/validations.test.ts
import { describe, it, expect } from 'vitest'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('test.user@domain.co.uk')).toBe(true)
  })

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('no@domain')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(validateEmail('')).toBe(false)
  })
})
```

**Exemplo: Mockando Supabase**

```typescript
// test/unit/supabase-helpers.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do createClient
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}))

describe('Supabase Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks() // Limpa mocks entre testes
  })

  it('should fetch data from Supabase', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const result = await supabase.from('surgeries').select('*').eq('id', 1)

    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })
})
```

### 2. Testes de Componentes

Testam componentes React com React Testing Library.

**Exemplo: Testando componente Button**

```typescript
// test/components/ui/Button.test.tsx
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByText('Click me'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('should not trigger click when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    )
    await user.click(screen.getByText('Disabled'))

    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

**Exemplo: Testando formulário**

```typescript
// test/components/forms/LoginForm.test.tsx
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'

// Mock do Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock do Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  })),
}))

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /entrar/i }),
    ).toBeInTheDocument()
  })

  it('should update email input value', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('E-mail')
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should have required fields', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('E-mail')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
  })
})
```

### 3. Testes de Integração

Testam fluxos completos com múltiplos componentes/APIs.

**Estrutura básica:**

```typescript
// test/integration/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Setup para cada teste (limpar estado, mocks, etc)
  })

  it('should complete login flow successfully', async () => {
    // 1. Renderizar página de login
    // 2. Preencher formulário
    // 3. Submeter
    // 4. Verificar redirecionamento
    // 5. Verificar estado da sessão
  })

  it('should handle login errors', async () => {
    // Testar cenários de erro
  })
})
```

### Matchers Úteis (jest-dom)

```typescript
// Presença no DOM
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibilidade
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Estado
expect(button).toBeDisabled()
expect(input).toBeRequired()
expect(checkbox).toBeChecked()

// Valores
expect(input).toHaveValue('text')
expect(select).toHaveValue('option1')

// Classes e estilos
expect(element).toHaveClass('active')
expect(element).toHaveStyle({ color: 'red' })

// Atributos
expect(link).toHaveAttribute('href', '/path')
expect(input).toHaveAttribute('type', 'email')

// Texto
expect(element).toHaveTextContent('Hello')
expect(element).toContainHTML('<span>Hello</span>')
```

---

## 🔄 Pipeline de QA

### Comando Principal: `npm run qa`

Executa **sequencialmente** todos os checks de qualidade:

```bash
npm run qa
```

**Etapas executadas:**

1. **Formatação** (`npm run qa:format`)
   - Verifica se código está formatado corretamente com Prettier
   - Não modifica arquivos, apenas reporta problemas
2. **Linting** (`npm run qa:lint`)
   - Executa ESLint em todos os arquivos TypeScript/JavaScript
   - Detecta problemas de código, bad patterns, imports não usados
3. **Type Checking** (`npm run qa:type-check`)
   - Roda `tsc --noEmit` para verificar tipos TypeScript
   - Detecta erros de tipos sem gerar arquivos compilados
4. **Testes** (`npm run qa:test`)
   - Executa todos os testes com Vitest
   - Falha se algum teste não passar

**Comportamento:**

- Executa em sequência usando `&&`
- Se qualquer etapa falhar, pipeline para imediatamente (fail-fast)
- Retorna código de saída 0 apenas se **todas** as etapas passarem

**Uso em CI/CD:**

```bash
npm run ci
# Executa: npm run qa && npm run build
# Garante qualidade + build bem-sucedido
```

### Comandos Individuais

```bash
# Executar etapas individualmente
npm run qa:format      # Apenas verificar formatação
npm run qa:lint        # Apenas linting
npm run qa:type-check  # Apenas type checking
npm run qa:test        # Apenas testes
```

### Timing Estimado

| Etapa      | Tempo Típico   |
| ---------- | -------------- |
| Formatação | 1-3 segundos   |
| Linting    | 3-8 segundos   |
| Type Check | 2-5 segundos   |
| Testes     | 5-15 segundos  |
| **Total**  | 10-30 segundos |

---

## 🪝 Git Hooks

### Instalação e Configuração

Husky está configurado automaticamente após `npm install`:

```bash
.husky/
├── pre-commit   # Executa antes de cada commit
└── pre-push     # Executa antes de cada push
```

### Pre-commit Hook

**Executado:** Antes de cada `git commit`

**Ação:** Roda `lint-staged` nos arquivos modificados

**Configuração** (`package.json`):

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

**Comportamento:**

- Formata arquivos com Prettier
- Corrige problemas ESLint automaticamente
- Adiciona correções ao commit automaticamente
- **Bloqueia commit** se houver erros que não podem ser corrigidos

**Exemplo de uso:**

```bash
git add src/components/Button.tsx
git commit -m "feat: add new button variant"

# Output:
# ✔ Preparing lint-staged...
# ✔ Running tasks for staged files...
# ✔ Applying modifications from tasks...
# ✔ Cleaning up temporary files...
```

### Pre-push Hook

**Executado:** Antes de cada `git push`

**Ação:** Roda pipeline QA completo (`npm run qa`)

**Comportamento:**

- Executa todas as verificações (format, lint, type-check, test)
- **Bloqueia push** se qualquer verificação falhar
- Garante que código no repositório remoto passou por todos os checks

**Exemplo de uso:**

```bash
git push origin main

# Output:
# Running pre-push hook...
# > npm run qa
# ✓ Formatação: OK
# ✓ Linting: OK
# ✓ Type Check: OK
# ✓ Testes: 49 passed
# Push permitido!
```

### Bypassando Hooks (use com cautela!)

```bash
# Bypass pre-commit
git commit --no-verify -m "WIP: work in progress"

# Bypass pre-push
git push --no-verify

# ⚠️ NÃO recomendado! Use apenas em emergências
```

### Desinstalando Hooks

```bash
npm uninstall husky
rm -rf .husky
```

---

## 🎨 Formatação e Linting

### Prettier (Formatação)

**Configuração** (`.prettierrc`):

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Regras principais:**

- Sem semicolons (`;`)
- Aspas simples (`'`) ao invés de duplas (`"`)
- Indentação de 2 espaços
- Trailing comma em ES5 (objetos, arrays)
- Máximo 80 caracteres por linha
- Arrow functions sempre com parênteses
- Line ending LF (Unix-style)
- Classes Tailwind ordenadas automaticamente

**Comandos:**

```bash
# Formatar todo o projeto
npm run format

# Verificar formatação sem modificar arquivos
npm run format:check

# Formatar arquivos específicos
npx prettier --write src/components/Button.tsx
```

**Arquivos ignorados** (`.prettierignore`):

```
node_modules
.next
out
build
dist
coverage
*.log
package-lock.json
```

### ESLint (Linting)

**Configuração** (`eslint.config.mjs` - flat config):

```javascript
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

const eslintConfig = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'prettier/prettier': 'error', // Erros de formatação = erro ESLint
      '@typescript-eslint/no-unused-vars': 'error', // Variáveis não usadas
      '@typescript-eslint/no-explicit-any': 'warn', // Evitar any
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Evitar console.log
    },
  },
]

export default eslintConfig
```

**Regras customizadas:**

- `prettier/prettier: 'error'` - Integração com Prettier
- `@typescript-eslint/no-unused-vars: 'error'` - Bloqueia variáveis não usadas
- `@typescript-eslint/no-explicit-any: 'warn'` - Avisa sobre uso de `any`
- `no-console: ['warn', { allow: ['warn', 'error'] }]` - Permite `console.warn` e `console.error`

**Comandos:**

```bash
# Rodar ESLint
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Lint em arquivos específicos
npx eslint src/components/Button.tsx
```

---

## 🔍 Type Checking

### TypeScript Strict Mode

**Configuração** (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Regras ativadas:**

- `strict: true` - Ativa todas as verificações strict
- `noUnusedLocals` - Bloqueia variáveis locais não usadas
- `noUnusedParameters` - Bloqueia parâmetros não usados
- `noFallthroughCasesInSwitch` - Bloqueia fallthrough em switch sem break
- `noImplicitReturns` - Garante que funções sempre retornam valor
- `forceConsistentCasingInFileNames` - Case-sensitive nos imports

**Comando:**

```bash
npm run type-check
# Executa: tsc --noEmit
# Verifica tipos sem gerar arquivos compilados
```

**Exemplo de erro detectado:**

```typescript
// ❌ Erro: variável não usada
const unusedVar = 'test'

// ❌ Erro: parâmetro não usado
function greet(name: string, age: number) {
  return `Hello, ${name}`
}

// ✅ Correto: prefixar com _ para indicar intencional
function greet(name: string, _age: number) {
  return `Hello, ${name}`
}
```

---

## 🌟 Boas Práticas

### Testes

1. **Nomeie testes descritivamente**

   ```typescript
   // ❌ Ruim
   it('test 1', () => {})

   // ✅ Bom
   it('should validate email format correctly', () => {})
   ```

2. **Siga o padrão AAA (Arrange, Act, Assert)**

   ```typescript
   it('should add two numbers', () => {
     // Arrange: preparar dados
     const a = 2
     const b = 3

     // Act: executar ação
     const result = add(a, b)

     // Assert: verificar resultado
     expect(result).toBe(5)
   })
   ```

3. **Um conceito por teste**

   ```typescript
   // ❌ Ruim: testa múltiplos conceitos
   it('should handle user operations', () => {
     expect(validateEmail('test@test.com')).toBe(true)
     expect(validatePassword('123')).toBe(false)
     expect(formatName('john')).toBe('John')
   })

   // ✅ Bom: testes separados
   it('should validate email format', () => {
     expect(validateEmail('test@test.com')).toBe(true)
   })

   it('should validate password length', () => {
     expect(validatePassword('123')).toBe(false)
   })
   ```

4. **Use mocks apropriadamente**

   - Mock dependências externas (APIs, Supabase, Next.js router)
   - Não mock código da aplicação (teste o comportamento real)

5. **Teste casos de borda**

   ```typescript
   describe('divide', () => {
     it('should divide numbers correctly', () => {
       expect(divide(10, 2)).toBe(5)
     })

     it('should handle division by zero', () => {
       expect(() => divide(10, 0)).toThrow('Division by zero')
     })

     it('should handle negative numbers', () => {
       expect(divide(-10, 2)).toBe(-5)
     })
   })
   ```

### Formatação e Linting

1. **Sempre rode `npm run format` antes de commitar**
2. **Configure seu editor para formatar ao salvar**

   - VS Code: instale extensão Prettier
   - Adicione ao `settings.json`:
     ```json
     {
       "editor.formatOnSave": true,
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
     ```

3. **Corrija warnings do ESLint**

   - Warnings também são importantes (não apenas errors)
   - Use `npm run lint:fix` para correções automáticas

4. **Evite `any` em TypeScript**
   ```typescript
   // ❌ Evite
   const data: any = fetchData()
   // ✅ Prefira
   const data: UserData = fetchData()
   ```

### Git Workflow

1. **Sempre rode `npm run qa` antes de push**
2. **Não faça bypass de hooks sem necessidade**
3. **Commits pequenos e frequentes**
4. **Mensagens de commit descritivas**

   ```bash
   # ❌ Ruim
   git commit -m "fix"

   # ✅ Bom
   git commit -m "fix: corrige validação de email no formulário de login"
   ```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Testes falhando com "Cannot find module '@/...'"

**Causa:** Alias `@/` não está configurado corretamente no Vitest

**Solução:**

```typescript
// vitest.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'), // Ajuste path conforme estrutura
    },
  },
})
```

#### 2. "React is not defined" em testes de componentes

**Causa:** Falta importar React em arquivos de teste com JSX

**Solução:**

```typescript
// Adicione ao topo do arquivo de teste
import React from 'react'
```

#### 3. Erro "Invalid PostCSS Plugin"

**Causa:** PostCSS plugin configurado como string ao invés de importado

**Solução:**

```javascript
// postcss.config.mjs
import tailwindcss from '@tailwindcss/postcss'

const config = {
  plugins: [tailwindcss], // Importado, não string
}

export default config
```

#### 4. ESLint não encontra configuração flat config

**Causa:** Usando versão antiga do ESLint ou configuração legacy

**Solução:**

- Garanta ESLint 9+
- Use `eslint.config.mjs` (não `.eslintrc`)

#### 5. Husky hooks não estão executando

**Causa:** Hooks não foram instalados corretamente

**Solução:**

```bash
# Reinstalar Husky
npm uninstall husky
npm install husky@9.1.7 --save-dev
npx husky init

# Recriar hooks
echo "npm run pre-commit" > .husky/pre-commit
echo "npm run pre-push" > .husky/pre-push
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

#### 6. Testes muito lentos

**Causas possíveis:**

- Muitos arquivos sendo observados
- Coverage habilitado desnecessariamente

**Soluções:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    exclude: [
      // Adicionar mais pastas para excluir
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
    ],
  },
})
```

```bash
# Desabilitar coverage em modo watch
npm test  # Sem coverage

# Usar coverage apenas quando necessário
npm run test:coverage
```

### Debug de Testes

#### 1. Usando Vitest UI

```bash
npm run test:ui
```

- Visualize stack traces completos
- Reexecute testes individualmente
- Veja tempo de execução de cada teste

#### 2. Usando `console.log` estratégico

```typescript
it('should do something', () => {
  const result = someFunction()
  console.log('Result:', result) // Debug temporário
  expect(result).toBe(expected)
})
```

#### 3. Usando `screen.debug()` (React Testing Library)

```typescript
it('should render component', () => {
  render(<MyComponent />)
  screen.debug() // Imprime HTML do componente
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

#### 4. Rodando teste individual

```bash
# Executar apenas um arquivo
npm test -- LoginForm.test.tsx

# Executar apenas testes com padrão no nome
npm test -- --grep "should validate email"
```

---

## 📊 Checklist de QA

Use este checklist antes de fazer push:

- [ ] Código formatado: `npm run format`
- [ ] Linting sem erros: `npm run lint`
- [ ] Type checking passou: `npm run type-check`
- [ ] Todos os testes passando: `npm run test:run`
- [ ] Coverage > 80% para código crítico: `npm run test:coverage`
- [ ] Commits com mensagens descritivas
- [ ] Sem `console.log` desnecessários
- [ ] Sem variáveis não usadas
- [ ] Sem tipos `any` (ou justificados)

**Comando rápido:**

```bash
npm run qa && npm run build
```

---

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Husky Documentation](https://typicode.github.io/husky/)

---

**Última atualização:** 2025-10-14
