 # YapPerce Marketplace - Microservices Architecture

Sistem marketplace berbasis microservices yang terintegrasi dengan sistem logistik ShipXpress.

## Arsitektur Sistem

Sistem ini terdiri dari 4 layanan utama dan 1 frontend:

1. **User Service** (Port 4010): Mengelola pendaftaran pengguna, autentikasi, dan pengelolaan data pengguna
2. **Product Service** (Port 4011): Mengelola katalog produk, kategori, dan stok
3. **Order Service** (Port 4012): Mengelola pemesanan, status pesanan, dan integrasi dengan ShipXpress
4. **Payment Service** (Port 4013): Mengelola proses pembayaran dan status pembayaran
5. **Frontend** (Port 3000): Aplikasi web Next.js untuk user interface

## Teknologi yang Digunakan

**Backend Services:**
- **Node.js** dengan Express
- **Apollo Server** untuk GraphQL
- **MySQL** untuk database
- **Docker** dan **Docker Compose** untuk containerization
- **JWT** untuk autentikasi

**Frontend:**
- **Next.js 14** dengan React
- **Apollo Client** untuk GraphQL
- **Tailwind CSS** untuk styling
- **Zustand** untuk state management

## Prasyarat

- Docker dan Docker Compose terinstall
- Node.js 18+ (untuk development lokal)

## Cara Menjalankan Sistem

### Menggunakan Docker Compose (Recommended)

1. Clone repository ini
2. Pastikan Docker dan Docker Compose sudah terinstall
3. Jalankan perintah berikut:

```bash
docker-compose up --build
```

Sistem akan otomatis:
- Membuat dan menjalankan semua container
- Menginisialisasi database dengan tabel-tabel yang diperlukan

4. Setelah semua container berjalan, jalankan seeders untuk mengisi data awal:

**Linux/Mac:**
```bash
chmod +x scripts/seed-all.sh
./scripts/seed-all.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\seed-all.ps1
```

**Atau manual untuk setiap service:**
```bash
docker-compose exec user-service npm run seed
docker-compose exec product-service npm run seed
docker-compose exec order-service npm run seed
docker-compose exec payment-service npm run seed
```

### Mengakses Layanan

Setelah sistem berjalan, Anda dapat mengakses:

- **Frontend Web App**: http://localhost:3000
- **User Service GraphQL**: http://localhost:4010/graphql
- **Product Service GraphQL**: http://localhost:4011/graphql
- **Order Service GraphQL**: http://localhost:4012/graphql
- **Payment Service GraphQL**: http://localhost:4013/graphql
- **ShipXpress Mock GraphQL**: http://localhost:4014/graphql

### Database Ports

- User DB: localhost:3307
- Product DB: localhost:3311
- Order DB: localhost:3309
- Payment DB: localhost:3310

## Struktur Proyek

```
YapPerce_Marketplace/
├── frontend/              # Next.js frontend application
├── services/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── shipxpress-mock/
├── scripts/              # Seed scripts
├── docker-compose.yml
└── README.md
```

## Alur Sistem Marketplace

1. **Registrasi/Login**: Pengguna mendaftar dan login melalui User Service
2. **Pencarian Produk**: Pengguna mencari produk melalui Product Service
3. **Pembuatan Pesanan**: Order Service memproses pesanan
4. **Pembayaran**: Payment Service memproses pembayaran
5. **Pengiriman**: Setelah pembayaran berhasil, Order Service mengirim data ke ShipXpress
6. **Tracking**: ShipXpress memberikan update status pengiriman ke Order Service

## Dokumentasi

- **README.md** (file ini) - Setup dan konfigurasi sistem
- **QUICKSTART.md** - Panduan cepat untuk memulai
- **GRAPHQL_API.md** - Dokumentasi lengkap semua endpoint GraphQL
- **INTEGRATION.md** - Dokumentasi integrasi dengan ShipXpress

Setiap layanan juga memiliki dokumentasi GraphQL yang dapat diakses melalui GraphQL Playground di endpoint masing-masing.

**Untuk memulai dengan cepat, lihat [QUICKSTART.md](QUICKSTART.md)**

### User Service

**Queries:**
- `users`: Mendapatkan daftar semua pengguna
- `user(id: ID!)`: Mendapatkan detail pengguna berdasarkan ID
- `login(email: String!, password: String!)`: Login pengguna

**Mutations:**
- `registerUser(input: RegisterInput!)`: Mendaftarkan pengguna baru
- `updateUser(id: ID!, input: UpdateUserInput!)`: Memperbarui data pengguna

### Product Service

**Queries:**
- `products`: Mendapatkan daftar semua produk
- `product(id: ID!)`: Mendapatkan detail produk
- `productsByCategory(categoryId: ID!)`: Mendapatkan produk berdasarkan kategori
- `categories`: Mendapatkan daftar kategori

**Mutations:**
- `createProduct(input: ProductInput!)`: Membuat produk baru
- `updateProduct(id: ID!, input: ProductInput!)`: Memperbarui produk
- `updateStock(id: ID!, stock: Int!)`: Memperbarui stok produk

### Order Service

**Queries:**
- `orders`: Mendapatkan daftar semua pesanan
- `order(id: ID!)`: Mendapatkan detail pesanan
- `ordersByUser(userId: ID!)`: Mendapatkan pesanan berdasarkan user

**Mutations:**
- `createOrder(input: OrderInput!)`: Membuat pesanan baru
- `updateOrderStatus(id: ID!, status: String!)`: Memperbarui status pesanan
- `updateShipmentStatus(id: ID!, shipmentStatus: String!)`: Memperbarui status pengiriman

### Payment Service

**Queries:**
- `payments`: Mendapatkan daftar semua pembayaran
- `payment(id: ID!)`: Mendapatkan detail pembayaran
- `paymentsByOrder(orderId: ID!)`: Mendapatkan pembayaran berdasarkan pesanan

**Mutations:**
- `createPayment(input: PaymentInput!)`: Membuat pembayaran baru
- `updatePaymentStatus(id: ID!, status: String!)`: Memperbarui status pembayaran

## Integrasi dengan ShipXpress

Order Service terintegrasi dengan ShipXpress melalui GraphQL:

1. **Mengirim Pesanan**: Order Service mengirim data pesanan ke ShipXpress setelah pembayaran berhasil
2. **Menerima Update**: ShipXpress mengirim update status pengiriman ke Order Service

Endpoint ShipXpress: `http://shipxpress:4014/graphql` (internal) atau `http://localhost:4014/graphql` (external)

## Testing

Untuk menjalankan seeders dan mengisi data awal:

```bash
# Seeders akan otomatis berjalan saat container pertama kali dibuat
# Atau jalankan secara manual:
docker-compose exec user-service npm run seed
docker-compose exec product-service npm run seed
docker-compose exec order-service npm run seed
docker-compose exec payment-service npm run seed
```

## Development

Untuk development lokal tanpa Docker:

1. Install dependencies di setiap service:
```bash
cd services/user-service && npm install
cd services/product-service && npm install
# ... dan seterusnya
```

2. Setup database secara manual menggunakan SQL scripts di folder `db/` setiap service

3. Jalankan setiap service:
```bash
cd services/user-service && npm start
cd services/product-service && npm start
# ... dan seterusnya
```

## Catatan Penting

- Pastikan semua environment variables sudah dikonfigurasi dengan benar
- JWT_SECRET harus diganti dengan secret key yang aman di production
- Database passwords harus diganti di production
- ShipXpress URL harus disesuaikan dengan endpoint yang disediakan oleh kelompok lain

## Kontributor

- Tim YapPerce Marketplace

