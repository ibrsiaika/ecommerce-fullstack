# 🛒 E-Commerce Fullstack Platform

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-000?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-000?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-000?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-000?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-000?style=for-the-badge)

**A complete, clean, and modern full-stack e-commerce platform.**

[✨ Features](#features) • [⚙️ Tech Stack](#tech-stack) • [🚀 Quick Start](#quick-start) • [📖 API Docs](#api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

A clean, minimal full-stack e-commerce platform built with modern technologies:

- **React 19** + **TypeScript** frontend
- **Node.js + Express** backend
- **MongoDB** database
- **Stripe** payments
- **JWT** authentication
- **Fully tested** with Jest
- **Admin & Seller dashboards**
- **Responsive design**

> **Built for**: Learning • Production use • Portfolio showcase • Job interviews

---

## ✨ Key Features

### 🛍️ Shopping
- ✅ Product catalog with categories
- ✅ Search & filtering (price, rating, category)
- ✅ Shopping cart with persistent storage
- ✅ Wishlist functionality
- ✅ Reviews & ratings (1-5 stars)
- ✅ Stock tracking & variants
- ✅ Quick view & detailed pages

### 💳 Payments & Orders
- ✅ Stripe integration (card, Apple Pay, Google Pay)
- ✅ Multiple payment methods
- ✅ Order tracking & history
- ✅ Invoice generation
- ✅ Order status management
- ✅ Refund processing
- ✅ Email notifications

### 👥 User Management
- ✅ Registration & email verification
- ✅ Secure JWT authentication
- ✅ Profile management
- ✅ Multiple address storage
- ✅ Password reset
- ✅ Role-based access control
- ✅ Account settings

### 📊 Admin Dashboard
- ✅ Platform statistics
- ✅ Product management (CRUD)
- ✅ Order & user management
- ✅ Sales analytics & reports
- ✅ Inventory tracking
- ✅ Discount & coupon system
- ✅ **Customizable Widget Dashboard** (drag-drop, toggle widgets)
- ✅ **Custom Report Builder** (save & manage custom reports)
- ✅ **Role & Permission Management** (granular access control)
- ✅ **Custom Views & Filters** (save and reuse filter configurations)

### 🏪 Marketplace
- ✅ Seller store creation
- ✅ Seller verification workflow
- ✅ Public storefronts
- ✅ Store ratings & followers
- ✅ Seller dashboard & metrics

### 💼 Seller Accounts
- ✅ Store profile management
- ✅ Product inventory
- ✅ Order fulfillment
- ✅ Earnings tracking
- ✅ Commission system
- ✅ Withdrawal requests
- ✅ Seller analytics

### 📈 Analytics
- ✅ Revenue trends
- ✅ Sales by category
- ✅ Top products & sellers
- ✅ Conversion rates
- ✅ Customer insights

### 🔐 Security
- ✅ Password hashing (bcryptjs)
- ✅ JWT token auth
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Input validation
- ✅ XSS protection
- ✅ HTTPS ready
- ✅ Security headers

### 📱 Responsive Design
- ✅ Mobile-first
- ✅ Tablet optimized
- ✅ Desktop experience
- ✅ WCAG 2.1 accessible

---

## 🛠 Technology Stack

### Frontend
```
React 19  •  TypeScript  •  Vite  •  Redux Toolkit
React Router  •  Tailwind CSS  •  React Hook Form
Stripe.js  •  Axios
```

### Backend
```
Node.js  •  Express.js  •  TypeScript  •  MongoDB
Mongoose  •  JWT  •  bcryptjs  •  Stripe API
Nodemailer  •  Multer  •  Swagger  •  Jest
```

### DevOps
```
Docker  •  Docker Compose  •  GitHub Actions
Environment Management  •  API Documentation
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
npm or yarn
MongoDB (local or MongoDB Atlas)
Stripe account (free for testing)
```

### Step 1: Clone Repository

```bash
git clone https://github.com/ibrsaiaika/ecommerce-fullstack.git
cd ecommerce-fullstack
```

### Step 2: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 3: Environment Setup

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Start Servers
```bash
# Terminal 1: Backend (port 5000)
cd backend && npm run dev

# Terminal 2: Frontend (port 5173)
cd frontend && npm run dev
```

### Access
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/api-docs |
| Health Check | http://localhost:5000/health |

### Demo Credentials
```
Email: test@example.com | Password: Test123!@#
Admin: admin@example.com | Password: Admin123!@#
```

---

---

## 🔌 API Endpoints

### Admin  
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/stats/trends` | Revenue trends |
| GET | `/api/admin/top-products` | Top selling products |
| GET | `/api/admin/user-growth` | User growth metrics |
| GET | `/api/admin/sellers/pending` | Pending verifications |
| POST | `/api/admin/sellers/:id/verify` | Verify seller |

### Seller
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/dashboard` | Dashboard data |
| GET/PUT | `/api/seller/store` | Store profile |
| GET | `/api/seller/products` | Seller products |
| GET | `/api/seller/orders` | Seller orders |
| GET | `/api/seller/earnings` | Earnings summary |
| POST | `/api/seller/withdrawals` | Request withdrawal |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All products |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/reviews` | Add review |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | User orders |
| GET | `/api/orders/:id` | Order details |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |

### Auth & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/wishlist` | Get wishlist |
| POST | `/api/users/wishlist/:id` | Add to wishlist |

---

## 📁 Project Structure

```
ecommerce-fullstack/
├── frontend/              # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── features/      # Feature modules
│   │   ├── store/         # Redux store
│   │   ├── services/      # API calls
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Service layer
│   │   ├── utils/         # Utilities
│   │   └── server.ts      # App entry
│   ├── tests/             # Jest tests
│   └── package.json
│
├── shared/                # Shared TypeScript types
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

## 📚 API Documentation

**Base URL**: `http://localhost:5000/api`  
**Full Docs**: `http://localhost:5000/api-docs`
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "token": "jwt_token_here",
    "user": { "name": "John Doe", "email": "john@example.com" }
  }
}
```

**Login User**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { "id": "...", "name": "...", "email": "...", "role": "user" }
  }
}
```

