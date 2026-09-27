# Restaurant Management System & POS Terminal — Implementation Plan & System Architecture

Dokumen ini adalah rencana implementasi resmi dan spesifikasi arsitektur teknis sistem **"Le Majestic" Restaurant Management & POS Terminal**, yang mencakup implementasi menyeluruh dari **Fase 1 (Pondasi Inti, POS & Servis Meja)** serta **Fase 2 (Back-of-House, Operasional Enterprise, & Laporan Keuangan)**.

---

## 📌 Identitas Proyek & Arsitektur Teknologi

- **Nama Aplikasi**: Le Majestic Restaurant Management & POS Terminal
- **Framework & Runtime**: Next.js 16.3.6 (App Router + Turbopack) + React 19.2.8 + TypeScript 5
- **Styling & UI**: Tailwind CSS v4 + Lucide Icons + Glassmorphism Dark Luxury Culinary Theme
- **State Management**: Zustand (POS & Cart State) + TanStack React Query v5 (Data Fetching, Caching, Auto-refetch)
- **Database & ORM**: PostgreSQL 16 (Docker-ready via `docker-compose.yml`) + Prisma ORM 6.4.1
- **Arsitektur Data**: **Hybrid Dual-Mode** (Database PostgreSQL aktif dengan otomatis *fallback* ke in-memory mock data interaktif jika database lokal belum dihubungkan, memungkinkan pengembangan dan demo instan tanpa hambatan).
- **Autentikasi**: NextAuth.js v5 (`next-auth@beta.32`, JWT Strategy, Credentials Provider)
- **Routing & Proteksi**: Next.js 16 Request Proxy (`src/proxy.ts`) + Client-side `AuthGuard.tsx`

---

## 🚀 Status Implementasi Fitur (Roadmap & Delivery Status)

### Fase 1: Foundation, Core Ordering, & Service Management (Status: ✅ Selesai 100%)

