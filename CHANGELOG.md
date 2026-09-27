# Changelog & Status Perkembangan Proyek "Le Majestic POS"

Dokumen ini merangkum seluruh perkembangan (*progress*), fitur yang telah selesai dibangun, struktur data, arsitektur teknis, serta *roadmap* tugas sistem. Anda tidak perlu membongkar atau membaca ulang seluruh struktur proyek untuk mengetahui status sistem saat ini.

---

## 📌 Ringkasan Eksekutif & Identitas Proyek

- **Nama Aplikasi**: Le Majestic Restaurant Management & POS Terminal
- **Tipe Proyek**: Web Application (Next.js 16 App Router + React 19 + TypeScript)
- **Styling**: Tailwind CSS v4 + Lucide Icons + Glassmorphism Dark Theme
- **State Management**: Zustand (Keranjang belanja & POS state) + TanStack React Query v5 (Data fetching, caching, auto-refetch)
- **Database & ORM**: PostgreSQL 16 + Prisma ORM 6.4.1 (Docker ready)
- **Autentikasi**: NextAuth.js v5 (JWT Strategy, Credentials Provider, Role-Based Access Control)
- **Arsitektur Data**: Hybrid Dual-Mode (Database PostgreSQL aktif dengan otomatis *fallback* ke in-memory mock data jika database offline, sehingga aplikasi selalu bisa diuji dan dijalankan tanpa konfigurasi rumit).

---

## 🚀 Status Implementasi Fitur (Progress Tracker)

