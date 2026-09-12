# Contributing to GymKart

Thank you for your interest in contributing to GymKart! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

Please be respectful and constructive in your interactions. We're building a fitness community that welcomes everyone.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies** for both frontend and backend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Set up environment variables**:
   - Copy `.env.example` to `.env` in the backend directory
   - Copy `.env.example` to `.env.local` in the frontend directory
4. **Set up PostgreSQL** and run migrations:
   ```bash
   cd backend
   npm run db:push
   ```
5. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/` - New features (e.g., `feature/add-wishlist`)
- `fix/` - Bug fixes (e.g., `fix/cart-quantity-bug`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-module`)
- `test/` - Adding or updating tests (e.g., `test/add-cart-tests`)

### Before Submitting a PR

1. **Run linting and type checking**:
   ```bash
   # Backend
   cd backend
   npx tsc --noEmit
   
   # Frontend
   cd frontend
   npm run lint
   npm run typecheck
   ```

2. **Test your changes** thoroughly in the development environment

3. **Update documentation** if you've changed functionality

4. **Ensure database migrations** are included if you've modified the schema

## Pull Request Process

### 1. Create a PR

- Use the PR template provided
- Fill out all sections completely
- Link any related issues

### 2. Automated Checks

Your PR must pass all CI checks:
- ✅ Backend ESLint (warnings allowed, errors must be fixed)
- ✅ Backend TypeScript type check
- ✅ Frontend ESLint
- ✅ Frontend TypeScript type check
- ✅ Frontend build success

### 3. Code Review

- At least one approval from a team member is required
- Address all review comments before merging
- Be responsive to feedback

### 4. Merging

- Squash merge for feature branches
- Ensure the commit message is descriptive
- Delete the branch after merging

## Coding Standards

### TypeScript

- Use strict mode (`strict: true` in tsconfig.json)
- Define explicit types for function parameters and return values
- Avoid using `any`; use proper types or `unknown`
- Use interfaces for object shapes and types for unions/intersections

### Backend (Express.js)

- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Handle errors with try-catch blocks
- Validate input using Zod schemas
- Keep routes thin; move business logic to `lib/` directory

### Frontend (Next.js)

- Use Server Components by default; use Client Components only when needed
- Keep components small and focused
- Use Zustand for global state management
- Style with Tailwind CSS utility classes
- Implement proper loading and error states

### Database (Drizzle ORM)

- Always use migrations for schema changes
- Document relationships between tables
- Use transactions for operations that modify multiple records

## Commit Guidelines

### Commit Message Format

Follow the Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without behavior change
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)

### Examples

```
feat(products): add flash deals endpoint

Implemented GET /api/products/flash to return products with active flash deals.
Includes countdown timer data for frontend display.

Closes #42
```

```
fix(cart): resolve quantity update race condition

Added optimistic locking to prevent concurrent cart updates from overwriting each other.

Fixes #38
```

## Questions?

Feel free to open an issue if you have questions about contributing. We're happy to help!
