# Claude Code Instructions

## 👨‍💻 Developer Profile

**Experience Level:** Junior to Mid-level Full Stack Developer
**System:** Windows 11 Pro + WSL Ubuntu 24.04 LTS + ZSH
**IDE:** VSCode / Cursor with Claude Code integration
**Language Preference:** Portuguese with technical terms in English

### Tech Stack

- **Frontend:** React, Next.js 14+, TypeScript
- **Backend:** Node.js, REST & GraphQL APIs
- **Database:** Supabase (PostgreSQL)
- **UI:** ShadCN UI, Tailwind CSS
- **Tools:** Git/GitHub, npm/pnpm
- **Deploy:** Vercel, Render, Docker

## 🎯 Communication Style

### How to Help Me

- **Break complexity:** Divide complex tasks into small, manageable steps
- **Explain concepts:** Use simple analogies and practical examples
- **Show the WHY:** Always explain the reasoning behind solutions, not just HOW
- **Provide alternatives:** Show different approaches when available
- **Structure responses:** Explicação → Exemplo → Boas práticas
- **Ask for confirmation:** Confirm understanding before proceeding to next step
- **Show folder structure:** Display project organization when creating features

### Response Format

```
## 🎯 Resposta Direta
[Quick answer to the question]

## 📋 Explicação
[Detailed explanation in Portuguese with simple terms]

## 💻 Exemplo Prático
[Real code example with comments]

## ✅ Boas Práticas
[Why this approach, alternatives, best practices]

## 🚀 Próximos Passos
[What to do next, if applicable]
```

---

## 📐 Code Standards (Always Apply)

### Architecture Principles

- **SOLID principles:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY:** Don't Repeat Yourself - extract common logic
- **KISS:** Keep It Simple, Stupid - avoid over-engineering
- **YAGNI:** You Aren't Gonna Need It - don't add unused features
- **Composition over Inheritance:** Prefer composition patterns
- **Clean Architecture:** Separate concerns (UI, Business Logic, Data)

### TypeScript Standards

- Always use **TypeScript strict mode**
- Never use `any` - use `unknown` or proper types
- Define interfaces for objects and props
- Use type guards for runtime validation
- Prefer `type` for unions, `interface` for objects
- Use Zod for runtime type validation

### Naming Conventions

- **Variables/functions:** `camelCase`
- **Classes/Components:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Files:** `kebab-case.tsx` or `PascalCase.tsx` for components
- **Folders:** `kebab-case`
- **Private methods:** `_prefixWithUnderscore`

### Code Quality

- Write self-documenting code with meaningful names
- Add JSDoc comments for complex functions
- Keep functions small and focused (max 20-30 lines)
- One component per file
- Extract magic numbers to named constants
- Remove dead/commented code before committing

---

## 📁 Project Organization

### Feature-Based Structure

```
/src
  /app or /pages          → Next.js routes
  /components
    /ui                   → ShadCN components
    /features             → Feature-specific components
    /layouts              → Layout components
  /hooks                  → Custom React hooks
  /lib                    → Utilities, helpers
  /services               → API calls, external services
  /types                  → TypeScript types/interfaces
  /utils                  → Pure utility functions
  /config                 → Configuration files
```

### Component Organization

```
/components/features/auth
  /login
    login-form.tsx        → Main component
    login-schema.ts       → Validation schema
    login.types.ts        → TypeScript types
    index.ts              → Barrel export
```

### Best Practices

- Use **barrel exports** (`index.ts`) for cleaner imports
- Keep components small (Single Responsibility Principle)
- Separate business logic from UI components
- Create reusable UI components in `/components/ui`
- Follow Next.js App Router conventions
- Use `"use client"` directive only when necessary

---

## 🔒 Security Standards

### Input Validation

- Always validate and sanitize user inputs
- Use Zod schemas for form validation
- Implement server-side validation (never trust client)
- Sanitize data before displaying (prevent XSS)

### Authentication & Authorization

- Use Supabase Auth for authentication
- Implement proper session management
- Validate user permissions on server-side
- Use secure cookies with httpOnly and secure flags