**Get Current User**
```bash
GET /auth/me
Authorization: Bearer jwt_token_here

Response:
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Product Endpoints

**Get All Products**
```bash
GET /products?category=electronics&minPrice=100&maxPrice=500&page=1&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "images": ["url1", "url2"],
      "rating": 4.5,
      "reviews": 120,
      "stock": 50,
      "category": "electronics"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

**Get Product by ID**
```bash
GET /products/:id

Response:
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "Product Name",
    "description": "Detailed description",
    "price": 99.99,
    "images": ["url1", "url2", "url3"],
    "rating": 4.5,
    "reviews": [
      {
        "id": "review_id",
        "user": "John Doe",
        "rating": 5,
        "comment": "Great product!",
        "createdAt": "2025-12-11T10:30:00Z"
      }
    ],
    "stock": 50,
    "category": "electronics",
    "variants": [
      { "size": "S", "color": "Red" },
      { "size": "M", "color": "Blue" }
    ]
  }
}
```

### Order Endpoints

**Create Order**
```bash
POST /orders
Authorization: Bearer token
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "totalPrice": 199.98
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order_id",
    "user": "user_id",
    "items": [...],
    "status": "pending",
    "totalPrice": 199.98,
    "createdAt": "2025-12-11T10:30:00Z"
  }
}
```

**Get User Orders**
```bash
GET /orders/mine
Authorization: Bearer token

Response:
{
  "success": true,
  "data": [
    {
      "id": "order_id",
      "items": [...],
      "status": "delivered",
      "totalPrice": 199.98,
      "createdAt": "2025-12-11T10:30:00Z"
    }
  ]
}
```

---

## 🧪 Testing

```bash
# Run all tests
cd backend && npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

**Coverage**: 33 tests (Auth: 8, Products: 8, Orders: 17)

---

## 📦 Deployment

### Quick Start
```bash
# Using Docker
docker-compose up --build

# Manual
cd backend && npm run build && npm start
cd frontend && npm run build
```

---

## 🚀 Optimizations

- ✅ Code splitting & lazy loading
- ✅ Image optimization (Cloudinary)
- ✅ Database query optimization
- ✅ Gzip compression
- ✅ Minified production builds

---

## 🔐 Security

- ✅ bcryptjs password hashing
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Input validation
- ✅ XSS protection (Helmet.js)
- ✅ HTTPS in production

---

## 🏗️ Architecture

```
Frontend
├── Pages (Home, Product, Cart, Orders)
├── Components (Cards, Headers, Forms)
├── Redux (Products, Cart, Auth)
└── Services (API, utilities)

Backend
├── Models (User, Product, Order, Store)
├── Routes (auth, products, orders)
├── Controllers (business logic)  
├── Services (data operations)
└── Middleware (auth, validation)
```

---

{
  "status": "shipped"
}

Response:
{
  "success": true,
  "message": "Order status updated",
  "data": { "id": "...", "status": "shipped" }
}
```

---

## 🏗️ Backend Structure

- [ ] Mobile app (React Native)
- [ ] AI recommendations
- [ ] Email marketing
- [ ] Loyalty program
- [ ] Live chat support
- [ ] Push notifications
- [ ] GraphQL API
- [ ] Social login
- [ ] Multi-currency

---

## 🎨 Admin Customization Features (NEW)

