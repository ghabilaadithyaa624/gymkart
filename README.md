# 🏋️ GymKart — India's Fitness Marketplace (Frontend / Backend Architecture)

> **India's smart, fitness-only e-commerce platform** — genuine supplements, pro-grade equipment and workout essentials, curated so you never scroll past junk again.

---

## 🏛️ Project Architecture

The project is structured into two clean, decoupled directories:

```
gymkart/
├── backend/                  # Express.js REST API + PostgreSQL + Drizzle ORM (Port 4000)
│   ├── src/
│   │   ├── db/               # PostgreSQL schema and Drizzle client
│   │   │   ├── schema.ts     # All 8 database tables
│   │   │   └── index.ts      # Connection pool & client
│   │   ├── lib/              # Business logic (shop, auth, money, seed data)
│   │   │   ├── auth.ts       # Express JWT auth & bcrypt
│   │   │   ├── shop.ts       # Catalog, cart, orders, wishlist & review queries
│   │   │   └── seed-data.ts  # Curated products seed data
│   │   ├── routes/           # Express Routers
│   │   │   ├── auth.ts       # /api/auth (login, signup, me, logout, goal)
│   │   │   ├── products.ts   # /api/products (filter, sort, bestsellers, flash, details)
│   │   │   ├── categories.ts # /api/categories (root & sub-categories)
│   │   │   ├── cart.ts       # /api/cart (get, add, update, merge)
│   │   │   ├── wishlist.ts   # /api/wishlist (toggle, get saved items)
│   │   │   ├── orders.ts     # /api/orders (place order, history)
│   │   │   └── reviews.ts    # /api/reviews (verified purchase reviews)
│   │   └── index.ts          # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   └── .env
│
└── frontend/                 # Next.js 16 + Tailwind CSS 4 + Zustand UI (Port 3000)
    ├── src/
    │   ├── app/              # Next.js App Router (SSR & Client Pages)
    │   │   ├── page.tsx      # Homepage (hero, flash deals, bestsellers, starter kit)
    │   │   ├── layout.tsx    # Root layout (Navbar, Footer, MobileTabs, ToastHost)
    │   │   ├── globals.css   # Tailwind CSS 4 theme & design tokens
    │   │   ├── product/      # Product Detail Pages (PDP)
    │   │   ├── products/     # Product Listing Pages (PLP & category filters)
    │   │   ├── cart/         # Cart page
    │   │   ├── checkout/     # Checkout form & order placement
    │   │   ├── wishlist/     # Saved items view
    │   │   ├── account/      # User profile, goal editor & order tracking
    │   │   ├── login/        # Sign-in page
    │   │   ├── signup/       # Sign-up page
    │   │   └── search/       # Search results page
    │   ├── components/       # 14 modular React components
    │   └── lib/              # Client state, API helpers & formatters
    │       ├── api.ts        # Server-side fetch client forwarding cookies
    │       ├── shop.ts       # Client & SSR API caller helpers
    │       ├── store.ts      # Zustand global store (cart, wishlist, user, toasts)
    │       └── types.ts      # TypeScript domain models
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts        # Proxies /api/* to backend on port 4000
    └── .env.local
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** running locally

---

### 2. Backend Setup & Run

Open a terminal:

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gymkart
JWT_SECRET=your-random-secret-key
PORT=4000
FRONTEND_URL=http://localhost:3000
```

Push schema to PostgreSQL (if first time):
```bash
npm run db:push
```

Start the backend API:
```bash
npm run dev
```
> Server runs on **`http://localhost:4000`**. On startup, it automatically seeds 37 curated fitness products, reviews, and a demo account!

---

### 3. Frontend Setup & Run

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
INTERNAL_API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```
> App opens on **`http://localhost:3000`**.

---

## 🧪 Demo Login Credentials

The database comes pre-seeded with a demo user account:

| Field | Value |
|-------|-------|
| **Email** | `demo@gymkart.in` |
| **Password** | `demo1234` |
| **Name** | Rohan Kapoor |
| **Fitness Goal** | Muscle Gain |

Includes 2 pre-seeded orders to test order history, delivery tracking, and purchase-verified review submission.

---

## 🔌 API Endpoints Reference (`backend`)

### Authentication (`/api/auth`)
- `GET /api/auth/me` — Fetch current session user from JWT cookie
- `POST /api/auth/login` — Sign in with email/password
- `POST /api/auth/signup` — Create a new customer account
- `POST /api/auth/logout` — Clear session cookie
- `POST /api/auth/goal` — Update fitness goal

### Products & Catalog (`/api/products`, `/api/categories`)
- `GET /api/products` — Filter products by category, price, brand, rating, sort, search
- `GET /api/products/bestsellers` — Top-selling products
- `GET /api/products/flash` — Flash deal products with countdown
- `GET /api/products/under999` — Products priced under ₹999
- `GET /api/products/goal-picks?goal=...` — Personalized recommendations
- `GET /api/products/:id` — Single product details & related items
- `GET /api/categories` — Category tree

### Cart & Orders (`/api/cart`, `/api/orders`, `/api/wishlist`)
- `GET /api/cart` — Get active user cart
- `POST /api/cart` — Add item / merge guest cart (`?sync=1`)
- `PATCH /api/cart` — Update item quantity
- `DELETE /api/cart` — Remove item from cart
- `GET /api/wishlist` — Get saved items
- `POST /api/wishlist` — Toggle item in wishlist
- `GET /api/orders` — Get user order history
- `POST /api/orders` — Place order (atomic stock decrement)

### Reviews (`/api/reviews`)
- `GET /api/reviews?productId=...` — Product reviews
- `GET /api/reviews/can-review?productId=...` — Check verified purchase status
- `POST /api/reviews` — Submit a review (gated to verified buyers)

---

## 🛠️ Available Scripts

### In `backend/`:
```bash
npm run dev        # Run Express with tsx file watcher
npm run build      # Compile TypeScript to dist/
npm run start      # Run production build
npm run db:push    # Push Drizzle schema to database
npm run db:studio  # Open Drizzle Studio web GUI
```

### In `frontend/`:
```bash
npm run dev        # Start Next.js development server on port 3000
npm run build      # Build production Next.js bundle
npm run start      # Start production server on port 3000
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type check
```
