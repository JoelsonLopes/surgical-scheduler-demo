# Claude Code Instructions

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## Universal Development Workflow v2.0

### ⛔ Fundamental Rule

Every completed task MUST have documentation.
No documentation = Incomplete task = Cannot mark as done!

### ⚡ Standard Flow

#### 1️⃣ Get Task

If using Task Master AI:

```bash
task-master next
task-master show <task-id>
```

Or review project issues/tasks.

#### 2️⃣ Validate Environment

Run project checks:

```bash
npm run qa       # Node/React projects
npm run test     # or equivalent
git status
```

#### 3️⃣ Create TODO List

Use TodoWrite or manual checklist:

```
TODO - [Feature/Task]
- [ ] Understand requirements
- [ ] Implement solution
- [ ] Add tests
- [ ] Validate code
- [ ] Create documentation (MANDATORY!)
- [ ] Make organized commit
- [ ] Mark task as done
```

#### 4️⃣ Implement

Work incrementally, small frequent commits:

```bash
git add specific_file.tsx
git commit -m "type: clear description"
```

Validate after relevant changes:

```bash
npm test
npm run qa
```

#### 5️⃣ Document (MANDATORY - Only for Main Tasks)

**IMPORTANT:** Documentation is ONLY created when a MAIN task (e.g., 11, 12, 13) reaches 100% completion.
**DO NOT** create documentation for individual subtasks (e.g., 11.1, 11.2, 11.3).

Create file: `/docs/tasks/TASK-[ID]-[DATE].md`

Template:

```markdown
# Task [ID]: [Task Name]

## What was implemented

- [Main functionality]
- [Changes made]
- [Problems solved]
- [All subtasks completed]

## Files

- Created: [list]
- Modified: [list]

## Technical decisions

- Why this approach
- Alternatives considered

## Tests performed

- [Which tests ran]
- [Results]

## Next steps

- [Future work]
- [Dependencies/blocks]
```

❌ Without documentation → Main task is NOT complete.
✅ Subtasks do NOT require individual documentation files.

#### 6️⃣ Finalize

Validate build/tests:

```bash
npm run test
npm run build
npm run qa
```

Confirm documentation exists. If missing → create now.
Only then mark task as done and pull next.

### 🛡️ Universal Rules

#### ✅ Always Do

- Validate code before/after changes
- Document every completed **main task** (not subtasks)
- Incremental commits
- Explicit TypeScript types (never any)
- Run tests before finishing
- Follow project conventions

#### ❌ Never Do

- `git add .` → always add specific files
- AI signatures in commits (🤖, automated, etc.)
- Mark **main task** done without documentation
- Create documentation for individual subtasks
- Skip tests without justification
- Commit dead/commented-out code
- Ignore lint/build/test errors
- Commit without code review

### 📁 Common Structures

#### React/Next.js

```
/src
  /app or /pages   → Routes
  /components      → Components
  /hooks           → Custom hooks
  /lib or /utils   → Utilities
  /types           → TypeScript
```

#### Node.js Backend

```
/src
  /controllers     → Control logic
  /services        → Business logic
  /models          → Data models
  /routes          → API routes
```

#### Naming

- Variables/functions → camelCase
- Classes/components → PascalCase
- Constants → UPPER_CASE
- Files → kebab-case or camelCase

### 🔧 Common Commands

#### NPM/Node.js

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run lint:fix
```

#### Git

```bash
git add src/file.tsx
git commit -m "type: clear message"
```

Commit types:

- feat: new feature
- fix: bug fix
- refactor: refactor
- test: add tests
- docs: documentation
- style: formatting
- chore: maintenance

Correct examples:

- `feat: add form validation`
- `fix: correct type error in component`
- `refactor: simplify auth logic`

Incorrect examples:

- `update code 🤖 AI Generated`
- `changes [automated]`
- `fix bug (Claude helped)`

### 🎯 Universal Checklist

#### Before Starting

- [ ] Environment validated (tests passing)
- [ ] Clear task understanding
- [ ] Defined implementation plan

#### During Development

- [ ] Frequent, organized commits
- [ ] Tests passing
- [ ] Clean code, no warnings

#### Before Finishing

- [ ] All tests passing
- [ ] Build working
- [ ] Documentation created
- [ ] Code reviewed
- [ ] Task marked 100% done

### 🚨 Troubleshooting

#### Lint/Formatting:

```bash
npm run lint:fix
prettier --write .
```

#### TypeScript:

- Add proper types
- Fix imports
- Check tsconfig.json

#### Failing tests:

- Debug specific test
- Fix implementation or test
- Run isolated test

#### Broken build:

```bash
rm -rf node_modules && npm install
```

Verify dependencies/ENV vars

### 💡 Adapt Per Project

Adjust project-specific commands, folder structure, testing tools, and standards.

### 📊 Flow Summary

- Understand → Requirements
- Validate → Environment
- Plan → Clear TODOs
- Do → Implement + Test
- Commit → Clean messages
- Document → Required for completion
- Finish → Task 100% = documented

### 🚫 Golden Rules

1. No documentation = **Main task** incomplete
2. Subtasks = No individual documentation required
3. Documentation created ONLY when main task reaches 100%

### ⚠️ VERY IMPORTANT: Task Completion Rule

When a task reaches 100% completion, you MUST run `npm run qa` to validate all tests pass. If any errors occur, they MUST be fixed before marking the task as done. A task is ONLY complete when `npm run qa` runs successfully without errors.