| Komponen / Modul | Rute / File | Status | Kemampuan Utama |
|---|---|---|---|
| **Autentikasi & Akun Demo** | `/login`<br>`src/lib/auth/auth.ts` | ✅ Selesai | Login kredensial aman (bcrypt), 4 tombol quick-login demo (Admin, Manager, Waiter, Chef), sesi JWT dengan role injection. |
| **Proteksi Proxy (RBAC)** | `src/proxy.ts`<br>`AuthGuard.tsx` | ✅ Selesai | Proteksi rute berbasis role (Admin, Manager, Waiter, Chef) sesuai standar arsitektur Next.js 16 (`proxy.ts`). |
| **Executive Service Dashboard** | `/(dashboard)/page.tsx` | ✅ Selesai | 4 KPI utama (omzet harian, tiket aktif, okupansi meja, rerata check), grafik ritme jam sibuk, menu terlaris, feed live orders (auto-refresh 15 detik). |
| **POS Terminal Kasir / Waiter** | `/(dashboard)/pos/page.tsx`<br>`src/stores/pos-store.ts` | ✅ Selesai | Filter kategori, pencarian instan, modal modifier varian menu (suhu steak, add-ons), kalkulasi subtotal, diskon & pajak (8.875%), alur bayar Tunai/Kartu/QRIS, kalkulator kembalian, cetak struk kasir. |
| **Live Orders & Dapur** | `/(dashboard)/orders/page.tsx` | ✅ Selesai | Pipeline lifecycle pesanan (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED`), panel Order Inspector detail ticket, filter status & pencarian meja. |
| **Manajemen Katalog Menu** | `/(dashboard)/menu/page.tsx` | ✅ Selesai | Tampilan katalog per kategori, estimasi waktu masak (*prep time*), biaya pokok (*food cost*), saklar instan ketersediaan stok (*In Stock* / *Sold Out*). |
| **Denah Meja (Floor Plan)** | `/(dashboard)/tables/page.tsx` | ✅ Selesai | Denah visual multi-lantai (*Main Dining Hall* & *Terrace Garden*), status meja real-time (*Available, Occupied, Reserved, Cleaning*), quick-seat ke POS. |

### Fase 2: Back-of-House (BOH) & Enterprise Operational Suite (Status: ✅ Selesai 100%)

| Komponen / Modul | Rute / File | Status | Kemampuan Utama |
|---|---|---|---|
| **Reservasi Meja** | `/(dashboard)/reservations/page.tsx` | ✅ Selesai | Manajemen daftar booking tamu, form reservasi baru (nama, telepon, jumlah pax, jam, catatan alergi), aksi 1-klik *"Seat Guest"* ke meja. |
| **Manajemen Inventaris Bahan** | `/(dashboard)/inventory/page.tsx` | ✅ Selesai | Kartu metrik nilai stok & peringatan *Low Stock*, visualisasi rasio kebugaran stok, modal restock/penyesuaian (In, Out, Waste, Audit), log riwayat mutasi stok. |
| **Manajemen Karyawan & Shift** | `/(dashboard)/staff/page.tsx` | ✅ Selesai | Pelacak absensi real-time (*Clocked In, On Break, Clocked Out*), tombol kontrol absensi 1-klik, modal penjadwalan giliran kerja mingguan (*Shift Scheduler*). |
| **Laporan Finansial & Analitik** | `/(dashboard)/reports/page.tsx` | ✅ Selesai | Analisis finansial eksekutif (Gross Sales, COGS 28.5%, Gross Margin 71.5%, Average Ticket Check), filter periode waktu, sebaran metode bayar, ekspor CSV, dan tombol cetak ringkasan P&L. |
| **Pengaturan Restoran & Sistem** | `/(dashboard)/settings/page.tsx` | ✅ Selesai | Profil cabang & kontak, tarif pajak & biaya servis, pilihan mata uang (USD, IDR, EUR, GBP, SGD), pengaturan printer struk thermal (80mm vs 58mm), teks header/footer struk, lonceng pesanan. |

---

## 🗄️ Database & Schema Architecture (Prisma)

Skema database terletak di `prisma/schema.prisma` dan telah divalidasi penuh dengan PostgreSQL 16.

### 1. Entitas & Model Relasional (22 Model & Enums):
- **Akses & Pengguna**: `User`, `Branch`, `ActivityLog`
- **Ruangan & Meja**: `Floor`, `Table`
- **Menu & Varian**: `MenuCategory`, `MenuItem`, `MenuItemModifier`, `ModifierOption`
- **Pesanan & Dapur**: `Order`, `OrderItem`, `OrderItemModifier`
- **Reservasi**: `Reservation`, `ReservationTable`
- **Pembayaran & Kasir**: `Invoice`, `Payment`
- **Inventaris & Pembelian**: `InventoryItem`, `PurchaseOrder`, `PurchaseOrderItem`, `StockMovement`
- **Sumber Daya Manusia (SDM)**: `StaffShift`, `StaffClockEntry`

### 2. Enums:
- `UserRole` (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CHEF`, `WAITER`, `HOST`, `STAFF`, `CUSTOMER`)
- `OrderStatus` (`PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`, `REFUNDED`)
- `PaymentMethod` (`CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `MOBILE_WALLET`, `OTHER`)
- `PaymentStatus` (`PENDING`, `PAID`, `PARTIALLY_PAID`, `REFUNDED`, `FAILED`)
- `ReservationStatus` (`PENDING`, `CONFIRMED`, `SEATED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`)
- `InventoryMovementType` (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`, `WASTE`, `RETURN`, `TRANSFER`)
- `PurchaseOrderStatus` (`DRAFT`, `PENDING`, `APPROVED`, `ORDERED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED`)
- `ShiftStatus` (`PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`)
- `ClockStatus` (`CLOCKED_IN`, `ON_BREAK`, `CLOCKED_OUT`)

### 3. Data Awal (Seeding - `prisma/seed.ts`):
- 1 Flagship Branch (New York Downtown, konfigurasi pajak 8.875%, USD).
- 4 Akun Staf dengan password hash bcrypt:
  - Super Admin: `admin@restaurant.com` / `Admin123!`
  - Store Manager: `manager@restaurant.com` / `Manager123!`
  - Floor Waiter: `waiter@restaurant.com` / `Staff123!`
  - Head Chef: `chef@restaurant.com` / `Chef123!`
- 2 Lantai (*Main Dining Hall* & *Terrace Garden*) dengan 9 meja terkonfigurasi koordinat & bentuk.
- 5 Kategori Menu & 8 Hidangan Lengkap dengan opsi modifier (pilihan kematangan steak, saus, add-ons).

---

## 🔌 Spesifikasi API Route Handlers (`src/app/api/`)

Seluruh endpoint dibangun menggunakan Route Handlers Next.js App Router dengan penanganan error terstandarisasi:

1. **Autentikasi**:
   - `GET / POST /api/auth/[...nextauth]` — Handler sesi & login NextAuth.
