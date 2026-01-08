# 🚢 ShipXpress - Sistem Logistik Berbasis Microservices

ShipXpress adalah sistem logistik terintegrasi yang menyediakan solusi pengiriman barang domestik dan internasional. Sistem ini dibangun menggunakan arsitektur microservices dengan GraphQL dan Docker.

## 📋 Fitur Utama

- ✅ **Microservices Architecture** - Sistem terbagi menjadi 5 layanan independen
- ✅ **GraphQL API** - API fleksibel dengan Apollo Federation
- ✅ **Docker Containerization** - Deployment mudah dengan Docker Compose
- ✅ **PostgreSQL Database** - Database relasional yang robust
- ✅ **TypeScript** - Type-safe development

## 🏗️ Arsitektur Sistem

Sistem terdiri dari 5 microservices:

1. **Customer Service** (Port 4001) - Manajemen pelanggan
2. **Vehicle Service** (Port 4002) - Manajemen kendaraan
3. **Driver Service** (Port 4003) - Manajemen driver
4. **Shipment Service** (Port 4004) - Manajemen pengiriman
5. **Tracking Service** (Port 4005) - Pelacakan pengiriman

**GraphQL Gateway** (Port 4000) - Menggabungkan semua layanan menjadi satu endpoint GraphQL

## 📦 Struktur Proyek

```
shipxpress/
├── docker-compose.yml          # Orkestrasi semua services
├── database/
│   └── init.sql                # Database schema
├── gateway/                    # GraphQL Gateway
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── index.ts
└── services/
    ├── customer-service/       # Customer microservice
    ├── vehicle-service/        # Vehicle microservice
    ├── driver-service/         # Driver microservice
    ├── shipment-service/       # Shipment microservice
    └── tracking-service/       # Tracking microservice
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (untuk development lokal)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd shipxpress
```

2. **Login ke Docker Hub (jika diperlukan)**
```bash
# Jika mengalami error 401 Unauthorized, login dulu ke Docker Hub
docker login

# Atau jika tidak punya akun, pull image manual dulu
docker pull node:18-alpine
docker pull postgres:15-alpine
```

3. **Start semua services dengan Docker Compose**
```bash
docker-compose up --build
```

4. **Akses GraphQL Gateway**
```
http://localhost:4000/graphql
```

5. **Akses GraphQL Playground**
Buka browser dan kunjungi: `http://localhost:4000/graphql`

## 📚 GraphQL API Documentation

### Customer Service

**Query:**
```graphql
query {
  customers {
    customer_id
    name
    email
    phone
    address
    C_type
  }
  
  customer(id: "1") {
    customer_id
    name
    email
  }
}
```

**Mutation:**
```graphql
mutation {
  createCustomer(
    name: "John Doe"
    email: "john@example.com"
    phone: "081234567890"
    address: "Jakarta"
    C_type: "Individual"
  ) {
    customer_id
    name
    email
  }
}
```

### Vehicle Service

**Query:**
```graphql
query {
  vehicles {
    vehicle_id
    V_type
    license_plate
    capacity
    status
  }
  
  vehiclesByStatus(status: "available") {
    vehicle_id
    license_plate
    status
  }
}
```

**Mutation:**
```graphql
mutation {
  createVehicle(
    V_type: "Truck"
    license_plate: "B1234XYZ"
    capacity: 5000.0
    status: "available"
  ) {
    vehicle_id
    license_plate
  }
}
```

### Driver Service

**Query:**
```graphql
query {
  drivers {
    driver_id
    name_driver
    phone_driver
    license_driver
    vehicle_id
  }
}
```

**Mutation:**
```graphql
mutation {
  createDriver(
    name_driver: "Jane Doe"
    phone_driver: "081234567891"
    license_driver: "SIM12345"
    vehicle_id: "1"
  ) {
    driver_id
    name_driver
  }
}
```

### Shipment Service

**Query:**
```graphql
query {
  shipments {
    shipment_id
    customer_id
    origin_address
    destination_address
    S_type
    weight
    status
    customer {
      name
      email
    }
    vehicle {
      license_plate
    }
  }
  
  shipmentsByCustomer(customer_id: "1") {
    shipment_id
    status
  }
}
```

**Mutation:**
```graphql
mutation {
  createShipment(
    customer_id: "1"
    origin_address: "Jakarta"
    destination_address: "Bandung"
    S_type: "Domestic"
    weight: 100.5
    status: "pending"
    vehicle_id: "1"
  ) {
    shipment_id
    status
  }
}
```

### Tracking Service

**Query:**
```graphql
query {
  trackingUpdatesByShipment(shipment_id: "1") {
    tracking_id
    location
    status
    updated_at
    shipment {
      shipment_id
      destination_address
    }
  }
}
```

**Mutation:**
```graphql
mutation {
  createTrackingUpdate(
    shipment_id: "1"
    location: "Jakarta"
    status: "In Transit"
  ) {
    tracking_id
    location
    status
  }
}
```

### Complex Query (Federation)

```graphql
query {
  shipments {
    shipment_id
    status
    customer {
      name
      email
      phone
    }
    vehicle {
      license_plate
      V_type
      driver {
        name_driver
        phone_driver
      }
    }
    trackingUpdates {
      location
      status
      updated_at
    }
  }
}
```

## 🔐 Authentication Service

The Auth Service provides user authentication and authorization:

