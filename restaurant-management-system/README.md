# Offline Restaurant Management System & POS

A production-grade, **100% offline-first** Restaurant Management System and Point-of-Sale built with the MERN stack (MongoDB · Express.js · React.js · Node.js). No cloud dependencies. No internet required.

---

## 🎨 Design Palette

| Role | Hex | Usage |
|---|---|---|
| **White** | `#FFFFFF` | Cards, surfaces, modal backgrounds |
| **Black** | `#121212` | Sidebar, typography, nav headers |
| **Accent Orange** | `#FF6B00` | Primary CTAs, active states, badges |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v6 |
| **Backend** | Node.js 24, Express.js 4 |
| **Database** | MongoDB (Local) via Mongoose 8 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Image Uploads** | Multer (local disk storage) |

---

## 📁 Project Structure

```
restaurant-management-system/
├── client/                          # React + Tailwind CSS Frontend
│   └── src/
│       ├── components/
│       │   ├── Sidebar.jsx          # Role-aware navigation sidebar
│       │   ├── Navbar.jsx           # Top bar with live clock & offline badge
│       │   ├── DashboardCard.jsx    # KPI metric card component
│       │   ├── POSCart.jsx          # Order cart with tax, discount, checkout
│       │   ├── ReceiptModal.jsx     # 80mm thermal-receipt printable modal
│       │   ├── PaymentModal.jsx     # Cash payment & change calculator modal
│       │   ├── TableSelectorModal.jsx
│       │   ├── ItemModal.jsx        # Create/edit menu item with image upload
│       │   ├── CategoryModal.jsx
│       │   ├── UserModal.jsx        # Staff create/edit + password reset
│       │   └── StockAdjustModal.jsx
│       ├── pages/
│       │   ├── Login.jsx            # JWT authentication page
│       │   ├── AdminDashboard.jsx   # KPIs, top dishes, recent orders
│       │   ├── CashierPOS.jsx       # Full interactive POS terminal
│       │   ├── Orders.jsx           # Transaction ledger + receipt viewer
│       │   ├── Menu.jsx             # Menu & category management
│       │   ├── Tables.jsx           # Floor plan grid + status management
│       │   ├── Inventory.jsx        # Stock levels, alerts, audit logs
│       │   ├── Reports.jsx          # Sales analytics, cashier performance
│       │   ├── Users.jsx            # Staff CRUD + role/status management
│       │   └── Settings.jsx         # System config + DB backup/restore
│       ├── context/
│       │   └── AuthContext.jsx      # JWT auth state & role helpers
│       ├── services/
│       │   └── api.js               # Centralized offline REST API client
│       ├── App.jsx                  # React Router + protected routes
│       └── main.jsx
│
└── server/                          # Node.js + Express Backend
    ├── config/
    │   └── db.js                    # Local MongoDB connection
    ├── controllers/
    │   ├── authController.js        # Login, session validation
    │   ├── userController.js        # Staff CRUD, password reset
    │   ├── categoryController.js
    │   ├── menuController.js        # Menu CRUD + image handling
    │   ├── tableController.js       # Table status management
    │   ├── orderController.js       # POS order creation, cancellation
    │   ├── inventoryController.js   # Stock adjustments + audit logs
    │   ├── reportController.js      # Sales analytics aggregation
    │   ├── settingsController.js    # System settings CRUD
    │   └── backupController.js      # Local JSON backup & restore
    ├── middleware/
    │   ├── authMiddleware.js        # JWT Bearer token verification
    │   ├── roleMiddleware.js        # Admin / Cashier RBAC enforcement
    │   └── uploadMiddleware.js      # Multer disk image uploader
    ├── models/
    │   ├── User.js
    │   ├── Category.js
    │   ├── MenuItem.js
    │   ├── Table.js
    │   ├── Order.js
    │   ├── Payment.js
    │   ├── InventoryLog.js
    │   └── SystemSettings.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── categoryRoutes.js
    │   ├── menuRoutes.js
    │   ├── tableRoutes.js
    │   ├── orderRoutes.js
    │   ├── inventoryRoutes.js
    │   ├── reportRoutes.js
    │   ├── settingsRoutes.js
    │   └── backupRoutes.js
    ├── utils/
    │   └── seeder.js                # One-command database seed script
    ├── uploads/                     # Local food item images
    ├── backups/                     # Local JSON database snapshots
    ├── server.js                    # Express app entry point
    └── .env                         # Environment config (local only)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Install Dependencies

```bash
# Install server dependencies
cd restaurant-management-system/server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- ✅ **Admin account**: `username: admin` / `password: admin123`
- ✅ **Cashier account**: `username: cashier` / `password: cashier123`
- ✅ 6 menu categories with 15 curated food items
- ✅ 8 dining tables
- ✅ System settings
- ✅ Sample completed order

