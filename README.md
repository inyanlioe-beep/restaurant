# 🍽️ Le Majestic — Restaurant Management System & POS Terminal

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Le Majestic** is an enterprise-grade, modern Restaurant Management System (RMS) and Point of Sale (POS) terminal built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Prisma ORM**. 

Engineered with a **Dark Luxury Glassmorphic culinary aesthetic**, it covers the full operational spectrum — from Front-of-House (FOH) table service and cash register checkout to Back-of-House (BOH) live kitchen display, recipe modifiers, raw inventory replenishment, staff shift attendance, and financial P&L reporting.

---

## ✨ Key Features & Modules

### 💻 1. Front-of-House & POS Terminal (`/pos`)
- **High-Velocity Cashier Terminal**: Instant menu search, category filtering, and item modifier selection (e.g., meat temperatures, custom sauces, add-ons).
- **Flexible Bill Settlement**: Support for Cash, Credit/Debit Card, and QRIS payments.
- **Change Calculation & Thermal Printing**: Real-time change calculator and digital receipt invoice generation with thermal printer support (80mm & 58mm).
- **Table Integration**: Seamlessly attach orders to active floor tables or process takeaway tickets.

### 🗺️ 2. Visual Floor Plan & Table Management (`/tables`)
- **Multi-Zone Layouts**: Manage tables across multiple sections (e.g., *Main Dining Hall*, *Terrace Garden*).
- **Live Status Tracking**: Real-time table states (`Available`, `Occupied`, `Reserved`, `Cleaning`).
- **Quick-Seat Direct to POS**: One-click seating that immediately opens the POS terminal assigned to that table.

### 👨‍🍳 3. Kitchen Display System (KDS) & Order Pipeline (`/orders`)
- **Lifecycle Pipeline**: Visual Kanban order tracking across statuses:
  $$\text{Pending} \longrightarrow \text{Confirmed} \longrightarrow \text{Preparing} \longrightarrow \text{Ready} \longrightarrow \text{Served} \longrightarrow \text{Completed}$$
- **Order Inspector Drawer**: View line-by-line item modifiers, preparation notes, timestamps, and customer count.
- **Auto-Refresh Feeds**: Synchronized order state keeps waitstaff and kitchen brigade in sync.

### 📅 4. Guest Reservations & Bookings (`/reservations`)
- **Reservation Registry**: Record guest contact details, party size (pax), booking slots, and dietary requirements.
- **Instant Seating**: 1-Click *"Seat Guest"* workflow that transitions reservations into active dining sessions.

### 📦 5. Back-of-House Inventory & Purchasing (`/inventory`)
- **Real-Time Stock Monitoring**: Track ingredients and stock units with automated low-stock warnings.
- **Stock Movement Ledger**: Log restock events (`Stock In`, `Stock Out`, `Waste`, `Adjustment`, `Return`).
- **Health & Valuation Metrics**: Instant view of total inventory capital value and stock health ratios.

### 👥 6. Staff Attendance & Shift Scheduling (`/staff`)
- **Digital Timecard**: Real-time clock in/out tracking with break interval support (`Clocked In`, `On Break`, `Clocked Out`).
- **Weekly Shift Planner**: Schedule employee shifts per role and branch.
- **Role-Based Access Control (RBAC)**: Tailored permissions for Admins, Managers, Chefs, and Waitstaff.

### 📊 7. Executive Analytics & Financial Reports (`/reports`)
- **Sales & Margin Analysis**: Track Gross Revenue, Net Profit, Cost of Goods Sold (COGS), and Gross Margin.
- **Peak Hour & Product Insights**: Visual charts for hourly customer traffic patterns and best-selling menu items.
- **Financial Export**: Export sales reports to CSV and print P&L executive summaries.

### ⚙️ 8. Restaurant & System Settings (`/settings`)
- **Branch Configuration**: Manage tax rates (VAT/Sales Tax), service charges, and multi-currency formats (USD, IDR, EUR, GBP, SGD).
- **Receipt Customization**: Configure thermal paper size, business header/footer notes, and order notification bells.