### Database Security

- Enable **RLS (Row Level Security)** in Supabase
- Use parameterized queries (never string concatenation)
- Implement proper indexing for performance
- Never expose sensitive data in API responses

### Environment & Secrets

- Store sensitive data in `.env.local` (never commit)
- Use different keys for dev/staging/production
- Never expose API keys in client-side code
- Use Vercel Environment Variables for production

### API Security

- Implement rate limiting for APIs
- Use HTTPS in production (always)
- Validate request origins (CORS)
- Implement CSRF protection
- Add proper error handling (don't expose stack traces)

---

## ⚡ Performance Guidelines

### Next.js Optimization

- Use `next/image` component for all images
- Implement dynamic imports for code splitting
- Use `next/font` for font optimization
- Enable static generation when possible
- Use Incremental Static Regeneration (ISR)

### React Optimization

- Use `React.memo` for expensive components
- Implement `useMemo` and `useCallback` appropriately
- Use Suspense boundaries for data fetching
- Lazy load components with `React.lazy`
- Avoid unnecessary re-renders

### Database & API

- Optimize queries with proper indexing
- Implement caching strategies (React Query, SWR)
- Use pagination for large datasets
- Minimize API calls with proper state management
- Use Supabase realtime only when needed

### UI Performance

- Use Tailwind's purge/tree-shaking
- Minimize bundle size (analyze with `next/bundle-analyzer`)
- Implement loading states and skeleton screens
- Use CSS containment for isolated components
- Optimize images (WebP, proper sizing)

---

## 🧪 Testing & Quality Assurance

### Testing Strategy

- **Unit tests:** Pure functions and utilities
- **Component tests:** React Testing Library
- **Integration tests:** API routes and database
- **E2E tests:** Critical user flows (when needed)

### Code Quality Tools

- **TypeScript:** Strict mode enabled
- **ESLint:** Follow project rules
- **Prettier:** Consistent formatting
- **Husky:** Pre-commit hooks
- **lint-staged:** Lint only changed files

### Error Handling

- Implement error boundaries for graceful failures
- Add proper loading and error states
- Provide meaningful error messages to users
- Log errors for debugging (use proper logger)
- Never show technical errors to end users

### Validation & Types

- Use Zod for runtime type validation
- Validate forms with proper error messages
- Use TypeScript for compile-time safety
- Document complex types with comments

### Quality Checklist

```bash
npm run lint          # Check linting
npm run type-check    # TypeScript validation
npm run test          # Run tests
npm run build         # Verify build works
npm run qa            # Run all quality checks
```

---

## 🎨 UI/UX Standards

### Design System

- Use **ShadCN UI** components consistently
- Follow mobile-first responsive design
- Use semantic HTML elements
- Consistent spacing: Tailwind scale (4, 8, 16, 24, 32...)
- Maintain consistent color palette and typography

### Accessibility (a11y)

- Add proper ARIA labels
- Implement keyboard navigation
- Ensure proper contrast ratios (WCAG AA)
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Test with screen readers

### User Feedback

- Show loading spinners for async operations
- Display success/error toast messages
- Provide visual feedback for user actions
- Implement proper form validation messages
- Use optimistic UI updates when appropriate

### Responsive Design

- Test on mobile, tablet, and desktop
- Use Tailwind breakpoints (sm, md, lg, xl, 2xl)
- Ensure touch targets are 44x44px minimum
- Test on real devices when possible

---

## 🚀 Universal Development Workflow

### ⛔ Fundamental Rules

1. **Every completed task MUST have documentation**

   - No documentation = Incomplete task
   - Only for **main tasks** (e.g., Task 11, 12, 13)
   - Subtasks (11.1, 11.2) do NOT need individual docs

2. **Always validate before finishing**

   - Run `npm run qa` before marking task as done
   - All tests must pass
   - No lint errors allowed

3. **Clean commits only**
   - Never use `git add .`
   - No AI signatures (🤖, automated, etc.)
   - Follow conventional commits

---

## 📋 Standard Development Flow

### 1️⃣ Before Starting

**Validate Environment:**

```bash
git status                    # Check repository state
npm run test                  # Ensure tests pass
npm run lint                  # Check for linting errors
```

**Understand the Task:**

- Read requirements carefully
- Identify affected files
- Plan implementation approach
- List potential challenges

### 2️⃣ Create Implementation Plan

**Use TODO checklist:**

```markdown
TODO - [Feature/Task Name]

- [ ] Understand requirements and scope
- [ ] Plan folder structure and files
- [ ] Implement core functionality
- [ ] Add TypeScript types
- [ ] Write/update tests
- [ ] Add error handling
- [ ] Validate code quality (lint, test)
- [ ] Create documentation (MANDATORY for main tasks)
- [ ] Make organized commits
- [ ] Mark task as done
```

### 3️⃣ Implement Incrementally

**Work in small steps:**

- Implement one feature at a time
- Test frequently during development
- Commit often with clear messages
- Keep commits focused and atomic

**Validation during development:**

```bash
npm run dev                   # Test in browser
npm test -- [specific-test]   # Run relevant tests
npm run lint                  # Check for errors
```

### 4️⃣ Commit Best Practices

**Always add specific files:**

```bash
# ✅ GOOD
git add src/components/auth/login-form.tsx
git add src/lib/validations/auth-schema.ts
git commit -m "feat: add login form validation"

# ❌ BAD
git add .
git commit -m "update code 🤖"
```

**Conventional Commit Types:**

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code refactoring
- `test:` add/update tests
- `docs:` documentation
- `style:` formatting, no code change
- `chore:` maintenance tasks
- `perf:` performance improvements

**Examples:**

```bash
feat: add user authentication flow
fix: resolve type error in payment component
refactor: simplify database query logic
test: add unit tests for validation utils
docs: update API documentation
style: format code with prettier
chore: update dependencies
perf: optimize image loading with next/image
```

### 5️⃣ Documentation (MANDATORY for Main Tasks)

**⚠️ IMPORTANT:**

- Documentation is ONLY created when a **MAIN task** reaches 100%
- **DO NOT** create documentation for subtasks
- Template location: `/docs/tasks/TASK-[ID]-[DATE].md`

**Documentation Template:**

````markdown
# Task [ID]: [Task Name]

**Date:** [YYYY-MM-DD]
**Status:** ✅ Completed

## 📋 What Was Implemented

- [Main functionality added]
- [Changes made to existing code]
- [Problems solved]
- [All subtasks completed]

## 📁 Files Changed

### Created

- `src/components/feature/new-component.tsx`
- `src/lib/utils/new-utility.ts`

### Modified

- `src/app/page.tsx` - Added new feature integration
- `src/types/index.ts` - Added new type definitions

### Deleted

- `src/old/deprecated-file.tsx` - Removed legacy code

## 🔧 Technical Decisions

### Why This Approach

- [Explain the chosen solution]
- [Benefits of this approach]

### Alternatives Considered

- [Other options evaluated]
- [Why they were not chosen]

## 🧪 Tests Performed

### Unit Tests

- [Which tests were added/updated]
- [Coverage percentage if available]

### Manual Tests

- [Browser testing performed]
- [Edge cases verified]

### Quality Checks

```bash
npm run lint     # ✅ Passed
npm run test     # ✅ All tests passed
npm run build    # ✅ Build successful
npm run qa       # ✅ All quality checks passed
```
````

## 🚀 Next Steps

- [Future improvements]
- [Related tasks to be done]
- [Known limitations or technical debt]

## 📸 Screenshots (if applicable)

[Add screenshots for UI changes]

````

### 6️⃣ Final Validation

**Before marking task as done:**
```bash
# 1. Run all quality checks
npm run lint                  # Fix any linting errors
npm run type-check           # Fix TypeScript errors
npm run test                 # All tests must pass
npm run build                # Ensure build works
npm run qa                   # Run full QA suite

# 2. Review changes
git status                   # Check modified files
git diff                     # Review changes

# 3. Verify documentation exists (for main tasks)
ls docs/tasks/TASK-*.md      # Confirm doc file created

# 4. Clean up
# Remove console.logs, commented code, unused imports
````

**Only mark task as DONE when:**

- ✅ All tests passing
- ✅ No lint errors
- ✅ Build successful
- ✅ Documentation created (main tasks only)
- ✅ Code reviewed
- ✅ Commits are clean and organized

---

## 🛡️ Universal Rules

### ✅ Always Do

- Validate code before and after changes
- Write meaningful commit messages
- Use explicit TypeScript types (never `any`)
- Follow project conventions and standards
- Add proper error handling
- Document complex logic
- Test critical functionality
- Review code before committing

### ❌ Never Do

- Use `git add .` (always specify files)
- Add AI signatures in commits
- Mark main task done without documentation
- Create docs for individual subtasks
- Skip tests without justification
- Commit dead or commented-out code
- Ignore lint, build, or test errors
- Expose sensitive data in code
- Use `any` type in TypeScript
- Copy-paste code without understanding

---

## 🚨 Troubleshooting Guide

### Linting Issues

```bash
npm run lint                  # Check issues
npm run lint:fix             # Auto-fix when possible
npx prettier --write .       # Format all files
```

### TypeScript Errors

- Add proper types instead of `any`
- Check imports and exports
- Verify `tsconfig.json` settings
- Use type guards for narrowing

### Test Failures

```bash
npm test -- [test-name]      # Run specific test
npm test -- --watch          # Run in watch mode
npm test -- --coverage       # Check coverage
```

### Build Errors

```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build

# Check for:
# - Missing environment variables
# - TypeScript errors
# - Import issues
```

### Git Issues

```bash
git status                   # Check current state
git log --oneline -5        # View recent commits
git diff                    # See changes
git reset HEAD~1            # Undo last commit (keep changes)
```

---

## 🎯 Project-Specific Commands

### Development

```bash
npm run dev                  # Start dev server
npm run dev:turbo           # Dev with turbo (if available)
```

### Quality Assurance

```bash
npm run lint                 # Check linting
npm run lint:fix            # Fix linting issues
npm run type-check          # TypeScript validation
npm run test                # Run all tests
npm run test:watch          # Run tests in watch mode
npm run qa                  # Run all QA checks
```

### Build & Deploy

```bash
npm run build               # Production build
npm run start               # Start production server
npm run preview             # Preview production build
```

### Database (Supabase)

```bash
npx supabase login          # Login to Supabase
npx supabase init           # Initialize Supabase
npx supabase link           # Link to project
npx supabase db push        # Push migrations
npx supabase db pull        # Pull schema
npx supabase gen types      # Generate TypeScript types
```

---

## 💡 Best Practices Summary

### Code Quality

1. Follow SOLID principles
2. Write clean, self-documenting code
3. Use TypeScript strictly
4. Keep functions small and focused
5. Extract reusable logic

### Development Process

1. Understand before coding
2. Plan your approach
3. Implement incrementally
4. Test frequently
5. Commit often with clear messages
6. Document when task is 100% done

### Quality Assurance

1. Run tests before finishing
2. Fix all lint errors
3. Ensure build works
4. Review code before committing
5. Validate with `npm run qa`

---

## 📊 Workflow Summary

```
📖 Understand Requirements
   ↓
✅ Validate Environment (git status, npm test)
   ↓
📝 Create TODO List
   ↓
💻 Implement + Test Incrementally
   ↓
🔄 Commit Frequently (clean messages)
   ↓
🧪 Final Validation (npm run qa)
   ↓
📄 Create Documentation (main tasks only)
   ↓
✅ Mark Task as DONE
```

---

## 🎓 Remember

- **Quality over speed:** Better to do it right than fast
- **Document as you go:** Don't leave docs for the end
- **Test early and often:** Catch bugs before they spread
- **Ask when in doubt:** Better to clarify than assume
- **Learn from code reviews:** Each review is a learning opportunity
- **Keep it simple:** The simplest solution is often the best

---

**Version:** 2.0
**Last Updated:** 2025-11-13
**Maintained by:** Joelson (Full Stack Developer)
