# Dokumentasi Sistem Terintegrasi: YapPerce Marketplace & ShipXpress

## Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Struktur Repository](#struktur-repository)
3. [Project A: YapPerce Marketplace](#project-a-yapperce-marketplace)
4. [Project B: ShipXpress](#project-b-shipxpress)
5. [Integrasi: Bagaimana YapPerce dan ShipXpress Bekerja Bersama](#integrasi-bagaimana-yapperce-dan-shipxpress-bekerja-bersama)
6. [Variabel Environment & Konfigurasi](#variabel-environment--konfigurasi)
7. [Cara Menjalankan (Development Lokal)](#cara-menjalankan-development-lokal)
8. [Cara Menjalankan Demo](#cara-menjalankan-demo)
9. [Dokumentasi API / Kontrak](#dokumentasi-api--kontrak)
10. [Troubleshooting & Error Umum](#troubleshooting--error-umum)
11. [Kualitas & Maintenance](#kualitas--maintenance)

---

## Ringkasan Eksekutif

### Overview Sistem

Sistem ini terdiri dari **dua proyek utama** yang terintegrasi:

- **Project A: YapPerce Marketplace** - Platform e-commerce berbasis microservices untuk penjualan produk
- **Project B: ShipXpress** - Sistem logistik berbasis microservices untuk manajemen pengiriman barang

Kedua sistem bekerja bersama untuk menyediakan solusi e-commerce lengkap dengan integrasi logistik real-time.

### Tujuan Sistem

Sistem ini dirancang untuk:
- Menyediakan platform marketplace yang dapat menangani penjualan produk
- Mengintegrasikan proses pengiriman barang secara otomatis setelah pembayaran berhasil
- Memberikan tracking real-time untuk status pengiriman
- Menyediakan arsitektur microservices yang scalable dan maintainable

### Target Pengguna

- **Pengguna Marketplace (YapPerce)**: Pembeli yang ingin membeli produk dan melacak pengiriman
- **Admin Marketplace**: Mengelola produk, pesanan, dan pembayaran
- **Admin Logistik (ShipXpress)**: Mengelola customer, kendaraan, driver, shipment, dan tracking

### Use Case Utama

1. **Alur Pembelian Produk**:
   - User mendaftar/login di YapPerce
   - User memilih produk dan membuat pesanan
   - User melakukan pembayaran
   - Sistem otomatis mengirim pesanan ke ShipXpress
   - User dapat melacak status pengiriman

2. **Alur Manajemen Logistik**:
   - Admin ShipXpress mengelola customer, kendaraan, dan driver
   - Sistem membuat shipment otomatis dari pesanan marketplace
   - Admin dapat mengupdate status pengiriman
   - Status update dikirim kembali ke marketplace melalui webhook

### Diagram Arsitektur Sistem

```mermaid
graph TB
    subgraph "YapPerce Marketplace"
        FE1[Frontend Next.js<br/>Port 5000]
        US[User Service<br/>Port 4010]
        PS[Product Service<br/>Port 4011]
        OS[Order Service<br/>Port 4012]
        PAY[Payment Service<br/>Port 4013]
        SM[ShipXpress Mock<br/>Port 4014]
    end
    
    subgraph "ShipXpress"
        FE2[Frontend React<br/>Port 3000]
        GW[GraphQL Gateway<br/>Port 4000]
        AS[Auth Service<br/>Port 4006]
        CS[Customer Service<br/>Port 4001]
        VS[Vehicle Service<br/>Port 4002]
        DS[Driver Service<br/>Port 4003]
        SS[Shipment Service<br/>Port 4004]
        TS[Tracking Service<br/>Port 4005]
    end
    
    FE1 --> US
    FE1 --> PS
    FE1 --> OS
    FE1 --> PAY
    
    OS -->|GraphQL| GW
    OS -->|Webhook| OS
    
    PAY --> OS
    OS -->|createShipment| SS
    
    SS -->|Webhook POST| OS
    
    FE2 --> GW
    GW --> AS
    GW --> CS
    GW --> VS
    GW --> DS
    GW --> SS
    GW --> TS
```

---

## Struktur Repository

Repository ini adalah **monorepo** yang berisi dua proyek terpisah dalam folder berbeda. Setiap proyek memiliki struktur microservices-nya sendiri.

### Struktur Root

```
Final/
├── YapPerce_IAE-main/              # Project A: YapPerce Marketplace
│   ├── frontend/                   # Next.js frontend application
│   ├── services/                   # Microservices backend
│   │   ├── user-service/
│   │   ├── product-service/
│   │   ├── order-service/
│   │   ├── payment-service/
│   │   └── shipxpress-mock/
│   ├── scripts/                    # Seed scripts
│   ├── docker-compose.yml
│   ├── README.md
│   ├── INTEGRATION.md
│   ├── GRAPHQL_API.md
│   └── QUICKSTART.md
│
└── TUGASBESAR_IAE_SHIPMEN_KELOMPOK2_SI4708-main/  # Project B: ShipXpress
    ├── frontend/                   # React + Vite frontend
    ├── gateway/                     # GraphQL Gateway (Apollo Federation)
    ├── services/                    # Microservices backend
    │   ├── auth-service/
    │   ├── customer-service/
    │   ├── vehicle-service/
    │   ├── driver-service/
    │   ├── shipment-service/
    │   └── tracking-service/
    ├── database/                    # Database initialization scripts
    ├── docker-compose.yml
    └── README.md
```

### Anotasi Folder Penting

#### YapPerce Marketplace (`YapPerce_IAE-main/`)

- **`frontend/`**: Aplikasi Next.js untuk UI marketplace
  - Entry point: `pages/index.js` (homepage)
  - Components: `components/` untuk reusable UI components
  - Store: `store/` untuk state management dengan Zustand
  - Apollo Client: `lib/apollo-client.js` untuk GraphQL clients
  
- **`services/`**: Microservices backend
  - Setiap service memiliki struktur:
    - `index.js`: Entry point server
    - `graphql/`: Schema, resolvers, queries
    - `config/`: Database configuration
    - `db/`: Database initialization SQL
    - `Dockerfile`: Container definition

- **`scripts/`**: Utility scripts
  - `seed-all.sh` / `seed-all.ps1`: Script untuk seed data ke semua services
  - `check-services.sh`: Script untuk mengecek status services

#### ShipXpress (`TUGASBESAR_IAE_SHIPMEN_KELOMPOK2_SI4708-main/`)

- **`frontend/`**: Aplikasi React + Vite untuk UI logistik
  - Entry point: `src/main.jsx`
  - App: `src/App.jsx` dengan routing
  - Pages: `src/pages/` untuk halaman-halaman aplikasi
  - Components: `src/components/` untuk UI components
  - Context: `src/context/AuthContext.jsx` untuk authentication state

- **`gateway/`**: GraphQL Gateway menggunakan Apollo Federation
  - Entry point: `src/index.ts`
  - Menggabungkan semua microservices menjadi satu GraphQL endpoint

- **`services/`**: Microservices backend
  - Setiap service menggunakan TypeScript
  - Struktur: `src/index.ts`, `src/schema.ts`, `src/resolvers.ts`, `src/database.ts`

- **`database/`**: Database initialization
  - `init.sql`: Schema database PostgreSQL
  - `create_admin.sql`: Script untuk membuat admin user default

---

## Project A: YapPerce Marketplace

### Teknologi yang Digunakan

- **Frontend Framework**: Next.js 14 (React 18)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client 3.8
- **Package Manager**: NPM
- **Backend Runtime**: Node.js
- **Database**: MySQL 8.0 (satu database per service)
- **API**: GraphQL dengan Apollo Server
- **Containerization**: Docker & Docker Compose

### Arsitektur & Modul Kunci

#### Layer Arsitektur

```
Frontend (Next.js)
    ↓
Apollo Client (Multiple Clients)
    ↓
GraphQL Services (Microservices)
    ↓
MySQL Databases (Per Service)
```

#### Modul Utama

1. **User Service** (`services/user-service/`)
   - **Fungsi**: Manajemen pengguna, autentikasi, registrasi
   - **Database**: `user_service_db` (MySQL)
   - **Port**: 4010
   - **Key Features**:
     - User registration & login
     - JWT token generation
     - User CRUD operations

2. **Product Service** (`services/product-service/`)
   - **Fungsi**: Manajemen katalog produk, kategori, stok
   - **Database**: `product_service_db` (MySQL)
   - **Port**: 4011
   - **Key Features**:
     - Product CRUD
     - Category management
     - Stock management
     - Integration dengan User Service untuk seller info

3. **Order Service** (`services/order-service/`)
   - **Fungsi**: Manajemen pesanan, integrasi dengan ShipXpress
   - **Database**: `order_service_db` (MySQL)
   - **Port**: 4012
   - **Key Features**:
     - Order creation & management
     - Integration dengan Product Service untuk stock update
     - Integration dengan ShipXpress untuk shipment creation
     - Webhook endpoint untuk menerima status update dari ShipXpress
   - **File Kunci**:
     - `graphql/resolvers.js`: Logic untuk sendOrderToShipXpress
     - `index.js`: Webhook endpoint `/webhook/shipment-status`

4. **Payment Service** (`services/payment-service/`)
   - **Fungsi**: Manajemen pembayaran
   - **Database**: `payment_service_db` (MySQL)
   - **Port**: 4013
   - **Key Features**:
     - Payment processing
     - Automatic trigger untuk send order ke ShipXpress setelah payment success
   - **File Kunci**:
     - `graphql/resolvers.js`: Logic untuk processPayment yang memanggil Order Service

5. **ShipXpress Mock Service** (`services/shipxpress-mock/`)
   - **Fungsi**: Mock service untuk testing integrasi (dapat diganti dengan ShipXpress real)
   - **Port**: 4014
   - **Key Features**:
     - Simulasi ShipXpress API
     - Webhook simulation untuk status updates

#### Frontend Structure

- **Pages** (`frontend/pages/`):
  - `index.js`: Homepage dengan product listing
  - `products/[id].js`: Product detail page
  - `cart.js`: Shopping cart
  - `checkout.js`: Checkout page
  - `orders.js`: Order history
  - `profile.js`: User profile

- **Components** (`frontend/components/`):
  - `Layout.js`: Main layout wrapper
  - `ProductCard.js`: Product card component
  - `Navbar.js`: Navigation bar

- **State Management** (`frontend/store/`):
  - Zustand stores untuk cart, user authentication

- **GraphQL Clients** (`frontend/lib/apollo-client.js`):
  - Multiple Apollo Client instances untuk setiap service
  - Configuration untuk User, Product, Order, Payment services

### Routing Approach

Next.js menggunakan file-based routing:
- `pages/index.js` → `/`
- `pages/products/[id].js` → `/products/:id`
- `pages/cart.js` → `/cart`
- dll.

### Error Handling Patterns

- GraphQL error handling di resolvers dengan try-catch
- Frontend error handling dengan Apollo Client error policies
- Toast notifications menggunakan `react-hot-toast`

---

## Project B: ShipXpress

### Teknologi yang Digunakan

- **Frontend Framework**: React 18 + Vite
- **Routing**: React Router DOM 6
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client 3.8
- **Package Manager**: NPM
- **Backend Runtime**: Node.js dengan TypeScript
- **Database**: PostgreSQL 15
- **API**: GraphQL dengan Apollo Server
- **Gateway**: Apollo Federation (Apollo Gateway)
- **Containerization**: Docker & Docker Compose

### Arsitektur & Modul Kunci

#### Layer Arsitektur

```
Frontend (React + Vite)
    ↓
Apollo Client
    ↓
GraphQL Gateway (Apollo Federation)
    ↓
Microservices (GraphQL)
    ↓
PostgreSQL Database (Shared)
```

#### Modul Utama

1. **GraphQL Gateway** (`gateway/`)
   - **Fungsi**: Unified GraphQL endpoint yang menggabungkan semua services
   - **Port**: 4000
   - **Technology**: Apollo Gateway dengan IntrospectAndCompose
   - **File Kunci**: `src/index.ts`
   - **Subgraphs**:
     - Auth Service (4006)
     - Customer Service (4001)
     - Vehicle Service (4002)
     - Driver Service (4003)
     - Shipment Service (4004)
     - Tracking Service (4005)

2. **Auth Service** (`services/auth-service/`)
   - **Fungsi**: Autentikasi dan autorisasi
   - **Port**: 4006
   - **Key Features**:
     - User registration & login
     - JWT token generation
     - Password hashing dengan bcrypt
     - Role-based access (user, admin)

3. **Customer Service** (`services/customer-service/`)
   - **Fungsi**: Manajemen customer/pelanggan
   - **Port**: 4001
   - **Key Features**:
     - Customer CRUD operations
     - Customer type management (Individual, Corporate, Marketplace)

4. **Vehicle Service** (`services/vehicle-service/`)
   - **Fungsi**: Manajemen kendaraan
   - **Port**: 4002
   - **Key Features**:
     - Vehicle CRUD
     - Vehicle status management (available, in-use, maintenance)
     - Capacity tracking

5. **Driver Service** (`services/driver-service/`)
   - **Fungsi**: Manajemen driver
   - **Port**: 4003
   - **Key Features**:
     - Driver CRUD
     - Driver-vehicle assignment
     - License management

6. **Shipment Service** (`services/shipment-service/`)
   - **Fungsi**: Manajemen shipment/pengiriman
   - **Port**: 4004
   - **Key Features**:
     - Shipment creation & management
     - Integration dengan Marketplace (fetch user, order, payment data)
     - Automatic customer creation dari marketplace user
     - Shipment status management
   - **File Kunci**:
     - `src/resolvers.ts`: Logic untuk createShipment yang fetch data dari marketplace
     - Environment variables untuk marketplace service URLs

7. **Tracking Service** (`services/tracking-service/`)
   - **Fungsi**: Pelacakan status pengiriman
   - **Port**: 4005
   - **Key Features**:
     - Tracking update creation
     - Location tracking
     - Status history

#### Frontend Structure

- **Pages** (`frontend/src/pages/`):
  - `Login.jsx`: Login page
  - `Register.jsx`: Registration page
  - `Dashboard.jsx`: Main dashboard
  - `Customers.jsx`: Customer management
  - `Vehicles.jsx`: Vehicle management
  - `Drivers.jsx`: Driver management
  - `Shipments.jsx`: Shipment management
  - `Tracking.jsx`: Tracking view

- **Components** (`frontend/src/components/`):
  - `Layout.jsx`: Main layout dengan sidebar navigation

- **Context** (`frontend/src/context/`):
  - `AuthContext.jsx`: Authentication state management

- **Apollo Client** (`frontend/src/apolloClient.js`):
  - Single Apollo Client instance untuk GraphQL Gateway

### Routing Approach

React Router dengan protected routes:
- `/login` → Login page
- `/register` → Register page
- `/` → Dashboard (protected)
- `/customers` → Customers (protected)
- `/vehicles` → Vehicles (protected)
- `/drivers` → Drivers (protected)
- `/shipments` → Shipments (protected)
- `/tracking` → Tracking (protected)

### Authentication Approach

- JWT-based authentication
- Token disimpan di localStorage (frontend)
- Protected routes menggunakan `ProtectedRoute` component
- Auth context untuk global auth state

### Error Handling Patterns

- GraphQL error handling di resolvers
- Frontend error handling dengan Apollo Client
- Loading states untuk async operations

---

## Integrasi: Bagaimana YapPerce dan ShipXpress Bekerja Bersama

### Mekanisme Integrasi

Integrasi antara YapPerce Marketplace dan ShipXpress menggunakan **dua mekanisme utama**:

1. **GraphQL API Calls** (YapPerce → ShipXpress)
   - Order Service mengirim data pesanan ke ShipXpress melalui GraphQL mutation
   - Shipment Service dapat query data dari Marketplace services

2. **Webhook** (ShipXpress → YapPerce)
   - ShipXpress mengirim status update ke Order Service melalui HTTP POST webhook

### Base URLs & Endpoints

#### YapPerce → ShipXpress

- **Base URL**: `http://localhost:4000/graphql` (Gateway) atau `http://host.docker.internal:4000/graphql` (dari container)
- **Endpoint**: GraphQL endpoint di Gateway
- **Definisi di Code**: 
  - `YapPerce_IAE-main/services/order-service/graphql/resolvers.js` (line 6)
  - Environment variable: `SHIPXPRESS_URL`

#### ShipXpress → YapPerce

- **Webhook URL**: `http://localhost:4012/webhook/shipment-status` atau `http://order-service:4012/webhook/shipment-status` (internal)
- **Definisi di Code**:
  - `YapPerce_IAE-main/services/order-service/index.js` (line 16-45)
  - Environment variable di ShipXpress: `ORDER_SERVICE_WEBHOOK_URL` (To confirm - tidak ditemukan di code yang ada)

### Authentication Scheme

**Status**: Tidak ada authentication khusus antara services saat ini (To confirm untuk production)

- YapPerce Order Service memanggil ShipXpress Gateway tanpa authentication
- ShipXpress webhook ke YapPerce Order Service tanpa authentication
- **Catatan**: Untuk production, disarankan menambahkan API key atau JWT untuk security

### Alur Data End-to-End

#### Alur 1: Pembelian Produk & Pengiriman Otomatis

```
1. User di YapPerce Frontend
   ↓
2. User membuat Order (Order Service)
   ↓
3. User melakukan Payment (Payment Service)
   ↓
4. Payment Service → processPayment mutation
   ↓
5. Payment Service memanggil Order Service: sendOrderToShipXpress(orderId)
   ↓
6. Order Service → GraphQL mutation ke ShipXpress Gateway:
   createShipment(
     customer_id: user_id,
     origin_address: "YapPerce Warehouse",
     destination_address: user.address,
     S_type: "Marketplace Order",
     weight: totalQuantity,
     status: "Processing"
   )
   ↓
7. ShipXpress Shipment Service:
   - Menerima mutation
   - Fetch user data dari Marketplace User Service (optional)
   - Fetch order data dari Marketplace Order Service (optional)
   - Fetch payment data dari Marketplace Payment Service (optional)
   - Membuat customer di ShipXpress database (jika belum ada)
   - Membuat shipment record
   - Membuat tracking update awal
   ↓
8. ShipXpress mengembalikan shipment_id
   ↓
9. Order Service menyimpan shipment_id dan update status menjadi "Dalam Pengiriman"
   ↓
10. User dapat melihat status "Dalam Pengiriman" di YapPerce Frontend
```

#### Alur 2: Update Status Pengiriman (Webhook)

```
1. Admin ShipXpress mengupdate status shipment
   (atau sistem otomatis update berdasarkan tracking)
   ↓
2. ShipXpress Tracking Service atau Shipment Service
   mengirim HTTP POST webhook ke Order Service:
   POST http://order-service:4012/webhook/shipment-status
   Body: {
     shipmentId: "123",
     orderId: "1",
     status: "Shipped" | "In Transit" | "Delivered" | "Selesai"
   }
   ↓
3. Order Service webhook handler:
   - Validasi request body
   - Map status ShipXpress ke status Order:
     * "Delivered" atau "Selesai" → Order status: "Selesai"
     * Lainnya → Order status: "Dalam Pengiriman"
   - Update database: shipment_status dan status
   ↓
4. User di YapPerce Frontend melihat update status real-time
```

### Tabel Mapping Integrasi

| Fitur | Komponen YapPerce | Endpoint/Service ShipXpress | Catatan |
|-------|-------------------|----------------------------|---------|
| **Mengirim Pesanan** | Order Service<br/>`sendOrderToShipXpress()` | GraphQL Gateway<br/>`createShipment` mutation | Dipanggil otomatis setelah payment success |
| **Menerima Status Update** | Order Service<br/>`/webhook/shipment-status` | Shipment/Tracking Service<br/>HTTP POST webhook | Status: Processing, Shipped, In Transit, Delivered, Selesai |
| **Query Status Shipment** | Order Service (optional) | GraphQL Gateway<br/>`shipment` query | Untuk mendapatkan detail shipment |
| **Fetch User Data** | - | Shipment Service<br/>Query ke Marketplace User Service | ShipXpress fetch user dari YapPerce saat create shipment |
| **Fetch Order Data** | - | Shipment Service<br/>Query ke Marketplace Order Service | ShipXpress fetch order detail dari YapPerce |
| **Fetch Payment Data** | - | Shipment Service<br/>Query ke Marketplace Payment Service | ShipXpress fetch payment info dari YapPerce |

### Status Mapping

#### Status Order (YapPerce)

- `"Dipesan"` - Order dibuat, menunggu pembayaran
- `"Dalam Pengiriman"` - Order sudah dibayar dan dikirim ke ShipXpress
- `"Selesai"` - Order sudah sampai (Delivered)

#### Status Shipment (ShipXpress)

- `"Processing"` - Shipment sedang diproses
- `"Shipped"` - Barang sudah dikirim
- `"In Transit"` - Barang sedang dalam perjalanan
- `"Delivered"` - Barang sudah sampai
- `"Selesai"` - Pengiriman selesai (alternatif untuk Delivered)

#### Mapping Logic

**Di Order Service webhook handler** (`YapPerce_IAE-main/services/order-service/index.js` line 26-30):

```javascript
let orderStatus = 'Dalam Pengiriman';
if (status === 'Delivered' || status === 'Selesai') {
  orderStatus = 'Selesai';
}
```

**Lokasi Mapping**: 
- File: `YapPerce_IAE-main/services/order-service/index.js`
- Function: Webhook handler `/webhook/shipment-status` (line 16-45)

---

## Variabel Environment & Konfigurasi

### YapPerce Marketplace

#### Environment Variables per Service

| Nama Variabel | Required | Default | Contoh | Deskripsi | Digunakan di File |
|--------------|----------|---------|--------|-----------|-------------------|
| `PORT` | Ya | - | `4010` | Port untuk service | `services/*/index.js` |
| `DB_HOST` | Ya | - | `user-db` | Database host (container name) | `services/*/config/database.js` |
| `DB_PORT` | Ya | - | `3306` | Database port | `services/*/config/database.js` |
| `DB_USER` | Ya | - | `root` | Database user | `services/*/config/database.js` |
| `DB_PASSWORD` | Ya | - | `rootpassword` | Database password | `services/*/config/database.js` |
| `DB_NAME` | Ya | - | `user_service_db` | Database name | `services/*/config/database.js` |
| `JWT_SECRET` | Ya (User Service) | - | `your-secret-key` | JWT secret untuk token | `services/user-service/` |
| `USER_SERVICE_URL` | Ya (Product/Order) | `http://localhost:4010/graphql` | `http://user-service:4010/graphql` | URL User Service | `services/*/graphql/resolvers.js` |
| `PRODUCT_SERVICE_URL` | Ya (Order) | `http://localhost:4011/graphql` | `http://product-service:4011/graphql` | URL Product Service | `services/order-service/graphql/resolvers.js` |
| `SHIPXPRESS_URL` | Ya (Order) | `http://localhost:4000/graphql` | `http://host.docker.internal:4000/graphql` | URL ShipXpress Gateway | `services/order-service/graphql/resolvers.js` (line 6) |
| `ORDER_SERVICE_URL` | Ya (Payment) | `http://localhost:4012/graphql` | `http://order-service:4012/graphql` | URL Order Service | `services/payment-service/graphql/resolvers.js` |
| `ORDER_SERVICE_WEBHOOK_URL` | Ya (ShipXpress Mock) | - | `http://order-service:4012/webhook/shipment-status` | Webhook URL Order Service | `services/shipxpress-mock/` (To confirm) |
| `NEXT_PUBLIC_USER_SERVICE_URL` | Ya (Frontend) | - | `http://localhost:4010/graphql` | User Service URL untuk frontend | `frontend/lib/apollo-client.js` |
| `NEXT_PUBLIC_PRODUCT_SERVICE_URL` | Ya (Frontend) | - | `http://localhost:4011/graphql` | Product Service URL untuk frontend | `frontend/lib/apollo-client.js` |
| `NEXT_PUBLIC_ORDER_SERVICE_URL` | Ya (Frontend) | - | `http://localhost:4012/graphql` | Order Service URL untuk frontend | `frontend/lib/apollo-client.js` |
| `NEXT_PUBLIC_PAYMENT_SERVICE_URL` | Ya (Frontend) | - | `http://localhost:4013/graphql` | Payment Service URL untuk frontend | `frontend/lib/apollo-client.js` |

#### File Environment

- **Tidak ada `.env.example`** di repository (To confirm)
- Environment variables didefinisikan di `docker-compose.yml`
- Untuk development lokal, buat file `.env` di setiap service folder

### ShipXpress

#### Environment Variables per Service

| Nama Variabel | Required | Default | Contoh | Deskripsi | Digunakan di File |
|--------------|----------|---------|--------|-----------|-------------------|
| `PORT` | Ya | `4000` | `4001` | Port untuk service | `services/*/src/index.ts` |
| `DATABASE_URL` | Ya | - | `postgresql://shipxpress:shipxpress123@postgres:5432/shipxpress` | PostgreSQL connection string | `services/*/src/database.ts` |
| `SERVICE_NAME` | Ya | - | `customer-service` | Nama service untuk logging | `services/*/src/index.ts` |
| `JWT_SECRET` | Ya (Auth Service) | - | `shipxpress-secret-key` | JWT secret untuk token | `services/auth-service/src/resolvers.ts` |
| `JWT_EXPIRES_IN` | Tidak | `7d` | `7d` | JWT expiration time | `services/auth-service/src/resolvers.ts` |
| `AUTH_SERVICE_URL` | Ya (Gateway) | `http://localhost:4006/graphql` | `http://auth-service:4000/graphql` | Auth Service URL | `gateway/src/index.ts` |
| `CUSTOMER_SERVICE_URL` | Ya (Gateway) | `http://localhost:4001/graphql` | `http://customer-service:4000/graphql` | Customer Service URL | `gateway/src/index.ts` |
| `VEHICLE_SERVICE_URL` | Ya (Gateway) | `http://localhost:4002/graphql` | `http://vehicle-service:4000/graphql` | Vehicle Service URL | `gateway/src/index.ts` |
| `DRIVER_SERVICE_URL` | Ya (Gateway) | `http://localhost:4003/graphql` | `http://driver-service:4000/graphql` | Driver Service URL | `gateway/src/index.ts` |
| `SHIPMENT_SERVICE_URL` | Ya (Gateway) | `http://localhost:4004/graphql` | `http://shipment-service:4000/graphql` | Shipment Service URL | `gateway/src/index.ts` |
| `TRACKING_SERVICE_URL` | Ya (Gateway) | `http://localhost:4005/graphql` | `http://tracking-service:4000/graphql` | Tracking Service URL | `gateway/src/index.ts` |
| `MARKETPLACE_USER_SERVICE_URL` | Ya (Shipment) | `http://host.docker.internal:4010/graphql` | `http://host.docker.internal:4010/graphql` | Marketplace User Service URL | `services/shipment-service/src/resolvers.ts` (line 4-5) |
| `MARKETPLACE_ORDER_SERVICE_URL` | Ya (Shipment) | `http://host.docker.internal:4012/graphql` | `http://host.docker.internal:4012/graphql` | Marketplace Order Service URL | `services/shipment-service/src/resolvers.ts` (line 6-7) |
| `MARKETPLACE_PAYMENT_SERVICE_URL` | Ya (Shipment) | `http://host.docker.internal:4013/graphql` | `http://host.docker.internal:4013/graphql` | Marketplace Payment Service URL | `services/shipment-service/src/resolvers.ts` (line 8-9) |
| `VITE_GRAPHQL_URL` | Ya (Frontend) | - | `http://localhost:4000/graphql` | GraphQL Gateway URL untuk frontend | `frontend/src/apolloClient.js` |

#### File Environment

- **Tidak ada `.env.example`** di repository (To confirm)
- Environment variables didefinisikan di `docker-compose.yml`
- Database credentials hardcoded di `docker-compose.yml`:
  - User: `shipxpress`
  - Password: `shipxpress123`
  - Database: `shipxpress`

### Konfigurasi Development vs Production

#### Development

- Semua services berjalan di localhost dengan port yang berbeda
- Database credentials menggunakan default values
- CORS enabled untuk development
- GraphQL Playground enabled

#### Production (To confirm)

- **Security**: 
  - Ganti semua default passwords
  - Gunakan environment variables untuk sensitive data
  - Setup HTTPS
  - Configure CORS properly
  - Implement rate limiting
- **Database**: 
  - Use connection pooling
  - Setup database backups
- **Authentication**: 
  - Implement proper JWT validation
  - Add API keys untuk service-to-service communication

---

## Cara Menjalankan (Development Lokal)

### Prerequisites

Berdasarkan konfigurasi yang ada:

- **Docker & Docker Compose**: Versi terbaru
- **Node.js**: 18+ (untuk development lokal tanpa Docker)
- **NPM**: Terinstall dengan Node.js
- **Git**: Untuk clone repository (jika diperlukan)

### Langkah Instalasi

#### 1. Clone Repository (jika belum)

```bash
# Jika repository sudah ada, skip langkah ini
cd "D:\Pembelajaran Telkom University\Semester 5\IAE\Final"
```

#### 2. Setup YapPerce Marketplace

```bash
# Masuk ke folder YapPerce
cd YapPerce_IAE-main

# Jalankan dengan Docker Compose
docker-compose up --build
```

**Port yang digunakan**:
- Frontend: `5000`
- User Service: `4010`
- Product Service: `4011`
- Order Service: `4012`
- Payment Service: `4013`
- ShipXpress Mock: `4014`
- User DB: `3307`
- Product DB: `3311`
- Order DB: `3309`
- Payment DB: `3310`

#### 3. Setup ShipXpress

Buka terminal baru:

```bash
# Masuk ke folder ShipXpress
cd "D:\Pembelajaran Telkom University\Semester 5\IAE\Final\TUGASBESAR_IAE_SHIPMEN_KELOMPOK2_SI4708-main"

# Jalankan dengan Docker Compose
docker-compose up --build
```

**Port yang digunakan**:
- Frontend: `3000`
- Gateway: `4000`
- Auth Service: `4006`
- Customer Service: `4001`
- Vehicle Service: `4002`
- Driver Service: `4003`
- Shipment Service: `4004`
- Tracking Service: `4005`
- PostgreSQL: `5432`

### Setup Environment Files

**Catatan**: Environment variables sudah didefinisikan di `docker-compose.yml`. Untuk development lokal tanpa Docker, buat file `.env` di setiap service folder.

### Start Dependencies (Database)

Database akan otomatis start dengan Docker Compose. Tidak perlu start manual.

### Quick Start (Minimal Commands)

```bash
# Terminal 1: Start YapPerce
cd YapPerce_IAE-main
docker-compose up --build

# Terminal 2: Start ShipXpress
cd TUGASBESAR_IAE_SHIPMEN_KELOMPOK2_SI4708-main
docker-compose up --build

# Terminal 3: Seed YapPerce data (setelah services running)
cd YapPerce_IAE-main
# Linux/Mac:
chmod +x scripts/seed-all.sh && ./scripts/seed-all.sh
# Windows:
.\scripts\seed-all.ps1
```

### Verifikasi Services Running

**YapPerce**:
- Frontend: http://localhost:5000
- User Service: http://localhost:4010/graphql
- Product Service: http://localhost:4011/graphql
- Order Service: http://localhost:4012/graphql
- Payment Service: http://localhost:4013/graphql

**ShipXpress**:
- Frontend: http://localhost:3000
- Gateway: http://localhost:4000/graphql
- Individual services: http://localhost:4001-4006/graphql

---

## Cara Menjalankan Demo

### Seed Data

#### YapPerce Marketplace

**Script Otomatis**:

**Linux/Mac**:
```bash
cd YapPerce_IAE-main
chmod +x scripts/seed-all.sh
./scripts/seed-all.sh
```

**Windows (PowerShell)**:
```powershell
cd YapPerce_IAE-main
.\scripts\seed-all.ps1
```

**Manual (jika script tidak berjalan)**:
```bash
docker-compose exec user-service npm run seed
docker-compose exec product-service npm run seed
docker-compose exec order-service npm run seed
docker-compose exec payment-service npm run seed
```

**Data yang di-seed**:
- User: Beberapa user contoh (email: `john.doe@example.com`, password: `password123`)
- Products: Beberapa produk contoh dengan kategori
- Categories: Kategori produk
- Orders: (To confirm - mungkin tidak ada seed data untuk orders)
- Payments: (To confirm - mungkin tidak ada seed data untuk payments)

#### ShipXpress

**Database initialization**:
- Schema otomatis dibuat dari `database/init.sql` saat container pertama kali dibuat
- Admin user dapat dibuat dengan script `database/create_admin.sql` (To confirm cara menjalankannya)

**Manual seed** (jika diperlukan):
- Akses database: `docker-compose exec postgres psql -U shipxpress -d shipxpress`
- Insert data manual atau gunakan SQL scripts

### Demo Credentials

#### YapPerce Marketplace

**To confirm** - Credentials dari seed data:
- Email: `john.doe@example.com`
- Password: `password123`

**Cara membuat user baru**:
1. Buka http://localhost:5000
2. Klik "Register"
3. Isi form registrasi
4. Login dengan credentials baru

#### ShipXpress

**To confirm** - Admin credentials:
- Username: `admin` (dari `database/create_admin.sql`)
- Password: (To confirm - check `database/create_admin.sql`)
- Email: `admin@shipxpress.com`

**Cara membuat user baru**:
1. Buka http://localhost:3000
2. Klik "Register"
3. Isi form registrasi
4. Login dengan credentials baru

### Recommended Demo Flow

#### Flow 1: Pembelian Produk Lengkap

1. **Login ke YapPerce** (http://localhost:5000)
   - Login dengan `john.doe@example.com` / `password123`
   
2. **Browse Produk**
   - Lihat daftar produk di homepage
   - Klik produk untuk melihat detail
   
3. **Tambah ke Cart & Checkout**
   - Tambah produk ke cart
   - Klik "Checkout"
   - Isi informasi pengiriman
   
4. **Buat Order**
   - Klik "Place Order"
   - Order dibuat dengan status "Dipesan"
   
5. **Proses Pembayaran**
   - Klik "Pay Now" atau akses Payment Service GraphQL Playground
   - Mutation: `processPayment(input: { order_id: "1", amount: <total> })`
   - Status order otomatis berubah menjadi "Dalam Pengiriman"
   - Order otomatis dikirim ke ShipXpress
   
6. **Cek Shipment di ShipXpress**
   - Login ke ShipXpress (http://localhost:3000)
   - Buka halaman "Shipments"
   - Lihat shipment baru yang dibuat dari marketplace order
   
7. **Update Status di ShipXpress**
   - Klik shipment untuk melihat detail
   - Update status menjadi "Shipped" atau "In Transit"
   - (Mock service akan otomatis update status)
   
8. **Cek Status di YapPerce**
   - Kembali ke YapPerce
   - Buka halaman "Orders"
   - Lihat status order sudah terupdate menjadi "Dalam Pengiriman" atau "Selesai"

#### Flow 2: Manajemen Logistik di ShipXpress

1. **Login ke ShipXpress** (http://localhost:3000)
   
2. **Kelola Customer**
   - Buka halaman "Customers"
   - Lihat customer yang dibuat otomatis dari marketplace
   - Atau buat customer baru manual
   
3. **Kelola Vehicle**
   - Buka halaman "Vehicles"
   - Buat vehicle baru (Truck, Van, dll)
   - Set status menjadi "available"
   
4. **Kelola Driver**
   - Buka halaman "Drivers"
   - Buat driver baru
   - Assign vehicle ke driver
   
5. **Assign Vehicle ke Shipment**
   - Buka halaman "Shipments"
   - Pilih shipment
   - Assign vehicle yang available
   
6. **Update Tracking**
   - Buka halaman "Tracking"
   - Lihat tracking updates untuk shipment
   - Buat tracking update baru dengan status "In Transit" atau "Delivered"

### Testing Integration dengan GraphQL Playground

#### Test 1: Send Order ke ShipXpress

**Di Order Service** (http://localhost:4012/graphql):

```graphql
mutation {
  sendOrderToShipXpress(orderId: "1")
}
```

**Expected**: `true` jika berhasil, order status berubah menjadi "Dalam Pengiriman"

#### Test 2: Cek Shipment di ShipXpress

**Di ShipXpress Gateway** (http://localhost:4000/graphql):

```graphql
query {
  shipments {
    shipment_id
    customer_id
    origin_address
    destination_address
    status
    customer {
      name
      email
    }
  }
}
```

#### Test 3: Test Webhook dari ShipXpress

**Via curl atau Postman**:

```bash
curl -X POST http://localhost:4012/webhook/shipment-status \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "1",
    "orderId": "1",
    "status": "Delivered"
  }'
```

**Expected**: Response `{ "success": true, "message": "Shipment status updated" }`

---

## Dokumentasi API / Kontrak

### Endpoint Integrasi Utama

#### 1. YapPerce → ShipXpress: Create Shipment

**Endpoint**: `POST http://localhost:4000/graphql` (ShipXpress Gateway)

**GraphQL Mutation**:

```graphql
mutation CreateShipment(
  $customer_id: ID!
  $origin_address: String!
  $destination_address: String!
  $S_type: String!
  $weight: Float!
  $status: String!
  $vehicle_id: ID
) {
  createShipment(
    customer_id: $customer_id
    origin_address: $origin_address
    destination_address: $destination_address
    S_type: $S_type
    weight: $weight
    status: $status
    vehicle_id: $vehicle_id
  ) {
    shipment_id
    status
    customer {
      name
      email
    }
  }
}
```

**Variables**:

```json
{
  "customer_id": "1",
  "origin_address": "YapPerce Warehouse",
  "destination_address": "Jl. Merdeka No. 123, Jakarta",
  "S_type": "Marketplace Order",
  "weight": 2.5,
  "status": "Processing",
  "vehicle_id": null
}
```

**Response**:

```json
{
  "data": {
    "createShipment": {
      "shipment_id": "1",
      "status": "Processing",
      "customer": {
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

**Definisi di Code**: 
- `YapPerce_IAE-main/services/order-service/graphql/resolvers.js` (line 118-174)
- `TUGASBESAR_IAE_SHIPMEN_KELOMPOK2_SI4708-main/services/shipment-service/src/resolvers.ts` (line 169-209)

#### 2. ShipXpress → YapPerce: Webhook Status Update

**Endpoint**: `POST http://localhost:4012/webhook/shipment-status`

**Method**: POST

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "shipmentId": "1",
  "orderId": "1",
  "status": "Delivered"
}
```

**Response Success (200 OK)**:

```json
{
  "success": true,
  "message": "Shipment status updated"
}
```

**Response Error (400 Bad Request)**:

```json
{
  "error": "Missing required fields: shipmentId, orderId, status"
}
```

**Response Error (500 Internal Server Error)**:

```json
{
  "error": "Internal server error"
}
```

**Definisi di Code**: 
- `YapPerce_IAE-main/services/order-service/index.js` (line 16-45)

**Status Values yang Valid**:
- `"Processing"`
- `"Shipped"`
- `"In Transit"`
- `"Delivered"`
- `"Selesai"`

#### 3. Query Shipment Status (Optional)

**Endpoint**: `POST http://localhost:4000/graphql` (ShipXpress Gateway)

**GraphQL Query**:

```graphql
query GetShipment($id: ID!) {
  shipment(id: $id) {
    shipment_id
    customer_id
    origin_address
    destination_address
    status
    trackingUpdates {
      tracking_id
      location
      status
      updated_at
    }
  }
}
```

**Variables**:

```json
{
  "id": "1"
}
```

**Response**:

```json
{
  "data": {
    "shipment": {
      "shipment_id": "1",
      "customer_id": "1",
      "origin_address": "YapPerce Warehouse",
      "destination_address": "Jl. Merdeka No. 123, Jakarta",
      "status": "Delivered",
      "trackingUpdates": [
        {
          "tracking_id": "1",
          "location": "Jakarta",
          "status": "Processing",
          "updated_at": "2024-01-01T00:00:00Z"
        },
        {
          "tracking_id": "2",
          "location": "Bandung",
          "status": "Delivered",
          "updated_at": "2024-01-02T00:00:00Z"
        }
      ]
    }
  }
}
```

### Rate Limits & Pagination

**Status**: Tidak ada rate limiting yang diimplementasikan saat ini (To confirm)

**Pagination**: Tidak ada pagination yang diimplementasikan untuk queries (To confirm - semua query mengembalikan semua records)

---

## Troubleshooting & Error Umum

### Port Conflicts

**Error**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solusi**:
1. Cek port yang digunakan:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   
   # Linux/Mac
   lsof -i :4000
   ```

2. Stop process yang menggunakan port:
   ```bash
   # Windows (ganti PID dengan process ID dari netstat)
   taskkill /PID <PID> /F
   
   # Linux/Mac
   kill -9 <PID>
   ```

3. Atau ubah port di `docker-compose.yml`

### Missing Environment Variables

**Error**: `Error: Cannot connect to database` atau `Error: Service URL not defined`

**Solusi**:
1. Cek environment variables di `docker-compose.yml`
2. Pastikan semua required variables sudah didefinisikan
3. Restart container:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### CORS Issues

**Error**: `Access to fetch at 'http://localhost:4000/graphql' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solusi**:
1. Untuk development, pastikan CORS enabled di Apollo Server:
   - YapPerce: Check `services/*/index.js` untuk CORS configuration
   - ShipXpress: Gateway sudah menggunakan `cors()` middleware (line 52 di `gateway/src/index.ts`)

2. Jika masih error, tambahkan CORS configuration:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:3000', 'http://localhost:5000'],
     credentials: true
   }));
   ```

### Database Connection Errors

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432` atau `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solusi**:
1. Pastikan database container running:
   ```bash
   docker-compose ps
   ```

2. Cek database logs:
   ```bash
   docker-compose logs postgres  # ShipXpress
   docker-compose logs user-db  # YapPerce
   ```

3. Tunggu beberapa detik untuk database siap (healthcheck)

4. Restart database container:
   ```bash
   docker-compose restart postgres
   ```

### Migration Failures

**Error**: `Error: relation "customers" does not exist` atau `Error: Table 'user_service_db.users' doesn't exist`

**Solusi**:
1. Pastikan init script sudah dijalankan:
   - ShipXpress: `database/init.sql` otomatis dijalankan saat container pertama dibuat
   - YapPerce: `services/*/db/init.sql` otomatis dijalankan

2. Jika schema tidak ada, restart container dengan volume baru:
   ```bash
   docker-compose down -v  # Hapus volumes
   docker-compose up --build  # Rebuild dengan init scripts
   ```

### Build Issues

**Error**: `Error: Cannot find module` atau `Error: ENOENT: no such file or directory`

**Solusi**:
1. Rebuild containers:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

2. Cek Dockerfile untuk dependencies yang diperlukan

### Integration Issues

#### Error: Cannot send order to ShipXpress

**Error**: `Error sending order to ShipXpress: Network Error` atau `Error: connect ECONNREFUSED`

**Solusi**:
1. Pastikan ShipXpress Gateway running:
   ```bash
   # Cek di terminal ShipXpress
   docker-compose ps gateway
   ```

2. Cek URL di environment variable:
   - YapPerce Order Service: `SHIPXPRESS_URL=http://host.docker.internal:4000/graphql`
   - Pastikan menggunakan `host.docker.internal` untuk akses dari container ke host

3. Test connection manual:
   ```bash
   # Dari container YapPerce
   docker-compose exec order-service curl http://host.docker.internal:4000/graphql
   ```

#### Error: Webhook tidak menerima update

**Error**: Webhook endpoint tidak merespons atau error 404

**Solusi**:
1. Pastikan Order Service running:
   ```bash
   docker-compose ps order-service
   ```

2. Cek webhook endpoint:
   ```bash
   curl -X POST http://localhost:4012/webhook/shipment-status \
     -H "Content-Type: application/json" \
     -d '{"shipmentId":"1","orderId":"1","status":"Test"}'
   ```

3. Cek logs Order Service:
   ```bash
   docker-compose logs order-service
   ```

### How to Debug Integration

#### 1. Cek Logs Services

```bash
# YapPerce
docker-compose logs order-service
docker-compose logs payment-service

# ShipXpress
docker-compose logs shipment-service
docker-compose logs gateway
```

#### 2. Inspect Network Calls

**Browser DevTools**:
- Buka Network tab
- Filter untuk XHR/Fetch
- Lihat request/response untuk GraphQL calls

**GraphQL Playground**:
- Akses GraphQL Playground di setiap service
- Test queries/mutations manual
- Lihat error messages

#### 3. Test dengan curl/Postman

```bash
# Test ShipXpress Gateway
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ shipments { shipment_id status } }"}'

# Test YapPerce Order Service
curl -X POST http://localhost:4012/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ orders { order_id status } }"}'

# Test Webhook
curl -X POST http://localhost:4012/webhook/shipment-status \
  -H "Content-Type: application/json" \
  -d '{"shipmentId":"1","orderId":"1","status":"Delivered"}'
```

#### 4. Database Inspection

```bash
# ShipXpress PostgreSQL
docker-compose exec postgres psql -U shipxpress -d shipxpress
# SQL: SELECT * FROM shipments;

# YapPerce MySQL (User DB)
docker-compose exec user-db mysql -uroot -prootpassword user_service_db
# SQL: SELECT * FROM users;
```

---

## Kualitas & Maintenance

### Scripts

#### YapPerce Marketplace

**Package.json scripts** (di setiap service):
- `npm start`: Start production server
- `npm run dev`: Start development server (To confirm)
- `npm run seed`: Run database seeder

**Root scripts**:
- `scripts/seed-all.sh` / `scripts/seed-all.ps1`: Seed semua services
- `scripts/check-services.sh`: Check status semua services

#### ShipXpress

**Package.json scripts** (di setiap service):
- `npm start`: Start production server
- `npm run dev`: Start development server dengan watch mode (To confirm)
- `npm run build`: Build TypeScript (To confirm)

**Root scripts**:
- `setup.sh` / `setup.ps1`: Setup script untuk Linux/Mac dan Windows

### Conventions

#### Code Formatting

- **YapPerce**: Tidak ada formatter yang dikonfigurasi (To confirm)
- **ShipXpress**: TypeScript dengan ESLint (To confirm)

#### Commit Messages

Tidak ada convention yang didefinisikan (To confirm)

### Deployment Notes

#### Dockerfiles

**YapPerce**:
- Setiap service memiliki `Dockerfile`
- Base image: `node:18` (To confirm)
- Build command: `npm install && npm start`

**ShipXpress**:
- Setiap service memiliki `Dockerfile`
- Base image: `node:18-alpine` (To confirm)
- Build command: `npm install && npm run build && npm start`

#### CI/CD

Tidak ada CI/CD configuration yang ditemukan (To confirm)

### Known Limitations / TODOs

#### Dari Code Comments

**To confirm** - Tidak ada TODO comments yang ditemukan di code yang dibaca

#### Dari Dokumentasi

1. **Security**: 
   - Default passwords harus diganti di production
   - Implement authentication untuk service-to-service communication
   - Setup HTTPS

2. **Performance**:
   - Implement pagination untuk queries
   - Implement rate limiting
   - Database connection pooling (To confirm sudah ada)

3. **Error Handling**:
   - Improve error messages
   - Implement retry mechanism untuk webhook
   - Better logging

4. **Testing**:
   - Tidak ada test files yang ditemukan (To confirm)
   - Disarankan menambahkan unit tests dan integration tests

5. **Documentation**:
   - API documentation bisa lebih lengkap
   - Add OpenAPI/Swagger documentation (To confirm)

---

## Kesimpulan

Sistem ini menyediakan integrasi lengkap antara platform e-commerce (YapPerce Marketplace) dan sistem logistik (ShipXpress) dengan arsitektur microservices yang scalable. Integrasi dilakukan melalui GraphQL API calls dan webhook untuk komunikasi real-time.

Untuk pertanyaan atau issues, silakan buat issue di repository atau hubungi tim development.

---

**Dokumentasi ini dibuat berdasarkan analisis codebase pada**: `D:\Pembelajaran Telkom University\Semester 5\IAE\Final`

**Terakhir diupdate**: 2024 (To confirm - update dengan tanggal terakhir)
