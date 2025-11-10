# TODO: Infraestrutura de QA - Next.js + TypeScript + Supabase

## Objetivo

Implementar uma infraestrutura completa de Quality Assurance para garantir código consistente, testado e de alta qualidade.

---

## 1. Configuração do Vitest

### 1.1. Instalação de Dependências

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 1.2. Criar arquivo de configuração `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/types/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 1.3. Criar arquivo `test/setup.ts`

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

### 1.4. Adicionar scripts no `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 1.5. Criar exemplos de testes

- [ ] Criar `test/unit/example.test.ts` - teste unitário básico
- [ ] Criar `test/integration/api.test.ts` - teste de integração com Supabase
- [ ] Criar `test/components/Button.test.tsx` - teste de componente React

---

## 2. Configuração do Prettier

### 2.1. Instalação de Dependências

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

### 2.2. Criar arquivo `.prettierrc`

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

### 2.3. Criar arquivo `.prettierignore`

```
node_modules
.next
out
dist
build
coverage
*.lock
*.log
.env*
public
```

### 2.4. Adicionar scripts no `package.json`

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## 3. Configuração do ESLint

### 3.1. Instalação de Dependências

```bash
npm install -D eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 3.2. Atualizar `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "project": "./tsconfig.json"
  }
}
```

### 3.3. Adicionar scripts no `package.json`

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix"
  }
}
```

---

## 4. Configuração do TypeScript

### 4.1. Atualizar `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### 4.2. Adicionar script no `package.json`

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

---

## 5. Configuração do Husky

### 5.1. Instalação de Dependências

```bash
npm install -D husky lint-staged
npx husky init
```

### 5.2. Configurar `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run pre-commit
```

### 5.3. Configurar `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run pre-push
```

### 5.4. Adicionar `lint-staged` no `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### 5.5. Adicionar scripts de hooks no `package.json`

```json
{
  "scripts": {
    "pre-commit": "lint-staged",
    "pre-push": "npm run qa"
  }
}
```

---

## 6. Script QA Principal

### 6.1. Adicionar script QA completo no `package.json`

```json
{
  "scripts": {
    "qa": "npm run qa:format && npm run qa:lint && npm run qa:type-check && npm run qa:test",
    "qa:format": "prettier --check .",
    "qa:lint": "next lint",
    "qa:type-check": "tsc --noEmit",
    "qa:test": "vitest run"
  }
}
```

### 6.2. Script CI/CD (opcional)

```json
{
  "scripts": {
    "ci": "npm run qa && npm run build"
  }
}
```

---

## 7. Documentação

### 7.1. Atualizar README.md

- [ ] Adicionar seção "Quality Assurance"
- [ ] Documentar comandos disponíveis
- [ ] Explicar fluxo de desenvolvimento com hooks

### 7.2. Criar `docs/QA.md`

- [ ] Explicar estrutura de testes
- [ ] Guia de como escrever testes
- [ ] Boas práticas de código
- [ ] Como executar QA localmente

---

## 8. Testes Iniciais

### 8.1. Testes Unitários

- [ ] Criar testes para funções utilitárias
- [ ] Criar testes para helpers do Supabase
- [ ] Criar testes para validações de formulários

### 8.2. Testes de Integração

- [ ] Criar testes para autenticação
- [ ] Criar testes para CRUD de cirurgias
- [ ] Criar testes para CRUD de pacientes

### 8.3. Testes de Componentes

- [ ] Testar componentes de UI (Button, Input, etc.)
- [ ] Testar formulários
- [ ] Testar páginas principais

---

## 9. Configuração GitHub Actions (opcional)

### 9.1. Criar `.github/workflows/qa.yml`

```yaml
name: QA

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run qa
      - run: npm run build
```

---

## 10. Checklist Final

- [ ] Todas as dependências instaladas
- [ ] Todos os arquivos de configuração criados
- [ ] Scripts adicionados ao package.json
- [ ] Husky configurado e funcionando
- [ ] Pelo menos 3 testes exemplo criados
- [ ] Documentação atualizada
- [ ] Pipeline rodando localmente sem erros
- [ ] Testar commit (deve rodar pre-commit)
- [ ] Testar push (deve rodar pre-push com QA completo)

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Iniciar servidor de desenvolvimento
npm run test               # Rodar testes em modo watch
npm run test:ui            # Abrir interface do Vitest

# QA Manual
npm run format             # Formatar código
npm run lint:fix           # Corrigir problemas de lint
npm run type-check         # Verificar tipos TypeScript
npm run test:run           # Rodar todos os testes

# QA Completo
npm run qa                 # Executar pipeline completo de QA

# CI/CD
npm run ci                 # QA + Build (para pipelines)
```

---

## Estimativa de Tempo

- Configuração Vitest: 30-45 min
- Configuração Prettier: 10-15 min
- Configuração ESLint: 15-20 min
- Configuração TypeScript: 10 min
- Configuração Husky: 20-30 min
- Script QA: 10 min
- Documentação: 30 min
- Testes Iniciais: 1-2 horas
- **Total estimado: 3-4 horas**

---

## Notas

- Configurações podem ser ajustadas conforme necessidades do projeto
- Recomenda-se começar com regras menos restritivas e ir aumentando gradualmente
- Os testes devem ser escritos conforme novas features são desenvolvidas
- O coverage ideal é acima de 80%, mas deve ser alcançado gradualmente