### 3. Start the Server

```bash
cd server
npm run dev    # Development with nodemon
# OR
npm start      # Production
```

Server runs at: **http://localhost:5000**

### 4. Start the Frontend

```bash
cd client
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 5. Login

Open `http://localhost:5173/login` and use the quick-fill demo buttons, or type credentials manually.

---

## 👤 User Roles & Access

| Feature | Admin | Cashier |
|---|:---:|:---:|
| POS Terminal (Cashier Screen) | ✅ | ✅ |
| Orders & Receipts (View Own) | ✅ | ✅ |
| Executive Dashboard | ✅ | ❌ |
| Menu & Category Management | ✅ | ❌ |
| Table Management | ✅ | ❌ |
| Inventory & Stock Control | ✅ | ❌ |
| Sales Analytics Reports | ✅ | ❌ |
| Staff & User Management | ✅ | ❌ |
| System Settings & Backups | ✅ | ❌ |
| Cancel Orders (Admin Override) | ✅ | ❌ |

---

## 📋 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticate user |
| GET | `/api/auth/me` | JWT | Validate session |
| GET | `/api/users` | Admin | List staff accounts |
| POST | `/api/users` | Admin | Create staff account |
| PUT | `/api/users/:id` | Admin | Update user details |
| PUT | `/api/users/:id/reset-password` | Admin | Reset password |
| DELETE | `/api/users/:id` | Admin | Delete user |
| GET | `/api/categories` | JWT | List categories |
| POST | `/api/categories` | Admin | Create category |
| GET | `/api/menu` | JWT | List menu items |
| POST | `/api/menu` | Admin | Add menu item (with image) |
| PATCH | `/api/menu/:id/toggle-availability` | JWT | Toggle 86'd status |
| GET | `/api/tables` | JWT | List all tables |
| PATCH | `/api/tables/:id/status` | JWT | Update table status |
| POST | `/api/orders` | JWT | Create & process order |
| GET | `/api/orders` | JWT | Order history with filters |
| PATCH | `/api/orders/:id/cancel` | Admin | Cancel + refund inventory |
| GET | `/api/inventory` | Admin | Stock overview & alerts |
| POST | `/api/inventory/adjust` | Admin | Manual stock adjustment |
| GET | `/api/inventory/logs` | Admin | Audit trail |
| GET | `/api/reports/dashboard` | Admin | Dashboard KPIs |
| GET | `/api/reports/sales` | Admin | Sales analytics |
| GET | `/api/settings` | JWT | Get system settings |
| PUT | `/api/settings` | Admin | Update settings |
| POST | `/api/backup/create` | Admin | Create local JSON backup |
| GET | `/api/backup/list` | Admin | List backup files |
| POST | `/api/backup/restore` | Admin | Restore from backup |

---

## 🖨️ Receipt Printing

Receipts are formatted for **80mm thermal printers**. Click **"Print 80mm Receipt"** in the receipt modal and your OS print dialog will target only the receipt area.

---

## 💾 Database Backup

Backups are stored as JSON files in `server/backups/`. The backup includes all collections: users, menu, categories, tables, orders, payments, inventory logs, and system settings.

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (10 salt rounds)
- JWT tokens expire after **30 days**
- Admin routes are double-guarded: frontend route guard + Express middleware
- Cashiers are **strictly prevented** from accessing any admin API endpoint
- No external authentication servers — 100% local offline auth
