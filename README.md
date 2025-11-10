# 🏥 SurgiScheduler Demo

> **⚠️ DEMO VERSION - Portfolio Project**
>
> This is a **complete demonstration version** of a surgical center management system originally developed for a healthcare client and successfully deployed in production. This demo version has been adapted for portfolio purposes with all client-specific information removed and replaced with fictitious data.
>
> **🎯 Purpose:** Showcase full-stack development capabilities, clean architecture, and production-ready code quality.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-128%20passing-success)]()
[![License](https://img.shields.io/badge/License-Portfolio-blue)](LICENSE)

---

## 📋 Overview

**SurgiScheduler** is a comprehensive web application for surgical center management, providing doctors with the ability to request and track surgical reservations while giving administrators complete control over the scheduling workflow.

### 🎯 Key Features

- ✅ **Role-based Access Control** - Admin and Doctor roles with granular permissions
- 📅 **Real-time Scheduling** - Interactive calendar with automatic conflict detection
- 👥 **User Management** - Complete CRUD with audit logging and password policies
- 📊 **Appointment Workflow** - Status tracking (Pending → Confirmed → Completed)
- 📄 **Document Management** - Upload and manage surgical documents
- 🔐 **Enterprise Security** - RLS policies, audit logs, rate limiting
- 📱 **Responsive Design** - Modern UI with Tailwind CSS and shadcn/ui
- 🧪 **Comprehensive Testing** - 128 tests covering critical functionality

---

## 🚀 Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework with server components
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality accessible components
- **FullCalendar** - Interactive scheduling interface

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level access control
- **Supabase Auth** - JWT-based authentication
- **Supabase Storage** - Document storage with access policies

### Quality Assurance
- **Vitest** - Fast unit and integration testing
- **Testing Library** - Component testing
- **ESLint** - Code linting with strict rules
- **Prettier** - Consistent code formatting
- **Husky** - Git hooks for quality gates
- **TypeScript Strict Mode** - Maximum type safety

### DevOps
- **Vercel** - Production deployment (original project)
- **GitHub Actions** - CI/CD pipeline ready
- **Conventional Commits** - Standardized commit messages

---

## 🎓 What This Project Demonstrates

### 🏗️ **Architecture & Design**
- Clean Architecture with separation of concerns
- SOLID principles throughout the codebase
- Domain-Driven Design (DDD) approach
- Custom hooks for business logic separation
- API route handlers with proper error handling

### 🔒 **Security Best Practices**
- Row Level Security (RLS) for data isolation
- Service Role Key protection (server-side only)
- Rate limiting on critical endpoints
- Audit logging for compliance
- LGPD/HIPAA compliance considerations
- Secure password policies with forced changes

### ✅ **Quality & Testing**
- 128 automated tests (unit, integration, component)
- Comprehensive QA pipeline (format → lint → type-check → test)
- Pre-commit and pre-push git hooks
- High test coverage on critical paths
- Vitest UI for interactive test debugging

### 📊 **Real-world Features**
- Complex state management
- File upload and storage
- Real-time conflict detection
- Multi-step forms with validation
- Responsive tables and calendars
- Toast notifications and modals
- Loading states and error handling

---

## 📸 Screenshots

> 🚧 Screenshots will be added after demo setup is complete

---

## 🔑 Demo Credentials

**Admin Account:**
```
Email: admin@demo.surgischeduler.app
Password: Demo@2024!
```

**Doctor Account:**
```
Email: doctor@demo.surgischeduler.app
Password: Demo@2024!
```

> **Note:** The demo includes 8 fictitious patients and pre-configured appointments in various states.

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+ (recommended: v22.19.0)
- npm or yarn
- Supabase account (free tier works)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/JoelsonLopes/surgical-scheduler-demo.git
cd surgical-scheduler-demo

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEFAULT_USER_PASSWORD=Demo@2024!
```

> ⚠️ **Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for admin functions like user creation and password reset. Find this in Settings → API in your Supabase dashboard.

### Database Setup

```bash
# Option 1: Using Supabase CLI (recommended)
npm install -g supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# Option 2: Manual via Dashboard
# Execute migration files in order from /supabase/migrations/
```

For detailed database setup instructions, see [Database Setup Guide](./supabase/setup-demo-database.md).

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Quality Assurance
```bash
# Testing
npm test             # Run tests in watch mode
npm run test:run     # Run all tests once
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report

# Code Quality
npm run format       # Format code with Prettier
npm run lint         # Lint code with ESLint
npm run type-check   # Check TypeScript types

# Full QA Pipeline
npm run qa           # Run complete QA pipeline
npm run ci           # QA pipeline + build (CI/CD)
```

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific features
│   ├── scheduling/       # Scheduling features
│   └── users/            # User management
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and libraries
│   ├── supabase/         # Supabase clients
│   ├── validations/      # Zod schemas
│   └── utils/            # Helper functions
├── types/                 # TypeScript definitions
├── supabase/             # Database migrations
└── test/                  # Test suites
```

---

## 🎯 Core Features

### 👥 User Management
- Complete CRUD operations
- Role-based permissions (Admin/Doctor)
- Password management with forced reset
- User activation/deactivation
- Audit logging for all actions
- Advanced filtering and search

### 📅 Scheduling System
- Interactive calendar interface
- Automatic conflict detection
- Time slot validation
- Multi-status workflow
- Document attachment support
- Real-time availability checking

### 📄 Document Management
- Secure file upload to Supabase Storage
- Access control via RLS policies
- File preview and download
- Metadata tracking

### 🔐 Security Features
- JWT authentication via Supabase Auth
- Row Level Security (RLS) on all tables
- Service Role Key isolation
- Rate limiting on critical APIs
- Comprehensive audit logging
- LGPD/HIPAA compliance considerations

---

## 🧪 Testing Strategy

### Test Coverage
- **128 tests** covering critical functionality
- **Unit tests** for utilities and validations
- **Integration tests** for API routes and database operations
- **Component tests** for UI interactions

### Test Structure
```
test/
├── unit/              # Utility and validation tests
├── integration/       # API and database tests
├── components/        # Component tests
└── hooks/             # Custom hook tests
```

### Run Tests
```bash
# Watch mode (development)
npm test

# Single run (CI/CD)
npm run test:run

# Interactive UI
npm run test:ui

# Coverage report
npm run test:coverage
```

---

## 🏗️ Development Patterns

### Code Style
- **Variables/Functions:** `camelCase`
- **Classes/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Files:** `PascalCase.tsx` for components, `camelCase.ts` for utilities

### Principles
- **SOLID** - Maintainable object-oriented design
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **Clean Code** - Readable and self-documenting

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Maintenance tasks
```

---

## 📊 Performance Metrics (Original Production)

- ⚡ API response time: < 200ms
- 📈 Uptime: 99.9%
- 🔒 Zero security incidents
- ✅ 100% compliance with requirements

---

## 👨‍💻 About the Developer

**Joelson Lopes** - Full-Stack Developer

This project showcases:
- ✅ Full-stack TypeScript development
- ✅ Modern React patterns and best practices
- ✅ Database design and optimization
- ✅ Security-first development approach
- ✅ Comprehensive testing strategies
- ✅ Clean, maintainable code architecture
- ✅ Production-ready deployment experience

**Connect:**
- 🌐 Portfolio: [joelsonlopes.dev](https://joelsonlopes.dev)
- 💼 LinkedIn: [linkedin.com/in/joelsonlopes](https://linkedin.com/in/joelsonlopes)
- 📧 Email: dev@joelsonlopes.dev
- 🐙 GitHub: [github.com/JoelsonLopes](https://github.com/JoelsonLopes)

---

## 📄 Documentation

Additional documentation available in `/docs`:
- [Quality Assurance Guide](./docs/QA.md)
- [Password System Setup](./docs/DEFAULT_PASSWORD_SETUP.md)
- [Project Structure](./docs/ESTRUTURA_PROJETO.md)
- [Implementation Details](./docs/IMPLEMENTACAO-AGENDAMENTOS.md)

---

## ⚖️ License

**Portfolio Demonstration Project**

This project is a demonstration version created for portfolio purposes.

**Permissions:**
- ✅ View and review code
- ✅ Reference in technical discussions
- ✅ Use as example for learning

**Restrictions:**
- ❌ Commercial use without permission
- ❌ Redistribution
- ❌ Production deployment without authorization

The original project was developed for a healthcare client and is currently in production use. This demo version contains no proprietary business logic or client-specific information.

For commercial inquiries or collaboration opportunities, please contact the developer.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

<div align="center">
  <p><strong>⭐ If this project helped you, consider giving it a star!</strong></p>
  <sub>Built with ❤️ by Joelson Lopes using Claude Code</sub>
</div>
