# 🍔 E-commerce Food Website

A full-stack e-commerce platform for food ordering and delivery built with modern web technologies. Features real-time chat with AI assistance, secure payments, order tracking, and comprehensive admin management.

## ✨ Features

### Customer Features
- **Product Catalog** - Browse food items by category with detailed descriptions
- **Shopping Cart** - Add/remove items, manage quantities
- **Secure Checkout** - Multiple payment options and address management
- **Payment Processing** - VNPay integration for seamless transactions
- **Order Management** - Track orders, view history, cancel orders
- **Product Reviews** - Rate and review purchased items
- **AI Chat Assistant** - Intelligent customer support with RAG technology
- **User Account** - Profile management, password reset, order history

### Admin Features
- **Product Management** - CRUD operations for products, variants, and categories
- **Order Management** - View all orders, update statuses, search functionality
- **User Management** - Manage customers, view account details
- **Blog Management** - Create and manage promotional content
- **Contact Management** - Handle customer inquiries
- **Analytics & Reports** - Revenue summaries, top products, top buyers
- **Shipment Tracking** - Manage order shipping information

### System Features
- **Email Notifications** - Order confirmations, password reset emails via Nodemailer
- **Payment Gateway** - VNPay integration for QR code and direct payments
- **RAG (Retrieval-Augmented Generation)** - AI-powered product recommendations and queries via Google Gemini
- **Database** - MySQL with optimized schema for e-commerce operations

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.21.2
- **Database:** MySQL 8.0 / MariaDB
- **Authentication:** JWT (jsonwebtoken)
- **Payment Gateway:** VNPay
- **Email Service:** Nodemailer
- **AI/ML:** 
  - Google Gemini AI (generative model)
  - Chroma DB (vector database for RAG)
- **Other:** bcryptjs, express-rate-limit

### Frontend
- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.9
- **Router:** React Router DOM 7.9.4
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **QR Code:** qrcode.react

## 📋 Prerequisites

- Node.js v16+ and npm v8+
- MySQL 8.0+ or MariaDB 10.6+
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/HoTrung1293/E-commerce-Food-Website.git
cd E-commerce-Food-Website
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
cat > .env << EOF
# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=ecommerce_db

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key

# Email Service (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# VNPay Payment Gateway
VNP_TMN_CODE=your_vnpay_merchant_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/payment-result

# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key

# Chroma Vector DB
CHROMA_HOST=localhost
CHROMA_PORT=8000
EOF

# Setup database
mysql -u root -p < ../ecommerce_db.sql

# Start backend server
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file:
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📚 API Documentation

### Base URL
- **Backend API:** `http://localhost:5000/api`
- **Frontend:** `http://localhost:5173`

### Main API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

#### Products (`/api/products`)
- `GET /allProducts` - Get all active products
- `GET /detailProduct/:id` - Get product details
- `GET /productByType/:type` - Filter by category
- `POST /productByName` - Search products
- `POST /createProduct` - Create product (admin)
- `PUT /updateProduct/:id` - Update product (admin)
- `DELETE /deleteProduct/:id` - Delete product (admin)

#### Cart (`/api/cart`)
- `POST /addItem` - Add item to cart
- `GET /viewCart/:userId` - View cart
- `PUT /updateItem/:id` - Update item quantity
- `DELETE /removeItem/:id` - Remove item
- `DELETE /clearCart/:id` - Clear cart

#### Orders (`/api/orders`)
- `POST /createOrder` - Create order
- `GET /myOrders/:userId` - Get user orders
- `GET /orderDetail/:orderId` - Get order details
- `PUT /cancelOrder/:orderId` - Cancel order
- `PUT /updateOrder/:orderId` - Update order (admin)
- `GET /getAllOrder` - Get all orders (admin)

#### Payments (`/api/payments`)
- `POST /create-qr` - Create VNPay QR code
- `POST /verify-and-create-order` - Verify payment

#### Reviews (`/api/reviews`)
- `GET /product/:productId` - Get product reviews
- `POST /` - Create review
- `GET /canReview/:productId` - Check if user can review

#### Other Endpoints
- `/api/categories` - Category management
- `/api/shipments` - Shipment tracking
- `/api/blogs` - Blog content
- `/api/contact` - Contact requests
- `/api/chat` - AI chat assistant
- `/api/reports` - Analytics & reports
- `/api/users` - User management (admin)

For detailed API documentation, see the complete endpoint list in the project structure.

## 📁 Project Structure

```
ecommerce-project/
├── backend/
│   ├── config/          # Configuration files (DB, email, payment)
│   ├── controllers/     # Request handlers for each feature
│   ├── routes/          # API route definitions
│   ├── models/          # Data models
│   ├── services/        # Business logic and utilities
│   ├── middlewares/     # Authentication, error handling
│   ├── rag/             # RAG implementation for AI chat
│   ├── server.js        # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React context (Auth, Cart)
│   │   ├── services/    # API client services
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── ecommerce_db.sql     # Database schema and seed data
├── ecommerce_db.mwb     # MySQL Workbench model
├── package.json
└── README.md
```

## 🔐 Security Features

- **Password Hashing** - bcryptjs for secure password storage
- **JWT Authentication** - Token-based stateless authentication
- **Rate Limiting** - Request throttling to prevent abuse
- **Email Verification** - Password reset tokens with expiration
- **Environment Variables** - Sensitive data management

## 🧠 AI & RAG Integration

The project uses **Google Gemini AI** with **Retrieval-Augmented Generation (RAG)**:
- AI-powered chat assistant for customer support
- Product-based Q&A using vector embeddings
- Intelligent recommendations
- Context-aware responses from product database

**Vector Database:** Chroma DB for storing and querying product embeddings

## 💳 Payment Integration

**VNPay Integration:**
- Secure QR code generation for payments
- Real-time payment verification
- Sandbox mode for testing
- SHA512 hashing for transaction security

## 📊 Database Schema

Key tables:
- `users` - Customer and admin accounts
- `products` - Product inventory
- `product_variants` - Product variations (sizes, flavors, etc.)
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `cart` - Shopping cart
- `reviews` - Product reviews
- `shipments` - Shipment tracking
- `blogs` - Blog posts
- `contact_requests` - Customer contact messages
- `payments` - Payment records

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Authors

- **HoTrung1293** - Creator and maintainer

## 📞 Support

For support, please:
- Open an issue on GitHub
- Use the in-app AI chat assistant
- Submit a contact request through the contact form

## 🎯 Future Enhancements

- [ ] Real-time order notifications with WebSocket
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Loyalty rewards program
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)

## 📈 Performance

- Optimized database queries with indexes
- Frontend build optimization with Vite
- Lazy loading for product images
- Caching strategies for API responses
- Vector database indexing for RAG queries

---

**Built with ❤️ by the E-commerce Food Website Team**
