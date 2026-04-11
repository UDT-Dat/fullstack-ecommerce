# Project Context

## What Is This Project?
**Vitality** — a full-stack e-commerce web application for a Vietnamese premium coffee/beverage shop. Built as a MERN stack (MongoDB, Express, React, Node.js) monorepo with separate frontend and backend.

## Project Name
- **Brand Name**: Vitality (displayed in Auth page)
- **API Name**: Citrus Stream API (displayed in server health check)
- **Package Name**: `fullstack-project`

---

## Directory Structure
```
fullstack-project/
├── .agent/                 # Agent configuration (rules, workflows, context, memory)
├── image/                  # Static images used in frontend (local imports)
├── public/                 # Vite public assets
├── src/                    # Frontend source (React + Vite)
│   ├── assets/             # Imported assets (.png, .svg)
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── BestSellers.jsx
│   │   ├── BrandValues.jsx
│   │   ├── CallToAction.jsx
│   │   ├── Subscription.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── AdminSearchBar.jsx
│   │   └── VietnamAddressSelect.jsx
│   ├── context/            # React Context providers
│   │   ├── CartContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/              # Route-level page components
│   │   ├── Auth.jsx        # Login / Register + OTP verification
│   │   ├── Menu.jsx        # Product catalog with filters
│   │   ├── ProductDetail.jsx
│   │   ├── Checkout.jsx    # Cart checkout flow
│   │   ├── OrderStatus.jsx # Order tracking (Grab/ShopeeFood style)
│   │   ├── Promotions.jsx  
│   │   ├── Profile.jsx     # User profile management
│   │   ├── News.jsx        # Blog/news listing
│   │   ├── NewsDetail.jsx  # Single article view with TOC
│   │   └── admin/          # Admin dashboard pages
│   │       ├── AdminLayout.jsx  # Sidebar + nested routes
│   │       ├── Overview.jsx     # Dashboard analytics (Recharts)
│   │       ├── Products.jsx     # CRUD products
│   │       ├── Orders.jsx       # Order management
│   │       ├── Vouchers.jsx     # Discount code management
│   │       ├── Customers.jsx
│   │       ├── Users.jsx        # User CRUD (admin)
│   │       ├── Members.jsx      # Membership tier management
│   │       ├── Posts.jsx        # CMS with React Quill WYSIWYG editor
│   │       └── Settings.jsx
│   ├── App.jsx             # Root component with React Router
│   ├── App.css
│   ├── index.css           # Tailwind + global styles
│   └── main.jsx            # Vite entry point
│
├── server/                 # Backend source (Node.js + Express)
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, OTP send/verify
│   │   ├── productController.js   # Product CRUD
│   │   ├── orderController.js     # Order CRUD + email notification
│   │   ├── userController.js      # User profile + membership
│   │   ├── postController.js      # Blog post CRUD
│   │   ├── discountController.js  # Voucher management
│   │   └── dashboardController.js # Analytics aggregation
│   ├── models/
│   │   ├── User.js       # name, email, phone, password, role, isMember, manualTier
│   │   ├── Product.js    # title, price, description, image, category, type, stock
│   │   ├── Order.js      # user, products[], totalPrice, shippingAddress, status
│   │   ├── Post.js       # title, summary, content(HTML), thumbnail, tags, status, slug
│   │   ├── Discount.js   # code, discountPercentage, isActive, usedCount
│   │   └── Otp.js        # email, otp, createdAt (TTL 5min auto-delete)
│   ├── routes/
│   │   ├── authRoutes.js      #  /api/auth/*
│   │   ├── productRoutes.js   #  /api/products/*
│   │   ├── orderRoutes.js     #  /api/orders/*
│   │   ├── userRoutes.js      #  /api/users/*
│   │   ├── postRoutes.js      #  /api/posts/*
│   │   ├── discountRoutes.js  #  /api/discounts/*
│   │   ├── dashboardRoutes.js #  /api/dashboard/*
│   │   └── uploadRoutes.js    #  /api/upload (image upload via multer)
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT token verification
│   ├── services/
│   │   └── emailService.js    # Resend SDK: OTP emails + order notifications
│   ├── uploads/               # Uploaded images (served statically)
│   ├── server.js              # Express entry point
│   ├── .env                   # Environment variables (PORT, MONGO_URI, JWT_SECRET, RESEND_API_KEY)
│   └── package.json
│
├── package.json               # Frontend dependencies + Vite scripts
├── vite.config.js
├── index.html
└── PROJECT_RULES.md           # Legacy rules doc (superseded by .agent/rules.md)
```

---

## Key API Endpoints

| Method | Endpoint                  | Auth | Description                  |
|--------|--------------------------|------|------------------------------|
| POST   | `/api/auth/register`     | No   | Register (requires OTP)      |
| POST   | `/api/auth/login`        | No   | Login (triggers OTP send)    |
| POST   | `/api/auth/send-otp`     | No   | Send OTP to email            |
| POST   | `/api/auth/verify-login` | No   | Verify OTP and get JWT       |
| GET    | `/api/products`          | No   | List all products            |
| GET    | `/api/products/:id`      | No   | Get single product           |
| POST   | `/api/orders`            | Yes  | Create order + email notify  |
| GET    | `/api/orders/my`         | Yes  | Get user's orders            |
| GET    | `/api/posts`             | No   | List published posts         |
| GET    | `/api/posts/:slug`       | No   | Get post by slug             |
| POST   | `/api/upload`            | Yes  | Upload image file            |
| GET    | `/api/dashboard/stats`   | Yes  | Admin analytics data         |
| POST   | `/api/discounts/validate`| No   | Validate voucher code        |

---

## Authentication Flow
1. **Register**: Fill form → Send OTP to email → Enter 6-digit OTP → Account created
2. **Login**: Email+Password → OTP sent to email → Enter OTP → JWT issued
3. **Remember Me**: If checked, JWT lasts 30 days (skip OTP next time); otherwise 1 day
4. **Token storage**: `localStorage` (`token` key + `user` object key)
5. **Roles**: `user`, `staff`, `admin`

---

## Membership & Pricing
- **Tiers**: Đồng (5%), Vàng (10%), Kim Cương (15%) discount
- Tiers can be auto-calculated from order count or manually assigned by admin
- Voucher discounts stack on top of membership discounts
- Shipping fee: fixed 15,000 VND

---

## Environment Variables (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key_here
RESEND_API_KEY=re_...
SENDER_EMAIL="onboarding@resend.dev"
```

---

## Running the Project
- **Frontend**: `npm run dev` from `fullstack-project/` (Vite on port 5173)
- **Backend**: `npx nodemon server.js` from `fullstack-project/server/` (Express on port 5000)
- Both must run simultaneously for full functionality
