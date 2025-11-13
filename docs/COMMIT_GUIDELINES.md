# 📋 Diretrizes de Commit

## 🚫 Regras Invioláveis

### ❌ PROIBIDO: Assinaturas de IA

**NUNCA** inclua assinaturas de IA nos commits. Exemplos de conteúdo proibido:

- ❌ `🤖 Generated with [Claude Code]`
- ❌ `Co-Authored-By: Claude <noreply@anthropic.com>`
- ❌ `Co-Authored-By: AI Assistant`
- ❌ `Assisted by AI`
- ❌ `With the help of Claude`
- ❌ Qualquer emoji de robô (🤖)
- ❌ Qualquer referência a ferramentas de IA

## 🛡️ Camadas de Proteção

Este projeto possui **4 camadas** de proteção contra assinaturas de IA:

### 1️⃣ Pre-commit Hook
- Valida código antes do commit
- Bloqueia se detectar assinaturas de IA nos arquivos
- Executa lint automático

### 2️⃣ Commit-msg Hook
- Valida a mensagem de commit
- Bloqueia se detectar assinaturas de IA na mensagem
- Valida formato conventional commits

### 3️⃣ GitHub Actions CI
- Valida todos os commits no push/PR
- Verifica histórico de commits
- Bloqueia merge se detectar violações

### 4️⃣ Revisão Manual
- Code review obrigatório
- Verificação final antes do merge

## ✅ Formato Correto de Commit

### Conventional Commits

```
type(scope): subject

body (opcional)

footer (opcional)
```

### Tipos Permitidos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção
- `perf`: Performance
- `ci`: CI/CD
- `build`: Build system
- `revert`: Reverter commit

### Exemplos Válidos

```bash
feat: adicionar autenticação de usuários

fix: corrigir erro de validação no formulário

docs: atualizar README com instruções de setup

refactor: simplificar lógica de validação
```

## 🔧 Como Burlar (NÃO FAÇA ISSO)

As seguintes flags **BURLAM** os hooks do Git:

- ❌ `git commit --no-verify` ou `-n`
- ❌ `git commit --no-verify -m "message"`
- ❌ `HUSKY=0 git commit -m "message"`

**IMPORTANTE:** Mesmo que você consiga burlar localmente, o CI vai bloquear!

## 🚨 O Que Acontece se Violar

1. **Localmente:** Commit será bloqueado imediatamente
2. **No GitHub:** CI falhará e bloqueará o merge
3. **Code Review:** Será rejeitado pelos revisores

## 💡 Dicas

- Use mensagens claras e descritivas
- Mantenha commits atômicos (uma mudança = um commit)
- Escreva em português para melhor compreensão da equipe
- Sem emojis desnecessários
- Sem assinaturas de ferramentas ou IA

---

**Última atualização:** 2025-11-13