2. **Katalog Menu**:
   - `GET /api/menu/categories` — Daftar kategori menu.
   - `GET /api/menu/items` — Daftar seluruh hidangan dengan modifier.
   - `PATCH /api/menu/items/[itemId]/toggle-availability` — Saklar ketersediaan stok instan.
3. **Pesanan & Kasir**:
   - `GET /api/orders` — Daftar pesanan dengan filter status.
   - `POST /api/orders` — Pembuatan pesanan baru dari POS terminal.
   - `GET /api/orders/active` — Pesanan aktif untuk monitor dapur.
   - `GET / PATCH /api/orders/[orderId]` — Rincian pesanan & mutasi status lifecycle.
4. **Denah Meja**:
   - `GET /api/tables` — Status meja, pemetaan lantai, dan pesanan aktif di meja.
   - `PATCH /api/tables/[tableId]/status` — Update status meja (*AVAILABLE*, *OCCUPIED*, *RESERVED*, *CLEANING*).
5. **Reservasi Meja**:
   - `GET /api/reservations` — Daftar reservasi mendatang & aktif.
   - `POST /api/reservations` — Form penambahan booking baru.
   - `PATCH /api/reservations/[reservationId]/seat` — Dudukkan tamu reservasi langsung ke meja.
6. **Faktur & Pembayaran**:
   - `POST /api/billing/invoices` — Pembuatan faktur/invoice.
   - `POST /api/billing/payments` — Eksekusi pembayaran (Cash/Card/QRIS) & pencatatan transaksi.
7. **Inventaris**:
   - `GET /api/inventory` — Ringkasan stok bahan, metrik nilai, dan filter kategori.
   - `POST /api/inventory/movements` — Pencatatan transaksi mutasi stok (Restock In, Out, Waste, Audit).
8. **Staf & Absensi**:
   - `GET /api/staff` — Roster tim kerja, status kehadiran langsung (*Clock In/Out/Break*).
   - `POST /api/staff` — Aksi absensi staf 1-klik.
   - `POST /api/staff/shifts` — Penjadwalan shift kerja mingguan.
9. **Laporan & KPI**:
   - `GET /api/reports` — Metrik live dashboard, penjualan per jam, produk terlaris, dan analitik P&L.

---

## 🛡️ Service Layer & Schema Validators

- **Validators (`src/lib/data/validators/`)**:
  - `auth-schema.ts`: Validasi format login & kredensial.
  - `menu-schema.ts`: Validasi item menu & modifier.
  - `order-schema.ts`: Validasi pembuatan pesanan dan item tiket.
  - `table-schema.ts`: Validasi konfigurasi meja & koordinat denah.
  - `billing-schema.ts`: Validasi invoice & payload pembayaran.
  - `reservation-schema.ts`: Validasi nama tamu, pax, dan jadwal booking.
- **Service Modules (`src/lib/services/`)**:
  - `auth-service.ts`, `menu-service.ts`, `order-service.ts`, `table-service.ts`, `billing-service.ts`, `reservation-service.ts`, `inventory-service.ts`, `staff-service.ts`.
  - `mock-data.ts`: Dataset interaktif memory-fallback untuk ketahanan operasional saat database offline.

---

## 🧪 Rencana & Hasil Verifikasi (Quality Assurance)

### 1. Validasi Kompilasi & Build Produksi
- **Perintah**: `npm run build`
- **Hasil**: **LULUS (Exit Code 0)**.
- **Output**: 27 rute statis & dinamis terkompilasi sempurna dengan Turbopack & TypeScript check tanpa error.

### 2. Validasi Integritas Skema Database
- **Perintah**: `npx prisma validate`
- **Hasil**: **LULUS (Exit Code 0)**.
- **Output**: Skema `prisma/schema.prisma` memenuhi seluruh relasi relasional PostgreSQL.

### 3. Verifikasi Alur Fungsional Pengguna
- **Login Demo**: Berhasil masuk langsung menggunakan 4 profil demo (Admin, Manager, Waiter, Chef).
- **Alur POS Terminal**: Pemilihan nomor meja ➔ tambah item dengan modifier ➔ kalkulasi diskon & pajak otomatis ➔ pembayaran tunai dengan kembalian ➔ cetak invoice & struk digital.
- **Lifecycle Dapur**: Pesanan masuk dari POS ➔ muncul di tiket live order ➔ transisi status bertahap hingga selesai (*Completed*).
- **Operasional BOH**: Reservasi tamu, restock bahan baku, dan absensi staf berfungsi secara interaktif dengan auto-refresh data.
