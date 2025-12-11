# 🛒 E-Commerce Fullstack Platform

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**A complete full-stack e-commerce platform with modern technologies and enterprise features.**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [API Docs](#api-documentation)

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

A fully-featured e-commerce platform demonstrating complete full-stack development with:

- **React 19** + **TypeScript** modern frontend with Vite
- **Node.js + Express** powerful backend API
- **MongoDB** flexible NoSQL database
- **Stripe** payment integration
- **JWT** authentication & authorization
- **Comprehensive test** suite with Jest
- **Admin dashboard** for platform management
- **Responsive design** for all devices (mobile, tablet, desktop)

**Perfect for:**
- Learning full-stack development
- Building a production e-commerce store
- Portfolio showcase
- Interview preparation

---

## ✨ Key Features

### 🛍️ Shopping Features
- ✅ Product catalog with categories and tags
- ✅ Advanced search and filtering (price, rating, category)
- ✅ Shopping cart with persistent storage
- ✅ Wishlist/favorites functionality
- ✅ Product reviews and ratings (1-5 stars)
- ✅ Stock management and availability tracking
- ✅ Product variants (size, color, etc)
- ✅ Quick view and detailed product pages

### 💳 Payment & Orders
- ✅ Stripe payment integration (card, Apple Pay, Google Pay)
- ✅ Multiple payment methods
- ✅ Order tracking with real-time updates
- ✅ Complete order history
- ✅ Invoice generation and download
- ✅ Order status management (pending, processing, shipped, delivered)
- ✅ Refund processing
- ✅ Email notifications for orders

### 👥 User Management
- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ User profile management
- ✅ Multiple address management
- ✅ Password reset functionality
- ✅ Email verification
- ✅ Role-based access control (User, Admin)
- ✅ Account settings and preferences

### 📊 Admin Dashboard
- ✅ Comprehensive admin panel
- ✅ Product management (CRUD operations)
- ✅ Order management and tracking
- ✅ User management
- ✅ Sales analytics and reports
- ✅ Inventory tracking
- ✅ Discount and coupon management
- ✅ Revenue metrics and charts

### 🔐 Security
- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Rate limiting on API endpoints
- ✅ CORS security configuration
- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ HTTPS ready
- ✅ Helmet.js security headers

### 📱 Responsive Design
- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop experience
- ✅ Accessibility (WCAG 2.1)
- ✅ Progressive enhancement
- ✅ Touch-friendly UI

---

## 🛠 Technology Stack

### **Frontend**
```
React 19 • TypeScript • Vite
Redux Toolkit • React Router v7
Tailwind CSS • React Hook Form
Stripe.js • Axios • Lucide Icons
```

### **Backend**
```
Node.js • Express.js • TypeScript
MongoDB • Mongoose ODM
JWT • bcryptjs
Stripe API • Nodemailer
Multer • Cloudinary • Swagger
Jest • Supertest
```

### **DevOps & Infrastructure**
```
Docker • Docker Compose
GitHub Actions (CI/CD)
Environment Management
API Documentation (Swagger/OpenAPI)
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

### Step 4: Start Development Servers

```bash
# Terminal 1: Backend (runs on port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (runs on port 5173)
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

### Demo Credentials

```
Email: test@example.com
Password: Test123!@#
Role: User

Admin Email: admin@example.com
Admin Password: Admin123!@#
Role: Admin
```

---

## 📁 Project Structure

```
ecommerce-fullstack/
│
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── features/           # Feature modules
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Redux configuration
│   │   ├── services/           # API service calls
│   │   ├── types/              # TypeScript interfaces
│   │   ├── styles/             # Global styles
│   │   └── main.tsx            # Entry point
│   ├── public/                 # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Express Backend
│   ├── src/
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API route handlers
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── services/           # Service layer
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Configuration files
│   │   └── server.ts           # Express app entry
│   ├── tests/                  # Jest test suites
│   ├── dist/                   # Compiled output
│   ├── jest.config.json
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                     # Shared Code
│   └── types.ts               # Shared TypeScript types
│
├── docker-compose.yml
├── .gitignore
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

**Register User**
```bash
POST /auth/register
Content-Type: application/json

{
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

**Get Order by ID**
```bash
GET /orders/:id
Authorization: Bearer token

Response:
{
  "success": true,
  "data": {
    "id": "order_id",
    "user": { "name": "John Doe", "email": "john@example.com" },
    "items": [...],
    "shippingAddress": {...},
    "status": "shipped",
    "tracking": "TRACK123456",
    "totalPrice": 199.98,
    "createdAt": "2025-12-11T10:30:00Z",
    "updatedAt": "2025-12-11T12:00:00Z"
  }
}
```

**Update Order Status (Admin)**
```bash
PUT /orders/:id/status
Authorization: Bearer admin_token
Content-Type: application/json

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

## 🧪 Testing

### Run All Tests

```bash
cd backend
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npm test -- tests/auth.test.ts
```

### Test Coverage

The project includes comprehensive tests for:
- ✅ Authentication endpoints (register, login, logout)
- ✅ Product operations (get, create, update, delete)
- ✅ Order management (create, retrieve, update status)
- ✅ User management
- ✅ Payment processing
- ✅ Admin functions
- ✅ Error handling
- ✅ Validation

**Current Coverage:**
- 33 total tests
- Authentication: 8 tests
- Products: 8 tests
- Orders: 17 tests

---

## 📦 Building & Deployment

### Development Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Production Deployment

#### Using Docker Compose

```bash
docker-compose up --build
```

#### Manual Deployment

```bash
# Backend
cd backend
npm run build
npm start

# Frontend (deploy dist to hosting)
cd frontend
npm run build
# Upload dist/ folder to Vercel, Netlify, or your hosting
```

### Environment Variables for Production

Set these on your deployment platform:

**Backend:**
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=your_very_long_random_secret_key
STRIPE_SECRET_KEY=sk_live_...
PORT=5000
```

**Frontend:**
```
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 🚀 Performance Optimizations

- ✅ Code splitting with Vite
- ✅ Image optimization with Cloudinary
- ✅ Database query optimization
- ✅ API response caching
- ✅ Gzip compression middleware
- ✅ Lazy loading React components
- ✅ Minified production builds
- ✅ CDN for static assets

---

## 🔐 Security Best Practices

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token authentication
- ✅ Rate limiting on auth endpoints
- ✅ CORS properly configured
- ✅ Input validation with express-validator
- ✅ MongoDB injection prevention
- ✅ XSS protection with Helmet.js
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced in production
- ✅ Secure cookie settings

---

## 📈 Features Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced product recommendations (ML)
- [ ] Email marketing integration
- [ ] Loyalty rewards program
- [ ] Marketplace for multiple vendors
- [ ] Live chat customer support
- [ ] Push notifications
- [ ] GraphQL API alternative
- [ ] Social login (Google, Facebook)
- [ ] Multi-currency support

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/ibrsaiaika/ecommerce-fullstack.git
cd ecommerce-fullstack

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git commit -m "feat: Add new feature"

# Push and create pull request
git push origin feature/your-feature
```

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Author

**@ibrsaiaika** - Full Stack Developer

- **GitHub**: [@ibrsaiaika](https://github.com/ibrsaiaika)

---

## 🙏 Acknowledgments

- React & Vite communities
- Express.js & Node.js communities
- MongoDB & Mongoose teams
- Stripe for payment integration
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
