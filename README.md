# FabriCart 🧵

Premium e-commerce platform for clothing fabrics (Shirting & Suiting) built with the MERN stack.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React.js + Redux Toolkit + Vite     |
| Backend        | Node.js + Express.js                |
| Database       | MongoDB + Mongoose                  |
| Auth           | JWT + bcryptjs                      |
| Image Upload   | Cloudinary + Multer                 |
| Payments       | Stripe                              |
| Styling        | Vanilla CSS (custom design system)  |

## Project Structure

```
fabricart/
├── server/                 # Backend API
│   ├── config/             # DB & Cloudinary config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, error, upload
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── utils/              # JWT helper, seeder
│   └── server.js           # Entry point
│
├── client/                 # React Frontend
│   └── src/
│       ├── components/     # Navbar, Footer, ProductCard
│       ├── pages/          # Home, Products, Cart, Admin…
│       ├── store/          # Redux slices
│       └── utils/          # Axios API instance
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Stripe account (for payments)

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

Copy `server/.env.example` to `server/.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/fabricart
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
STRIPE_SECRET_KEY=sk_test_xxx
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates an admin user (`admin@fabricart.com` / `admin123`) and 8 sample products.

### 4. Run Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Features

### User Features
- 🛍️ Browse fabrics by category, material, and brand
- 🔍 Search and sort products
- 🛒 Add to cart, update quantities
- 💳 Checkout with Stripe integration
- 📦 View order history

### Admin Features
- 📊 Dashboard with sales statistics
- 📝 Add / Edit / Delete products
- 📸 Image upload via Cloudinary
- 📋 View and manage all orders
- 📈 Update order status

## API Endpoints

| Method | Endpoint                   | Auth    | Description           |
|--------|----------------------------|---------|-----------------------|
| POST   | /api/auth/register         | Public  | Register user         |
| POST   | /api/auth/login            | Public  | Login user            |
| GET    | /api/products              | Public  | List products         |
| GET    | /api/products/:id          | Public  | Product details       |
| POST   | /api/products              | Admin   | Create product        |
| PUT    | /api/products/:id          | Admin   | Update product        |
| DELETE | /api/products/:id          | Admin   | Delete product        |
| POST   | /api/orders                | User    | Create order          |
| GET    | /api/orders/myorders       | User    | User's orders         |
| GET    | /api/orders                | Admin   | All orders            |
| GET    | /api/orders/stats          | Admin   | Sales statistics      |

## License

MIT