### Dashboard Customization
- **Drag-and-Drop Widgets**: Rearrange widgets to customize your dashboard layout
- **Widget Toggle**: Enable/disable specific widgets for a tailored experience
- **Auto-Refresh Settings**: Control data refresh intervals (5s - 300s)
- **Theme Settings**: Choose between light and dark themes
- **Personalized Views**: Save and load custom dashboard configurations

### Custom Reports
- **Report Builder**: Create custom reports with selected metrics
- **Date Range Selection**: Daily, weekly, monthly, or custom date ranges
- **Metric Selection**: Choose from 14+ available metrics
- **Report Export**: Export reports as JSON for external analysis
- **Saved Reports**: Store and manage multiple report templates

### Role & Permission Management
- **Custom Roles**: Create roles with granular permissions
- **Resource-Based Access**: Control access to orders, products, users, sellers, payments, reports, settings, and dashboard
- **Action-Level Control**: Grant/revoke specific actions (view, create, edit, delete, manage)
- **System Role Protection**: Prevent deletion of system roles (admin, seller, user)
- **User Role Assignment**: Assign custom roles to users dynamically

### Custom Views & Filters
- **Save Filter Sets**: Create and save filter combinations for quick access
- **Multiple Data Types**: Create custom views for orders, products, users, and sellers
- **Default Filter**: Set a default filter to load automatically
- **Filter Templates**: Pre-configured filters for common scenarios
- **Dynamic Filtering**: Filter by status, price, date, category, ratings, and more

### Notification Preferences
- **Event-Based Alerts**: Configure notifications for 7 event types:
  - New Orders
  - Payment Failures
  - Low Stock Alerts
  - Seller Verification
  - New Reviews
  - Order Shipments
  - Refund Processing
- **Multi-Channel Support**: Email, in-app, and push notifications
- **Granular Control**: Enable/disable notifications per event and channel

---

## 📋 Customization API Endpoints

### Preferences Management
```
GET  /api/admin/customization/preferences
PUT  /api/admin/customization/preferences/widgets
PUT  /api/admin/customization/preferences/widgets/:widgetId/toggle
PUT  /api/admin/customization/preferences/widgets/rearrange
PUT  /api/admin/customization/preferences/notifications
PUT  /api/admin/customization/preferences/refresh-interval
PUT  /api/admin/customization/preferences/settings
```

### Reports
```
POST   /api/admin/customization/preferences/reports
DELETE /api/admin/customization/preferences/reports/:reportName
```

### Filters & Views
```
POST   /api/admin/customization/filters
GET    /api/admin/customization/filters/:type
PUT    /api/admin/customization/filters/:filterId
DELETE /api/admin/customization/filters/:filterId
PUT    /api/admin/customization/filters/:filterId/set-default
```

### Role Management
```
GET    /api/admin/roles
GET    /api/admin/roles/:roleId
POST   /api/admin/roles
PUT    /api/admin/roles/:roleId
DELETE /api/admin/roles/:roleId
POST   /api/admin/roles/:roleId/permissions
DELETE /api/admin/roles/:roleId/permissions/:resource
GET    /api/admin/roles/resources/all
GET    /api/admin/roles/resources/:resource
```

---

## 💾 Database Models

### New Models Added
1. **Role Model**: Manage custom roles with permissions
2. **AdminPreferences Model**: Store user dashboard customizations
3. **SavedFilter Model**: Persist custom filter configurations

### Schema Details
- **Role**: Contains name, description, permissions array, and system flag
- **AdminPreferences**: Stores widgets config, notifications, refresh intervals, and user settings
- **SavedFilter**: Saves filter configs with admin reference and type

---



We welcome contributions! 

**Get Started:**
```bash
git clone https://github.com/ibrsaiaika/ecommerce-fullstack.git
cd ecommerce-fullstack
git checkout -b feature/your-feature
# Make changes
git commit -m "feat: Your feature"
git push origin feature/your-feature
```

**Guidelines:**
- Follow existing code style
- Write tests for new features
- Keep commits atomic & descriptive
- Update documentation

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file

---

## �‍💻 Author

**@ibrsaiaika** - Full Stack Developer  
[GitHub](https://github.com/ibrsaiaika)

---

## 🙏 Thanks

React • Vite • Express • Node.js • MongoDB • Stripe
- Cloudinary for image hosting
- All open-source contributors

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ibrsaiaika/ecommerce-fullstack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ibrsaiaika/ecommerce-fullstack/discussions)
- **Email**: ibrsaiaika@outlook.com

---

<div align="center">

### ⭐ If you find this project helpful, please give it a star! ⭐

**Made with ❤️ for e-commerce excellence**

**Happy coding! 🚀**

</div>
