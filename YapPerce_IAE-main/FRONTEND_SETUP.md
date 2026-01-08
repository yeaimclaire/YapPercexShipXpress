# Frontend Setup Guide

## Overview

Frontend YapPerce Marketplace telah dibuat menggunakan Next.js 14 dengan fitur lengkap untuk e-commerce.

## Fitur yang Tersedia

### ✅ Autentikasi
- Login dengan email dan password
- Register akun baru
- Session management dengan JWT token
- Protected routes

### ✅ Produk
- Browse semua produk
- Filter berdasarkan kategori
- Search produk
- Detail produk
- Stock management

### ✅ Shopping Cart
- Add to cart
- Update quantity
- Remove items
- Cart persistence

### ✅ Checkout & Payment
- Checkout process
- Payment processing
- Automatic order creation
- Integration dengan payment service

### ✅ Order Management
- View all orders
- Order details
- Order status tracking
- Shipment status

## Struktur File

```
frontend/
├── components/          # Komponen reusable
│   ├── Layout.js       # Layout utama dengan navbar
│   └── ProductCard.js  # Card untuk produk
├── lib/                # Utilities
│   └── apollo-client.js # Apollo Client setup untuk semua services
├── pages/              # Next.js pages
│   ├── _app.js         # App wrapper
│   ├── index.js        # Homepage
│   ├── login.js        # Login page
│   ├── register.js     # Register page
│   ├── cart.js         # Shopping cart
│   ├── checkout.js     # Checkout page
│   ├── orders.js       # Orders list
│   ├── orders/[id].js  # Order detail
│   └── products/[id].js # Product detail
├── store/              # Zustand stores
│   ├── authStore.js    # Authentication state
│   └── cartStore.js    # Cart state
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS
└── public/             # Static files
```

## Cara Menjalankan

### Development Mode

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser di http://localhost:3000

### Production Mode (Docker)

Frontend sudah dikonfigurasi di `docker-compose.yml`. Untuk menjalankan:

```bash
docker-compose up --build
```

Frontend akan tersedia di http://localhost:3000

## Environment Variables

Frontend menggunakan environment variables berikut (sudah dikonfigurasi di docker-compose.yml):

- `NEXT_PUBLIC_USER_SERVICE_URL` - User Service GraphQL endpoint
- `NEXT_PUBLIC_PRODUCT_SERVICE_URL` - Product Service GraphQL endpoint
- `NEXT_PUBLIC_ORDER_SERVICE_URL` - Order Service GraphQL endpoint
- `NEXT_PUBLIC_PAYMENT_SERVICE_URL` - Payment Service GraphQL endpoint

## Testing Flow

1. **Register/Login**: Buat akun baru atau login dengan akun yang sudah ada
2. **Browse Products**: Lihat produk di homepage, filter by category, atau search
3. **Add to Cart**: Klik "Add to Cart" pada produk
4. **View Cart**: Klik icon cart di navbar
5. **Checkout**: Klik "Proceed to Checkout" dan complete order
6. **View Orders**: Lihat daftar pesanan di "My Orders"
7. **Order Details**: Klik order untuk melihat detail dan tracking

## Catatan Penting

1. **Pastikan semua services berjalan** sebelum menggunakan frontend
2. **Jalankan seeders** untuk memiliki data produk dan user untuk testing
3. **Frontend menggunakan localhost** untuk mengakses services (karena browser client-side)
4. **Token disimpan di cookies** dan otomatis dikirim ke semua GraphQL requests

## Troubleshooting

### Services tidak bisa diakses
- Pastikan semua services sudah running: `docker-compose ps`
- Check service health: `./scripts/check-services.sh`

### CORS errors
- Pastikan services mengizinkan request dari localhost:3000
- Check GraphQL endpoint URLs di environment variables

### Build errors
- Pastikan Node.js version 18+
- Hapus node_modules dan install ulang: `rm -rf node_modules && npm install`

