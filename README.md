# E-Commerce Fullstack Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-000?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-000?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-7-000?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-000?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-150%20passing-000?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-000?style=for-the-badge)

**A full-stack e-commerce marketplace with buyer, seller, and admin flows.**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Testing](#testing)

</div>

---

## Overview

A three-sided e-commerce marketplace built with modern TypeScript:

- **Buyers** browse products, add to cart, checkout via Stripe/Razorpay/COD, track orders, request returns, download invoices
- **Sellers** register a store, list products, view orders, track earnings
- **Admins** view analytics, verify sellers, manage products/orders/users/coupons/returns

### What's Working

| Flow | Status |
|------|--------|
| Buyer: register → email verification → login → forgot/reset password → browse → cart → checkout → payment → order tracking → invoice download | ✅ |
| Seller: register store → create products → view orders → dashboard with earnings | ✅ |
| Admin: dashboard with revenue charts → verify sellers → manage products/orders/users/coupons/returns | ✅ |
| Coupon system: create, validate, apply at checkout, usage limits, atomic redemption | ✅ |
| Returns/Refunds: request → approve → Stripe refund → stock reversal (transactional) | ✅ |
| Inventory reservations: 10-min hold during checkout, TTL auto-release, concurrency-safe | ✅ |
| Order invoices: PDF generation (standard + GST with CGST/SGST/IGST split) | ✅ |
| Razorpay UPI: create order, verify signature (timing-safe), mark paid | ✅ |
| COD: pincode serviceability check, COD fee, eligibility verification | ✅ |
| Server-side cart: cross-device sync, guest→server merge on login | ✅ |
| Stripe payments with webhook signature verification + idempotency | ✅ |
| MongoDB transactions for order creation (atomic stock decrement) | ✅ |
| Docker multi-stage builds + docker-compose | ✅ |
| 150 backend tests (14 test suites) | ✅ |

---

## Features

### Shopping
- Product catalog with search, category/price filters, pagination
- Product detail with reviews and ratings (1-5 stars)
- Server-side cart synced across devices (localStorage fallback for guests)
- Coupon system with percentage/flat discounts, usage limits, category restrictions
- Inventory reservations during checkout (10-min hold, prevents oversell)
- Stripe Checkout (cards, Apple Pay, Google Pay)
- Razorpay UPI payments (India)
- Cash on Delivery with pincode serviceability check
- Order history with live status tracking
- PDF invoice download (standard + GST-compliant for India)

### Returns & Refunds
- Buyer requests return within 7-day window
- Admin approves/rejects with notes
- On approval: Stripe refund + stock reversal in MongoDB transaction
- State machine prevents double-refunds and refunds on unpaid orders

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
- Coupon management (CRUD with usage tracking)
- Returns management (approve/reject with refund processing)

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
- Razorpay signature verification with timing-safe compare
- Server-side price recalculation (never trust client)
- MongoDB transactions for atomic inventory
- Idempotent webhook handling (ProcessedWebhookEvent model)
- Helmet with strict CSP, HSTS preload, frameguard deny
- Rate limiting (auth, password reset, API, upload)
- Soft delete with GDPR-friendly email unique index (partial filter)
- Inventory reservation with optimistic concurrency (prevents oversell)

---

## Tech Stack

### Frontend
```
React 19  •  Vite 7  •  TypeScript 5.8  •  Redux Toolkit
React Router 7  •  Tailwind CSS v4  •  Axios  •  React Icons
react-hot-toast
```

### Backend
```
Node.js 22  •  Express 4  •  TypeScript 5.3  •  MongoDB 7
Mongoose 8  •  JWT  •  Argon2id  •  Stripe  •  Razorpay  •  Nodemailer
PDFKit  •  node-cron  •  Helmet  •  express-rate-limit  •  Pino
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
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
CLIENT_URL=http://localhost:5173
SELLER_STATE=Maharashtra
SELLER_GSTIN=27ABCDE1234F1Z5
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
│   │   │   ├── admin/     # AdminDashboard, AdminProducts, AdminOrders, AdminUsers, AdminCoupons, AdminReturns
│   │   │   ├── seller/    # SellerDashboard, SellerProducts, SellerOrders
│   │   │   ├── Layout/    # Header, Footer, Layout
│   │   │   └── ...        # ProductList, Cart, Checkout, OrderHistory, ReturnRequest, ErrorBoundary
│   │   ├── store/         # Redux Toolkit (auth, cart, products slices — cart syncs with server)
│   │   ├── services/      # api.ts (axios client with token refresh)
│   │   └── config/        # routes.ts (lazy-loaded route definitions)
│   ├── Dockerfile         # multi-stage: builder + nginx
│   └── nginx.conf         # SPA fallback, caching, security headers
│
├── backend/               # Node.js + Express + TS
│   ├── src/
│   │   ├── models/        # User, Product, Order, Store, Session, Coupon, ReturnRequest,
│   │   │                  # Reservation, ProcessedWebhookEvent, Cart
│   │   ├── controllers/   # authController, productController, orderController
│   │   ├── routes/        # auth, products, orders, seller, admin, users, upload, config,
│   │   │                  # coupons, returns, reservations, razorpay, pincode, cart
│   │   ├── services/      # AuthService, productService, sellerService, adminService,
│   │   │                  # emailService, couponService, returnService, reservationService,
│   │   │                  # pdfService, razorpayService, pincodeService, cartService
│   │   ├── middleware/    # auth (JWT + RBAC), errorHandler
│   │   ├── config/        # database, middleware (helmet, CORS, rate limits), routes, swagger
│   │   ├── migrations/    # backfill-product-createdBy, fix-user-email-index
│   │   └── server.ts      # entry with process error handlers + cron for reservation cleanup
│   ├── tests/             # 150 Jest tests (14 suites)
│   ├── Dockerfile         # multi-stage: node:22-alpine builder + distroless runtime
│   └── .env.example
│
├── docker-compose.yml     # mongo + backend + frontend
└── README.md
```

### Key Design Decisions

1. **MongoDB transactions** for order creation (atomic stock decrement + order insert)
2. **Server-side price recalculation** — client sends only `{ productId, quantity }`, server computes totals
3. **Stripe webhook signature verification** is non-negotiable — rejects webhooks if `STRIPE_WEBHOOK_SECRET` is unset
4. **Razorpay signature verification** uses timing-safe compare to prevent timing attacks
5. **Idempotent webhook handling** via `ProcessedWebhookEvent` model (dedup on `event.id`, 30-day TTL)
6. **Inventory reservations** with optimistic concurrency — create first, verify total, delete if over-committed
7. **DB-backed sessions** with refresh token hashing — enables revocation (logout, password change)
8. **Soft delete with partial filter index** — GDPR-friendly email unique index scoped to `deletedAt: null`
9. **Server-side cart** with guest→server merge on login (sums quantities, not replaces)
10. **GST invoice** splits tax into CGST+SGST (intra-state) or IGST (inter-state) based on buyer/seller state
11. **Multi-stage Docker builds** — distroless runtime (no shell, minimal attack surface)
12. **Liveness vs readiness split** — `/health` (process alive) vs `/ready` (DB reachable) for k8s

---

## Testing

### Backend (150 tests, 14 suites)
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
| coupon | 13 | CRUD, validate, apply at checkout, usage limits |
| returns | 11 | request, approve (refund + stock reversal), reject, cancel |
| reservation | 9 | hold, release, convert, concurrency (2 parallel holds) |
| invoice | 5 | PDF download, ownership check, 404 |
| razorpay | 5 | create order, verify signature, auth guards |
| pincode | 11 | serviceability, COD eligibility, unit tests |
| cart | 9 | CRUD, merge guest cart, auth guards |

Tests use `mongodb-memory-server` (replica set) — no local MongoDB required.

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
| POST | `/api/orders` | Create order (transaction + stock decrement + coupon) |
| POST | `/api/orders/:id/create-checkout-session` | Stripe Checkout |
| POST | `/api/orders/webhook` | Stripe webhook (signature verified) |
| GET | `/api/orders/:id/invoice` | Download PDF invoice |
| GET | `/api/orders/:id/invoice/gst` | Download GST invoice |
| POST | `/api/coupons/validate` | Validate coupon code |
| POST | `/api/returns` | Request a return |
| PUT | `/api/returns/:id/approve` | Admin approves return (refund + restock) |
| POST | `/api/reservations/hold` | Hold stock during checkout |
| POST | `/api/razorpay/create-order/:orderId` | Create Razorpay order |
| POST | `/api/razorpay/verify/:orderId` | Verify Razorpay payment |
| GET | `/api/pincode/:code/serviceable` | Check pincode serviceability |
| GET | `/api/cart` | Get server cart |
| POST | `/api/cart/merge` | Merge guest cart on login |
| GET | `/api/seller/dashboard` | Seller dashboard |
| POST | `/api/seller/products` | Seller creates product |
| GET | `/api/admin/dashboard` | Admin dashboard |
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
- [ ] Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for UPI payments
- [ ] Configure SMTP credentials for email sending
- [ ] Set `CLIENT_URL` to your frontend URL
- [ ] Set `SELLER_STATE` and `SELLER_GSTIN` for GST invoices
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
