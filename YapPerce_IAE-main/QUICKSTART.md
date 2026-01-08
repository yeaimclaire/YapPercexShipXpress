# Quick Start Guide - YapPerce Marketplace

Panduan cepat untuk menjalankan sistem YapPerce Marketplace.

## Prasyarat

- Docker Desktop terinstall dan berjalan
- Docker Compose terinstall
- Port 4010-4014 dan 3307, 3309-3311 tersedia

## Langkah 1: Clone dan Setup

```bash
# Clone repository (jika belum)
git clone <repository-url>
cd YapPerce_Marketplace
```

## Langkah 2: Jalankan dengan Docker Compose

```bash
# Build dan jalankan semua container
docker-compose up --build
```

Tunggu hingga semua container berjalan. Anda akan melihat log seperti:
```
user-service    | User Service running on http://localhost:4010/graphql
product-service | Product Service running on http://localhost:4011/graphql
order-service   | Order Service running on http://localhost:4012/graphql
payment-service | Payment Service running on http://localhost:4013/graphql
shipxpress      | ShipXpress Mock Service running on http://localhost:4014/graphql
```

## Langkah 3: Seed Database

Buka terminal baru dan jalankan:

**Linux/Mac:**
```bash
chmod +x scripts/seed-all.sh
./scripts/seed-all.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\seed-all.ps1
```

**Atau manual:**
```bash
docker-compose exec user-service npm run seed
docker-compose exec product-service npm run seed
docker-compose exec order-service npm run seed
docker-compose exec payment-service npm run seed
```

## Langkah 4: Test Sistem

### 1. Akses GraphQL Playground

Buka browser dan akses:
- User Service: http://localhost:4010/graphql
- Product Service: http://localhost:4011/graphql
- Order Service: http://localhost:4012/graphql
- Payment Service: http://localhost:4013/graphql
- ShipXpress: http://localhost:4014/graphql

### 2. Test Alur Lengkap

#### A. Login/Register User

Di User Service GraphQL Playground:
```graphql
query {
  login(email: "john.doe@example.com", password: "password123") {
    token
    user {
      user_id
      name
      email
    }
  }
}
```

#### B. Lihat Produk

Di Product Service GraphQL Playground:
```graphql
query {
  products {
    product_id
    name
    price
    stock
    category {
      category_name
    }
  }
}
```

#### C. Buat Pesanan

Di Order Service GraphQL Playground:
```graphql
mutation {
  createOrder(input: {
    user_id: 1
    items: [
      {
        product_id: 1
        quantity: 1
        price: 8500000
      }
    ]
  }) {
    order_id
    total_amount
    status
  }
}
```

#### D. Proses Pembayaran

Di Payment Service GraphQL Playground:
```graphql
mutation {
  processPayment(input: {
    order_id: 1
    amount: 8500000
  }) {
    payment_id
    payment_status
    order {
      order_id
      status
    }
  }
}
```

**Catatan**: Setelah pembayaran berhasil, pesanan akan otomatis dikirim ke ShipXpress.

#### E. Cek Status Pengiriman

Di Order Service GraphQL Playground:
```graphql
query {
  order(id: "1") {
    order_id
    status
    shipment_status
    shipment_id
  }
}
```

Atau di ShipXpress GraphQL Playground:
```graphql
query {
  shipments {
    shipmentId
    orderId
    status
    trackingNumber
  }
}
```

## Troubleshooting

### Container tidak bisa start

1. Pastikan Docker Desktop berjalan
2. Cek port yang digunakan tidak conflict:
   ```bash
   docker-compose ps
   ```
3. Cek log untuk error:
   ```bash
   docker-compose logs <service-name>
   ```

### Database connection error

1. Pastikan database container sudah running:
   ```bash
   docker-compose ps
   ```
2. Tunggu beberapa detik untuk database siap
3. Restart service yang error:
   ```bash
   docker-compose restart <service-name>
   ```

### Seeder error

1. Pastikan database sudah terinisialisasi
2. Pastikan service terkait sudah running
3. Cek log:
   ```bash
   docker-compose logs <service-name>
   ```

### Port sudah digunakan

Edit `docker-compose.yml` dan ubah port mapping jika ada conflict.

## Stop Sistem

```bash
# Stop semua container
docker-compose down

# Stop dan hapus volumes (menghapus data database)
docker-compose down -v
```

## Restart Sistem

```bash
docker-compose restart
```

## Melihat Log

```bash
# Semua services
docker-compose logs -f

# Service tertentu
docker-compose logs -f user-service
docker-compose logs -f order-service
```

## Akses Database Langsung

```bash
# User DB
docker-compose exec user-db mysql -uroot -prootpassword user_service_db

# Product DB (port 3311)
docker-compose exec product-db mysql -uroot -prootpassword product_service_db

# Order DB
docker-compose exec order-db mysql -uroot -prootpassword order_service_db

# Payment DB
docker-compose exec payment-db mysql -uroot -prootpassword payment_service_db
```

## Next Steps

1. Baca dokumentasi lengkap di `GRAPHQL_API.md`
2. Pelajari integrasi dengan ShipXpress di `INTEGRATION.md`
3. Explore GraphQL Playground untuk setiap service
4. Test semua endpoint sesuai kebutuhan

## Support

Jika ada masalah, cek:
1. Log container: `docker-compose logs`
2. Dokumentasi di `README.md`, `GRAPHQL_API.md`, dan `INTEGRATION.md`
3. GraphQL Playground untuk melihat schema dan dokumentasi

