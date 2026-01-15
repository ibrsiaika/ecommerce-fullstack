# E-Commerce Fullstack Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-000?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-000?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-7-000?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-000?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-87%20passing-000?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-000?style=for-the-badge)

**A full-stack e-commerce marketplace with buyer, seller, and admin flows.**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Testing](#testing)

</div>

---

## Overview

A three-sided e-commerce marketplace built with modern TypeScript:

- **Buyers** browse products, add to cart, checkout via Stripe, and track orders
- **Sellers** register a store, list products, view orders, and track earnings
- **Admins** view platform analytics, verify sellers, and manage products/orders/users

### What's Working

| Flow | Status |
|------|--------|
| Buyer: register → login → browse → cart → checkout → Stripe → order history | ✅ |
| Email verification (token emailed) | ✅ |
| Forgot password + reset password (token emailed) | ✅ |
| Seller: register store → create products → view orders → dashboard | ✅ |
| Admin: dashboard with analytics → verify sellers → manage products/orders/users | ✅ |
| Stripe webhook with signature verification + idempotency | ✅ |
| MongoDB transactions for order creation (atomic stock decrement) | ✅ |
| Docker multi-stage builds + docker-compose | ✅ |
| 87 backend tests (auth, products, orders, seller, admin, payments, upload) | ✅ |

---

## Features

### Shopping
- Product catalog with search, category/price filters, pagination
- Product detail with reviews and ratings (1-5 stars)
- Shopping cart with localStorage persistence
- Stripe Checkout Sessions (card, Apple Pay, Google Pay)
- Order history with status tracking

### Seller
- Store registration with GST/PAN/bank details
- Seller dashboard (earnings, orders, top products)
- Product CRUD (create, list, delete with ownership check)
- Order view (read-only, filtered to seller's products)

### Admin
- Dashboard with revenue trends (SVG chart), order status distribution
- Top products and top sellers leaderboards
- Pending seller verifications with one-click verify
- Product management (edit, delete)
- Order management (status update, tracking number)
- User management (role/status edit, soft delete, self-protection)

### Auth
- JWT access tokens (15 min) + refresh tokens (7 days) in httpOnly cookies
- Argon2id password hashing
- DB-backed sessions with revocation (logout, logout-all, password change)
- Email verification on registration
- Forgot password + reset password (1-hour token expiry)
- Account lockout after 5 failed login attempts
- Device fingerprinting

### Security
- Stripe webhook signature verification (no bypass)
- Server-side price recalculation (never trust client)
- MongoDB transactions for atomic inventory
- Idempotent webhook handling (ProcessedWebhookEvent model)
- Helmet with strict CSP, HSTS preload, frameguard deny
- Rate limiting (auth, password reset, API, upload)
- Soft delete with GDPR-friendly email unique index (partial filter)

---

## Tech Stack

### Frontend
```
React 19  •  Vite 7  •  TypeScript 5.8  •  Redux Toolkit
React Router 7  •  Tailwind CSS v4  •  Axios  •  React Icons
```

### Backend
```
Node.js 22  •  Express 4  •  TypeScript 5.3  •  MongoDB 7
Mongoose 8  •  JWT  •  Argon2id  •  Stripe  •  Nodemailer
Helmet  •  express-rate-limit  •  Pino  •  Swagger
```

### DevOps
```
Docker (multi-stage)  •  Docker Compose  •  GitHub Actions CI
Nginx (frontend)  •  Distroless (backend)  •  Jest  •  mongodb-memory-server
```

---

## Quick Start

### Prerequisites
- Node.js 22+
- Docker (for containerized setup) OR MongoDB 7+ (for local dev)

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/ibrsiaika/ecommerce-fullstack.git
cd ecommerce-fullstack
cp backend/.env.example backend/.env  # fill in your secrets
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/api-docs |
| Health | http://localhost:5000/health |
| Readiness | http://localhost:5000/ready |

### Option 2: Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env  # fill in JWT secrets, Stripe keys, MongoDB URI
npm run seed:admin    # creates demo buyer user@example.com / User123!@#
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env  # set VITE_API_URL
npm run dev
```

### Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_ACCESS_SECRET=<64-char hex>      # openssl rand -hex 32
JWT_REFRESH_SECRET=<64-char hex>     # different from above
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## Architecture

```
ecommerce-fullstack/
├── frontend/              # React 19 + Vite + TS
│   ├── src/
│   │   ├── pages/         # Home, Auth (Login/Register/ForgotPassword/ResetPassword), SellerRegistration
│   │   ├── components/
│   │   │   ├── admin/     # AdminDashboard, AdminProducts, AdminOrders, AdminUsers
│   │   │   ├── seller/    # SellerDashboard, SellerProducts, SellerOrders
│   │   │   ├── Layout/    # Header, Footer, Layout
│   │   │   └── ...        # ProductList, Cart, Checkout, OrderHistory, etc.
│   │   ├── store/         # Redux Toolkit (auth, cart, products slices)
│   │   ├── services/      # api.ts (axios client with token refresh)
│   │   └── config/        # routes.ts (lazy-loaded route definitions)
│   ├── Dockerfile         # multi-stage: builder + nginx
│   └── nginx.conf         # SPA fallback, caching, security headers
│
├── backend/               # Node.js + Express + TS
│   ├── src/
│   │   ├── models/        # User, Product, Order, Store, Session, ProcessedWebhookEvent, ...
│   │   ├── controllers/   # authController, productController, orderController
│   │   ├── routes/        # auth, products, orders, seller, admin, users, upload, config, ...
│   │   ├── services/      # AuthService, productService, sellerService, adminService, emailService, ...
│   │   ├── middleware/    # auth (JWT + RBAC), errorHandler
│   │   ├── config/        # database, middleware (helmet, CORS, rate limits), routes, swagger
│   │   ├── migrations/    # backfill-product-createdBy, fix-user-email-index
│   │   └── server.ts      # entry with process error handlers
│   ├── tests/             # 87 Jest tests (auth, product, order, seller, admin, payment, upload)
│   ├── Dockerfile         # multi-stage: node:22-alpine builder + distroless runtime
│   └── .env.example
│
├── docker-compose.yml     # mongo + backend + frontend
├── .github/workflows/     # CI (note: requires workflow scope token to push)
└── README.md
```

### Key Design Decisions

1. **MongoDB transactions** for order creation (atomic stock decrement + order insert)
2. **Server-side price recalculation** — client sends only `{ productId, quantity }`, server computes totals
3. **Stripe webhook signature verification** is non-negotiable — rejects webhooks if `STRIPE_WEBHOOK_SECRET` is unset
4. **Idempotent webhook handling** via `ProcessedWebhookEvent` model (dedup on `event.id`, 30-day TTL)
5. **DB-backed sessions** with refresh token hashing — enables revocation (logout, password change)
6. **Soft delete with partial filter index** — GDPR-friendly email unique index scoped to `deletedAt: null`
7. **Multi-stage Docker builds** — distroless runtime (no shell, minimal attack surface)
8. **Liveness vs readiness split** — `/health` (process alive) vs `/ready` (DB reachable) for k8s

---

## Testing

### Backend (87 tests)
```bash
cd backend && npm test
```

| Suite | Tests | Coverage |
|-------|-------|----------|
| auth | 10 | register, login, getMe, guards |
| product | 12 | CRUD, search, filter, reviews |
| order | 11 | create (transaction), myorders, status update |
| seller | 19 | registration, store CRUD, product CRUD, ownership |
| admin | 13 | dashboard, verifications, verify-store, guards |
| payment | 12 | checkout session, verify-payment, webhook security |
| upload | 10 | single/multiple upload, file type validation, delete |

Tests use `mongodb-memory-server` (replica set) — no local MongoDB required.

### Frontend
```bash
cd frontend && npm run test   # vitest (config ready, tests TBD)
```

### CI
GitHub Actions runs on every PR:
- Backend: type-check + test
- Frontend: type-check + lint + build

---

## API Documentation

Swagger UI available at `http://localhost:5000/api-docs` when running.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (sends verification email) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request reset link |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/products` | List products (paginated, filterable) |
| POST | `/api/products` | Create product (admin/seller) |
| POST | `/api/orders` | Create order (transaction + stock decrement) |
| POST | `/api/orders/:id/create-checkout-session` | Stripe Checkout |
| POST | `/api/orders/webhook` | Stripe webhook (signature verified) |
| GET | `/api/seller/dashboard` | Seller dashboard (seller role) |
| POST | `/api/seller/products` | Seller creates product |
| GET | `/api/admin/dashboard` | Admin dashboard (admin role) |
| PUT | `/api/admin/verify-store/:storeId` | Verify seller |

---

## Deployment

### Docker Compose (full stack)
```bash
docker-compose up --build
```

### Manual
```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build  # deploy dist/ to Netlify/Vercel/Nginx
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secrets (`openssl rand -hex 32`)
- [ ] Set `STRIPE_WEBHOOK_SECRET` (required — webhooks rejected without it)
- [ ] Configure SMTP credentials for email sending
- [ ] Set `CLIENT_URL` to your frontend URL
- [ ] Run `npm run seed:admin` ONLY in dev (blocked in production)
- [ ] Configure CORS via `CORS_ORIGINS` env var

---

## Contributing

```bash
git clone https://github.com/ibrsiaika/ecommerce-fullstack.git
cd ecommerce-fullstack
git checkout -b feature/your-feature
# Make changes, add tests
npm test  # ensure all tests pass
git commit -m "feat: your feature"
git push origin feature/your-feature
```

---

## License

MIT License — see [LICENSE](./LICENSE) file.

---

## Author

**ibrsiaika** — Full Stack Developer
[GitHub](https://github.com/ibrsiaika)