### 🛡️ 9. Resilient Dual-Mode Architecture
- **Automatic In-Memory Fallback**: When PostgreSQL is offline or during quick local reviews, the application seamlessly activates an interactive mock data service layer. You can demo, click, and test the entire system without spinning up a database first!

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.3.6](https://nextjs.org/) (App Router, Turbopack, Server Actions) |
| **Frontend Library** | [React 19.2.8](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism UI |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) (POS Cart & UI State) |
| **Data Fetching** | [TanStack React Query v5](https://tanstack.com/query) |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) + [Prisma ORM 6.4.1](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js v5 (Beta 32)](https://authjs.dev/) with Credentials Provider & JWT |
| **Validation** | [Zod 4](https://zod.dev/) |
| **Data Visualization** | [Recharts 3](https://recharts.org/) |
| **Icons & Notifications** | [Lucide React](https://lucide.dev/) + [Sonner](https://sonner.emilkowal.ski/) |
| **Containerization** | [Docker Compose](https://docs.docker.com/compose/) |

---

## 📁 Project Structure

```text
restaurant/
├── docker-compose.yml           # PostgreSQL 16 container definition
├── prisma/
│   ├── schema.prisma            # 22 Prisma relational models & enums
│   └── seed.ts                  # Comprehensive database seeder
├── public/                      # Static assets & brand imagery
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication routes (Login)
│   │   ├── (dashboard)/         # Protected application pages
│   │   │   ├── inventory/       # Stock tracking & movements
│   │   │   ├── menu/            # Menu catalog & item modifiers
│   │   │   ├── orders/          # Live kitchen display & order pipeline
│   │   │   ├── pos/             # Cashier POS terminal & cart
│   │   │   ├── reports/         # P&L, sales charts & analytics
│   │   │   ├── reservations/    # Table booking & guest manager
│   │   │   ├── settings/        # Branch settings, tax & printer config
│   │   │   ├── staff/           # Shift scheduling & digital clock in/out
│   │   │   ├── tables/          # Visual floor plan layout
│   │   │   ├── layout.tsx       # Sidebar, Topbar & Navigation shell
│   │   │   └── page.tsx         # Executive dashboard & real-time KPIs
│   │   ├── api/                 # Next.js Route Handlers (REST endpoints)
│   │   └── globals.css          # Tailwind CSS v4 design tokens
│   ├── components/              # Reusable UI components & layouts
│   ├── lib/
│   │   ├── auth/                # NextAuth configuration & options
│   │   ├── data/validators/     # Zod validation schemas
│   │   └── services/            # Service layer (Prisma DB + Mock fallback)
│   ├── providers/               # TanStack Query & NextAuth session providers
│   ├── proxy.ts                 # Next.js 16 RBAC request proxy
│   └── stores/                  # Zustand stores (POS cart, table selection)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 📋 Prerequisites
- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Docker** *(optional, for local PostgreSQL container)*

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/restaurant.git
cd restaurant
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create your local `.env` file from the provided example:

```bash
cp .env.example .env
```

Ensure your `.env` contains the following keys:

```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/restaurant_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production-12345678"
AUTH_SECRET="your-super-secret-key-change-in-production-12345678"
```

> 💡 **Tip**: If you just want to preview or demo the UI without database setup, the application automatically falls back to interactive mock data.

---

### 4️⃣ Set Up the Database (PostgreSQL & Prisma)

Start the PostgreSQL service using Docker:

```bash
docker compose up -d
```

Push the database schema and populate with rich seed data:

```bash
# Push Prisma schema to PostgreSQL
npm run db:push

# Seed default branch, users, floor tables, and menu items
npm run db:seed
```

---

### 5️⃣ Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will redirect you to `/login`.

---

## 🔐 Default Demo Accounts

For rapid testing and evaluation, the database seeder includes predefined accounts across all primary operational roles. Alternatively, you can click any of the **Quick Demo Buttons** on the `/login` screen:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `admin@restaurant.com` | `Admin123!` | Full system access, financials, settings & reports |
| **Store Manager** | `manager@restaurant.com` | `Manager123!` | POS, tables, menu, reservations, inventory & staff |
| **Floor Waiter** | `waiter@restaurant.com` | `Staff123!` | POS ordering, floor plan, order status & reservations |
| **Head Chef** | `chef@restaurant.com` | `Chef123!` | Kitchen display system, order status & inventory |

---

## 📜 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Compiles the production build with type checking |
| `npm run start` | Runs the compiled production application |
| `npm run lint` | Runs ESLint analysis across the codebase |
| `npm run db:push` | Pushes the Prisma schema to the active PostgreSQL database |
| `npm run db:seed` | Executes `prisma/seed.ts` to populate initial records |
| `npm run db:studio` | Launches Prisma Studio GUI at `http://localhost:5555` |
| `npm run db:generate` | Generates or updates the Prisma Client types |

---

## 🔒 Role-Based Access Control (RBAC) Matrix

| Module / Page | Route | Super Admin | Manager | Chef | Waiter |
|---|---|:---:|:---:|:---:|:---:|
| **Executive Dashboard** | `/` | ✅ | ✅ | ❌ | ❌ |
| **POS Terminal** | `/pos` | ✅ | ✅ | ❌ | ✅ |
| **Live Orders / KDS** | `/orders` | ✅ | ✅ | ✅ | ✅ |
| **Floor & Tables** | `/tables` | ✅ | ✅ | ❌ | ✅ |
| **Menu Management** | `/menu` | ✅ | ✅ | ✅ | ❌ |
| **Reservations** | `/reservations` | ✅ | ✅ | ❌ | ✅ |
| **Inventory & Stock** | `/inventory` | ✅ | ✅ | ✅ | ❌ |
| **Staff & Timecards** | `/staff` | ✅ | ✅ | ❌ | ❌ |
| **Financial Reports** | `/reports` | ✅ | ✅ | ❌ | ❌ |
| **Settings** | `/settings` | ✅ | ❌ | ❌ | ❌ |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the [issues page](https://github.com/your-username/restaurant/issues).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Crafted with passion for high-volume culinary excellence. 🍷🍽️
</p>