**Features:**
- User Registration
- User Login with JWT tokens
- Password hashing with bcrypt
- User management (CRUD)
- Role-based access (user, admin)

**GraphQL Mutations:**
```graphql
# Register new user
mutation {
  register(
    username: "johndoe"
    email: "john@example.com"
    password: "password123"
    full_name: "John Doe"
    role: "user"
  ) {
    token
    user {
      user_id
      username
      email
      role
    }
  }
}

# Login
mutation {
  login(
    email: "john@example.com"
    password: "password123"
  ) {
    token
    user {
      user_id
      username
      email
      role
    }
  }
}
```

**Frontend Pages:**
- `/login` - Login page
- `/register` - Registration page
- Protected routes require authentication
- User menu in header with logout functionality

## 🔧 Development

### Menjalankan Service Secara Individual

1. **Setup database**
```bash
# Pastikan PostgreSQL running
docker-compose up postgres -d
```

2. **Install dependencies**
```bash
cd services/customer-service
npm install
```

3. **Run in development mode**
```bash
npm run dev
```

### Environment Variables

Setiap service menggunakan environment variables berikut:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Port untuk service (default: 4000)
- `SERVICE_NAME` - Nama service

## 🐳 Docker Commands

```bash
# Start semua services
docker-compose up

# Start di background
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop semua services
docker-compose down

# Stop dan hapus volumes
docker-compose down -v

# View logs
docker-compose logs -f [service-name]

# Restart service tertentu
docker-compose restart [service-name]
```

## 📊 Database Schema

### Customers
- `customer_id` (PK)
- `name`, `email`, `phone`, `address`
- `C_type` (Customer Type)
- `created_at`

### Vehicles
- `vehicle_id` (PK)
- `V_type`, `license_plate`, `capacity`
- `status`
- `created_at`

### Drivers
- `driver_id` (PK)
- `name_driver`, `phone_driver`, `license_driver`
- `vehicle_id` (FK)
- `created_at`

### Shipments
- `shipment_id` (PK)
- `customer_id` (FK), `vehicle_id` (FK)
- `origin_address`, `destination_address`
- `S_type`, `weight`, `status`
- `created_at`

### Tracking Updates
- `tracking_id` (PK)
- `shipment_id` (FK)
- `location`, `status`
- `updated_at`

## 🧪 Testing

### Test dengan GraphQL Playground

1. Buka `http://localhost:4000/graphql`
2. Gunakan query/mutation di atas
3. Klik "Play" untuk execute

### Test Individual Service

Setiap service dapat diakses langsung:
- Customer: `http://localhost:4001/graphql`
- Vehicle: `http://localhost:4002/graphql`
- Driver: `http://localhost:4003/graphql`
- Shipment: `http://localhost:4004/graphql`
- Tracking: `http://localhost:4005/graphql`

## 📝 API Endpoints

| Service | Port | Endpoint |
|---------|------|----------|
| Gateway | 4000 | `/graphql` |
| Customer | 4001 | `/graphql` |
| Vehicle | 4002 | `/graphql` |
| Driver | 4003 | `/graphql` |
| Shipment | 4004 | `/graphql` |
| Tracking | 4005 | `/graphql` |

## 🔐 Security Notes

⚠️ **Important**: Untuk production, pastikan untuk:
- Menggunakan environment variables untuk sensitive data
- Implement authentication & authorization
- Setup HTTPS
- Configure CORS properly
- Use database connection pooling
- Implement rate limiting

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Dikembangkan untuk pembelajaran sistem terintegrasi antar kelompok berbasis microservices.

## 🆘 Troubleshooting

### Docker Hub Authentication Error (401 Unauthorized)

Jika mengalami error `401 Unauthorized: email must be verified`, lakukan:

**Solusi 1: Login ke Docker Hub**
```bash
# Login ke Docker Hub
docker login

# Atau login dengan username spesifik
docker login -u your-username
```

**Solusi 2: Pull Image Manual**
```bash
# Pull image yang diperlukan terlebih dahulu
docker pull node:18-alpine
docker pull postgres:15-alpine

# Kemudian jalankan docker-compose
docker-compose up --build
```

**Solusi 3: Gunakan Image yang Sudah Ada**
```bash
# Cek image yang sudah ada
docker images

# Jika image sudah ada, langsung jalankan tanpa --build
docker-compose up
```

**Solusi 4: Bypass dengan Pull Image Dulu**
```bash
# Pull semua base images dulu
docker pull node:18-alpine
docker pull postgres:15-alpine

# Kemudian build
docker-compose build
docker-compose up
```

### Database connection error
```bash
# Pastikan PostgreSQL container running
docker-compose ps

# Check logs
docker-compose logs postgres
```

### Service tidak bisa start
```bash
# Rebuild containers
docker-compose up --build --force-recreate

# Check service logs
docker-compose logs [service-name]
```

### Port already in use
```bash
# Stop service yang menggunakan port
docker-compose down

# Atau ubah port di docker-compose.yml
```

### Network/Connection Issues
```bash
# Restart Docker daemon (Windows)
# Klik kanan Docker Desktop > Restart

# Atau restart Docker service (Linux)
sudo systemctl restart docker

# Clear Docker build cache
docker builder prune
```

## 📞 Support

Untuk pertanyaan atau issues, silakan buat issue di repository ini.

---

**ShipXpress** - Solusi Logistik Terintegrasi 🚢

