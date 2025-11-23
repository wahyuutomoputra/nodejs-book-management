# Book Management API

Sistem e-commerce buku dengan authentication, authorization, dan manajemen inventory menggunakan Express.js, MySQL, dan Sequelize.

## Fitur Utama

- ✅ Authentication & Authorization (JWT, Single Device)
- ✅ Role-based Access Control (Customer & Admin)
- ✅ Manajemen Buku & Stock
- ✅ Keranjang Belanja
- ✅ Checkout & Payment
- ✅ Laporan Penjualan
- ✅ Swagger API Documentation
- ✅ Database Migrations Otomatis

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` dan isi konfigurasi:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vlink_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
PORT=3000
```

### 3. Jalankan Server
```bash
npm start
# atau
npm run dev
```

Server akan otomatis menjalankan migrasi database saat pertama kali start.

### 4. Akses Swagger Documentation
```
http://localhost:3000/api-docs
```

### 5. Default Users
Seeder akan otomatis membuat user default saat server pertama kali start:

**Admin:**
- Email: `admin@example.com`
- Password: `password123`

**Customer:**
- Email: `customer@example.com`
- Password: `password123`

> **Note:** Gunakan credentials ini untuk testing. Disarankan untuk mengubah password setelah login pertama kali.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Profile user

### Customer
- `GET /api/books` - List buku ready stock
- `GET /api/books/:id` - Detail buku
- `GET /api/cart` - Keranjang
- `POST /api/cart` - Tambah ke keranjang
- `DELETE /api/cart/:id` - Hapus dari keranjang
- `POST /api/orders/checkout` - Checkout
- `GET /api/orders` - List orders
- `POST /api/payments/callback` - Payment callback

### Admin
- `GET /api/admin/books` - List semua buku
- `POST /api/admin/books` - Tambah buku
- `PUT /api/admin/books/:id` - Update buku
- `PUT /api/admin/books/:id/stock` - Update stock
- `DELETE /api/admin/books/:id` - Hapus buku
- `GET /api/admin/transactions` - List transaksi
- `GET /api/admin/reports/sales` - Laporan penjualan

## Struktur Project

```
vlink/
├── config/          # Database & Swagger config
├── controllers/     # Business logic
│   └── admin/      # Admin controllers
├── helpers/         # Response helper
├── middleware/      # Auth middleware
├── migrations/      # Database migrations
├── models/         # Sequelize models
└── routes/          # API routes
```

## Response Format

Semua response menggunakan format seragam:
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

## Authentication

Gunakan Bearer Token di header:
```
Authorization: Bearer <your_token>
```

## License

ISC

