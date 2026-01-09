# YapPerce Frontend

Frontend aplikasi e-commerce YapPerce Marketplace yang dibangun dengan Next.js dan React.

## Fitur

- 🔐 Autentikasi (Login/Register)
- 🛍️ Browse produk dengan kategori
- 🛒 Shopping cart
- 💳 Checkout dan pembayaran
- 📦 Tracking pesanan
- 🎨 UI modern dengan Tailwind CSS

## Teknologi

- **Next.js 14** - React framework
- **Apollo Client** - GraphQL client
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications

## Setup Development

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka [http://localhost:3000](http://localhost:3000)

## Environment Variables

Buat file `.env.local` dengan konfigurasi berikut:

```env
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:4010/graphql
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:4011/graphql
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:4012/graphql
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:4013/graphql
```

## Build untuk Production

```bash
npm run build
npm start
```

## Struktur Proyek

```
frontend/
├── components/       # Komponen React
├── lib/            # Utilities (Apollo Client, dll)
├── pages/          # Halaman Next.js
├── store/          # State management (Zustand)
├── styles/         # Global styles
└── public/         # Static files
```

## Halaman

- `/` - Homepage dengan daftar produk
- `/products/[id]` - Detail produk
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/login` - Login
- `/register` - Register
- `/orders` - Daftar pesanan
- `/orders/[id]` - Detail pesanan

