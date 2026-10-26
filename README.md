# CampusTrade

**A Verified Student Marketplace and College E-Commerce Platform.**

CampusTrade is where students list and buy textbooks, dorm gear,
electronics, and lab supplies within their campus community.

**Stack:** React (Vite) + Tailwind CSS · Node.js/Express · MongoDB/Mongoose · JWT auth

## Features

- Browse listings with search, category filters, and pagination
- Product detail pages with stock-aware quantity selection
- Cart → shipping details → checkout, backed by real order records
- Email/password auth with JWT, persisted sessions
- Admin dashboard for managing listings (add / edit / delete), gated by
  `role: 'admin'` on both the frontend route and the backend API
- A direct "Call to order" link (`tel:`) for reaching a seller/support
  without a chat widget
- Seed script for realistic sample listings and a ready-to-use admin login

## Folder structure

```
campustrade/
├── client/                     # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js         # shared axios instance, attaches JWT
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx         # logo, tagline, nav links, cart badge, auth buttons
│   │   │   │   ├── Footer.jsx         # link columns + tel: support call
│   │   │   │   └── Layout.jsx         # Navbar + <Outlet /> + Footer
│   │   │   ├── admin/
│   │   │   │   └── ProductFormModal.jsx   # create/edit listing form
│   │   │   └── ProtectedRoute.jsx     # auth + admin-only route guard
│   │   ├── config/
│   │   │   └── contact.js             # shared support phone number
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # session state, login/register/logout
│   │   │   └── CartContext.jsx        # cart items, persisted to localStorage
│   │   ├── hooks/
│   │   │   └── useDocumentTitle.js    # sets "<Page> | CampusTrade" tab titles
│   │   ├── pages/
│   │   │   ├── Home.jsx               # hero + value props
│   │   │   ├── ProductCatalog.jsx     # /shop — search, category filter, pagination
│   │   │   ├── ProductDetail.jsx      # /products/:id — Add to cart + call to order
│   │   │   ├── Cart.jsx               # cart items -> shipping form -> confirmation
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Admin.jsx              # /admin — listings table, admin-only
│   │   │   └── NotFound.jsx
│   │   ├── utils/
│   │   │   └── formatPrice.js         # shared currency formatter
│   │   ├── App.jsx                    # route table
│   │   ├── main.jsx                   # entrypoint, wraps App in providers
│   │   └── index.css
│   ├── index.html
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── errorMiddleware.js  # 404 + centralized error handling
│   │   └── authMiddleware.js   # protect (JWT) + admin (role gate)
│   ├── models/
│   │   ├── User.js             # name, email, password hash, role, timestamps
│   │   ├── Product.js          # title, description, price, category, stock, imageUrl
│   │   └── Order.js            # user ref, orderItems, totalAmount, shippingAddress, status
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── utils/
│   │   └── generateToken.js    # JWT signing helper
│   ├── seed.js                 # sample listings + dev admin account
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js               # App entrypoint
├── package.json                # root — runs client + server together
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string — either a local `mongod` instance or a
  free MongoDB Atlas cluster (https://www.mongodb.com/atlas)

## Setup

**1. Configure environment variables**

```bash
cp server/.env.example server/.env   # fill in MONGO_URI and JWT_SECRET
cp client/.env.example client/.env   # VITE_API_URL defaults to http://localhost:5000/api
```

**2. Install dependencies**

```bash
npm install --prefix server
npm install --prefix client
npm install               # root — installs `concurrently` for the dev script below
```

**3. Seed the database**

```bash
npm run seed
```

This populates 10 sample campus listings (textbooks, electronics, dorm
gear, and a lab coat).

**4. Run the app**

```bash
npm run dev
```

Once running, sign in with the seeded admin account and visit `/admin`
to manage listings, or browse `/shop` as a signed-out visitor.

## API reference

| Method | Route                      | Access          | Description |
|---|---|---|---|
| POST   | `/api/auth/register`       | Public          | Create a student account with campus details |
| POST   | `/api/auth/login`          | Public          | Returns JWT + student profile |
| GET    | `/api/auth/me`             | Private         | Current user's profile |
| PUT    | `/api/auth/profile`        | Private         | Update campus info and verify student status |
| GET    | `/api/products`            | Public          | List products — `?category=`, `?search=`, `?campus=`, `?condition=`, `?page=`, `?limit=` |
| GET    | `/api/products/categories` | Public          | Dedicated list of all unique categories |
| GET    | `/api/products/my`         | Private         | List all products posted by the logged-in student |
| GET    | `/api/products/:id`        | Public          | Single product with seller profile populated |
| POST   | `/api/products`            | Private         | Create a campus listing (Student or Admin) |
| PUT    | `/api/products/:id`        | Private (Owner) | Update a listing (Seller or Admin) |
| DELETE | `/api/products/:id`        | Private (Owner) | Delete a listing (Seller or Admin) |
| POST   | `/api/orders`              | Private         | Place an order (server-verified totals & atomic stock decrement) |
| GET    | `/api/orders/my`           | Private         | The current user's own orders |
| GET    | `/api/orders/:id`          | Private (Owner) | Single order details |
| GET    | `/api/orders`              | Admin           | Every order in the store (Admin dashboard) |
| PUT    | `/api/orders/:id`          | Admin           | Update `orderStatus` / `paymentStatus` |

## Security & Architecture Highlights

- **Server-Side Price Verification**: Orders dynamically query the database for authentic product pricing to prevent tampering.
- **Atomic Stock Decrementing**: Inventory is safely checked and decremented using MongoDB atomic operators upon checkout.
- **Student Verification Guard**: Users can register their campus name, student ID, and graduation year; `.edu` / university domains grant verified badges.
- **Brute-Force & DoS Protection**: Hardened with `helmet`, restricted CORS origins, and `express-rate-limit` across auth routes.