| Modul | Rute / Halaman | Status | Keterangan & Kemampuan |
|---|---|---|---|
| **Autentikasi & Otorisasi** | `/login` | ✅ **Selesai (100%)** | Login credential, 4 tombol *quick demo login* (Admin, Manager, Waiter, Chef), sesi NextAuth, proteksi via `AuthGuard`. |
| **Dashboard Servis & Eksekutif** | `/` | ✅ **Selesai (100%)** | KPI Live (Omzet hari ini, tiket dapur aktif, okupansi meja %, rata-rata check), heatmap penjualan per jam, produk terlaris, daftar order terkini (auto-refresh 15 detik). |
| **POS Terminal Kasir / Waiter** | `/pos` | ✅ **Selesai (100%)** | Pencarian & filter kategori menu, modal pilihan varian/modifier (suhu daging steak, topping, dll.), kalkulasi subtotal, diskon & pajak (8.875%), pemilihan jenis pesanan (Dine-in, Takeaway, Delivery), modal pemetaan meja, pembayaran (Cash/Card/QRIS) dengan kalkulator kembalian instan, cetak struk/receipt. |
| **Live Orders & Dapur** | `/orders` | ✅ **Selesai (100%)** | Papan kendali pesanan, status lifecycle (`PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED`), filter status, pencarian nomor meja/order, rincian modifier tiap item, mutasi status 1-klik. |
| **Denah Meja & Ruangan** | `/tables` | ✅ **Selesai (100%)** | Denah interaktif multi-lantai (*Main Dining Hall* & *Terrace Garden*), indikator status meja (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`), quick action dudukkan tamu langsung buka POS terminal, update status meja instan. |
| **Reservasi Meja** | `/reservations` | ✅ **Selesai (100%)** | Daftar reservasi aktif & mendatang, form tambah booking (nama, kontak, jumlah tamu, tanggal, jam, catatan alergi/preferensi), fitur *"Seat Guest"* untuk langsung menempatkan tamu ke meja terkait. |
| **Katalog Menu** | `/menu` | ✅ **Selesai (100%)** | Tampilan menu per kategori, tombol saklar cepat ketersediaan stok (*In Stock* / *Sold Out*), informasi harga jual vs *cost*, estimasi waktu masak (*prep time*), penanda menu populer. |
| **Manajemen Inventaris** | `/inventory` | ✅ **Selesai (100%)** | Manajemen stok bahan baku, indikator ambang batas minimum (*Low Stock Alert*), modal restock & penyesuaian (In, Out, Waste, Audit), log riwayat mutasi stok (*Movement Audit Log*). |
| **Manajemen Karyawan & Shift** | `/staff` | ✅ **Selesai (100%)** | Roster tim kerja, pelacak absensi langsung (*Clocked In*, *On Break*, *Clocked Out*), tombol kontrol absensi 1-klik, modal penjadwalan giliran kerja mingguan (*Shift Scheduler*). |
| **Laporan Mendalam & Analitik** | `/reports` | ✅ **Selesai (100%)** | Analisis finansial eksekutif (Gross Revenue, COGS 28.5%, Gross Margin 71.5%, Average Ticket Check), filter periode (Hari ini, Minggu ini, Bulan ini), sebaran metode pembayaran (Kartu, Tunai, QRIS), ekspor laporan CSV & tombol cetak ringkasan P&L. |
| **Pengaturan Restoran & Sistem** | `/settings` | ✅ **Selesai (100%)** | Profil cabang restoran, konfigurasi tarif pajak & biaya servis, pilihan mata uang, pengaturan printer kasir thermal (80mm vs 58mm), teks header/footer struk, dan saklar notifikasi lonceng pesanan. |
| **Database & Seeding** | `prisma/` | ✅ **Selesai (100%)** | Skema Prisma lengkap (16 entitas), file `docker-compose.yml` untuk PostgreSQL lokal, file `seed.ts` berisi data awal cabang restoran NYC, akun pengguna ber-hash bcrypt, denah meja, dan katalog menu lengkap. |

---

## 🛠️ Log Perubahan Rinci (Release History)

### [Versi 0.2.0] - Back-of-House (BOH) & Enterprise Management Suite

#### 📦 1. Modul Manajemen Inventaris Bahan Baku (`/inventory`)
- Dibangun di `src/app/(dashboard)/inventory/page.tsx` bersama layanan backend `src/lib/services/inventory-service.ts`.
- **4 Kartu Metrik Inventaris**: Total Nilai Stok, Peringatan *Low Stock*, Stok Kosong (*Out of Stock*), dan Rasio Kebugaran Stok Bahan.
- **Penyaringan & Pencarian**: Filter cepat per kategori (*Meat, Seafood, Dairy, Produce, Dry Goods, Beverage*) dan pencarian nama bahan atau SKU.
- **Batang Progres Stok**: Visualisasi persentase sisa stok terhadap batas aman pemesanan ulang (*reorder point*).
- **Modal Restock & Penyesuaian Stok**:
  - Pilihan tipe mutasi: *Restock In*, *Requisition Out*, *Spoilage / Waste*, atau *Physical Audit Count*.
  - Input jumlah, alasan/nomor PO pemasok, dan personel yang bertugas.
- **Log Riwayat Mutasi Stok**: Drawer modal interaktif untuk mengaudit transaksi barang masuk, keluar, dan bahan terbuang.

#### 👥 2. Modul Manajemen Karyawan & Jadwal Shift (`/staff`)
- Dibangun di `src/app/(dashboard)/staff/page.tsx` bersama layanan `src/lib/services/staff-service.ts`.
- **Pelacak Kehadiran Langsung (*Live Attendance*)**:
  - Menampilkan staf yang sedang bertugas (*Clocked In*), sedang istirahat (*On Break*), atau libur/belum masuk (*Off Duty*).
  - Waktu masuk, total jam kerja hari ini, dan penugasan area kerja.
  - Aksi 1-klik: *Clock In*, *Start Break*, dan *Clock Out* dengan notifikasi instan.
- **Penjadwalan Shift Mingguan**:
  - Tampilan tabel jadwal kerja terencana.
  - Modal tambah shift baru (pilih staf, tanggal, jam mulai, jam selesai, catatan tugas).

#### 📈 3. Modul Laporan Finansial & Analitik Lanjutan (`/reports`)
- Dibangun di `src/app/(dashboard)/reports/page.tsx`.
- **Filter Periode Dinamis**: Hari ini (*Today's Service*), Minggu ini (*This Week*), dan Bulan ini (*M-T-D*).
- **4 Metrik Finansial Utama**:
  - Gross Sales Revenue (dengan perbandingan tren pertumbuhan).
  - Cost of Goods Sold / COGS (analisis biaya bahan baku terhadap omzet).
  - Gross Operating Margin (keuntungan kotor dapur).
  - Rata-rata Nilai Check per Meja.
- **Distribusi Penjualan per Kategori Menu**: Grafik proporsi omzet dari hidangan utama, minuman anggur & koktail, pizza & pasta, starter, dan dessert.
- **Analisis Kanal Pembayaran**: Pembagian persentase transaksi Kartu Kredit (64%), Tunai (24%), dan QRIS/Dompet Digital (12%).
- **Ekspor & Cetak**: Fitur unduh laporan ke format file `.csv` dan tombol cetak ringkasan laporan keuangan via dialog print browser.

#### ⚙️ 4. Modul Pengaturan Restoran & Sistem POS (`/settings`)
- Dibangun di `src/app/(dashboard)/settings/page.tsx`.
- **Profil Cabang & Bisnis**: Nama cabang, kode outlet, alamat fisik lengkap, telepon, dan kontak email.
- **Aturan Keuangan & Pajak**: Konfigurasi tarif pajak penjualan (default 8.875%), biaya servis (*service charge*), dan pemilihan mata uang operasional (USD, EUR, IDR, GBP, SGD).
- **Hardware & Struk Kasir Thermal**: Pilihan lebar kertas printer (80mm standar atau 58mm kompak), teks header & footer struk, serta saklar cetak otomatis saat pembayaran selesai.
- **Pemberitahuan & Audio**: Pengaturan suara lonceng tiket dapur (*kitchen ticket chime*) dan indikator peringatan stok menipis.

---

### [Versi 0.1.0] - Implementasi Inti POS & Manajemen Restoran

#### 🌟 1. Sistem Autentikasi & Akun Demo
- Mengintegrasikan **NextAuth v5** dengan penyedia *Credentials*.
- Membuat halaman login modern dengan glassmorphism dark theme di `src/app/(auth)/login/page.tsx`.
- Menyediakan 4 akun demo instan siap klik:
  - **Super Admin**: `admin@restaurant.com` / `Admin123!`
  - **Store Manager**: `manager@restaurant.com` / `Manager123!`
  - **Floor Waiter**: `waiter@restaurant.com` / `Staff123!`
  - **Head Chef**: `chef@restaurant.com` / `Chef123!`
- Menambahkan komponen `AuthGuard` di `src/components/layout/AuthGuard.tsx` untuk menjaga rute privat dan mengarahkan pengguna tanpa autentikasi ke halaman login.

#### 🛒 2. POS (Point of Sale) Terminal
- Dibuat di `src/app/(dashboard)/pos/page.tsx` dengan integrasi `src/stores/pos-store.ts` (Zustand).
- **Katalog Produk Cepat**: Menampilkan grid produk dengan foto, estimasi waktu masak, dan lencana ketersediaan.
- **Kustomisasi & Modifier**: Dialog interaktif untuk memilih varian (contoh: *Rare*, *Medium Rare*, *Well Done* untuk steak, serta tambahan *Truffle Butter* atau *Grilled Prawns*).
- **Keranjang Belanja Real-Time**:
  - Penambahan, pengurangan, dan penghapusan item.
  - Perhitungan subtotal, pajak restoran (8.875%), dan diskon persentase.
  - Pilihan tipe pesanan: *Dine In*, *Takeaway*, atau *Delivery*.
  - Modal penetapan nomor meja dan jumlah tamu (*guest count*).
- **Proses Checkout & Pembayaran**:
  - Pilihan metode: Tunai (*Cash*), Kartu Kredit/Debit (*Credit Card*), atau Pembayaran Digital (*UPI / QRIS*).
  - Kalkulator instan uang diterima dan kembalian.
  - Pembuatan nomor pesanan dan faktur (*Invoice*).
  - Tampilan struk digital siap cetak dengan rincian biaya.

#### 📊 3. Dashboard Ringkasan & Operasional Servis
- Dibuat di `src/app/(dashboard)/page.tsx`.
- 4 Kartu KPI Utama:
  - **Today's Revenue** (+ indikator pertumbuhan mingguan).
  - **Active Kitchen Orders** (dengan indikator status langsung).
  - **Table Occupancy Rate** (rasio meja terpakai vs total kapasitas).
  - **Average Ticket Value** (rata-rata nilai per transaksi).
- **Bagan Penjualan per Jam**: Representasi visual ritme jam sibuk makan siang dan makan malam.
- **Peringkat Menu Favorit**: Daftar item terlaris beserta jumlah porsi terjual dan total omzet yang dihasilkan.
- **Tabel Live Orders**: Ringkasan pesanan aktif dengan kode status warna.

#### 🍳 4. Kitchen & Live Order Tracker
- Dibuat di `src/app/(dashboard)/orders/page.tsx`.
- Pipeline transisi status pesanan:
  - `PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED`.
- Filter pesanan berdasarkan status dan pencarian berdasarkan nomor tiket atau nomor meja.
- Tombol aksi instan untuk staf dapur/pelayan guna memajukan status pesanan dalam satu klik.
- Modal rincian pesanan mendalam yang menampilkan varian menu dan catatan pesanan pelanggan.

#### 🪑 5. Manajemen Denah Meja & Ruangan (Floor Plan)
- Dibuat di `src/app/(dashboard)/tables/page.tsx`.
- Mendukung pemisahan area (lantai dasar *Main Dining Hall* dan area *Terrace Garden*).
- Representasi visual meja berbentuk persegi (*square*), lingkaran (*circle*), dan persegi panjang (*rectangle*).
- Indikasi status meja:
  - 🟢 **Available**: Meja kosong, klik untuk langsung diarahkan ke POS terminal dengan meja terpilih.
  - 🔴 **Occupied**: Meja sedang terisi tamu dan memiliki pesanan berjalan beserta total tagihan berjalan.
  - 🟡 **Reserved**: Meja telah dibooking oleh tamu reservasi.
  - ⚪ **Cleaning**: Meja sedang dibersihkan untuk sesi berikutnya.
- Fitur ubah status meja langsung dari antarmuka staf.

#### 📅 6. Manajemen Reservasi Meja
- Dibuat di `src/app/(dashboard)/reservations/page.tsx`.
- Daftar pemesanan meja dengan filter status (*All, Pending, Confirmed, Seated, Cancelled*).
- Modal formulir reservasi baru:
  - Nama tamu, nomor telepon, email, jumlah pax.
  - Pemilihan tanggal, jam kedatangan, dan perkiraan durasi makan.
  - Permintaan khusus (*Special Requests*) seperti perayaan ulang tahun atau alergi makanan.
- Aksi *"Seat Guest"*: Memindahkan tamu langsung ke meja dan mengubah status reservasi menjadi `SEATED`.

#### 📖 7. Katalog & Kontrol Menu
- Dibuat di `src/app/(dashboard)/menu/page.tsx`.
- Filter menu berdasarkan kategori (*Starters, Steaks & Mains, Pizza & Pasta, Desserts, Cocktails & Wines*).
- Saklar cepat status ketersediaan item (*Toggle Availability*) secara langsung via endpoint PATCH API.
- Tampilan harga jual, biaya pokok produksi (*food cost*), estimasi waktu penyiapan makanan, dan penanda item populer.

#### 🗄️ 8. Arsitektur Data, Database & API
- **Prisma Schema (`prisma/schema.prisma`)**:
  - Model entitas: `User`, `Branch`, `Floor`, `Table`, `MenuCategory`, `MenuItem`, `MenuItemModifier`, `ModifierOption`, `Order`, `OrderItem`, `OrderItemModifier`, `Reservation`, `ReservationTable`, `Invoice`, `Payment`, `InventoryItem`, `PurchaseOrder`, `PurchaseOrderItem`, `StockMovement`, `StaffShift`, `StaffClockEntry`, `ActivityLog`.
- **Database Seed (`prisma/seed.ts`)**:
  - Otomatisasi data awal restoran lengkap (1 cabang, 4 user terenkripsi, 2 lantai, 9 meja terkonfigurasi posisi, 5 kategori menu, dan 8 menu masakan premium lengkap dengan opsi modifier).
- **Layer API RESTful (`src/app/api/`)**:
  - `/api/auth/[...nextauth]`
  - `/api/menu/categories` & `/api/menu/items` & `/api/menu/items/[itemId]/toggle-availability`
  - `/api/orders`, `/api/orders/active`, & `/api/orders/[orderId]`
  - `/api/tables` & `/api/tables/[tableId]/status`
  - `/api/reservations`, `/api/reservations/[reservationId]`, & `/api/reservations/[reservationId]/seat`
  - `/api/billing/invoices` & `/api/billing/payments`
  - `/api/reports`
- **Fallback In-Memory Service**:
  - Jika database PostgreSQL belum tersambung, layanan di `src/lib/services/` secara otomatis beralih menggunakan dataset mock interaktif di memori (`mock-data.ts`), sehingga seluruh alur POS, reservasi, dan pesanan tetap dapat berjalan lancar saat pengembangan atau demo.
