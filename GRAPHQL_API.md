# Dokumentasi GraphQL API - YapPerce Marketplace

Dokumentasi lengkap untuk semua endpoint GraphQL di setiap layanan YapPerce Marketplace.

## User Service (Port 4010)

**Endpoint**: `http://localhost:4010/graphql`

### Queries

#### `users`
Mendapatkan daftar semua pengguna.

**Query:**
```graphql
query {
  users {
    user_id
    name
    email
    phone
    address
  }
}
```

**Response:**
```json
{
  "data": {
    "users": [
      {
        "user_id": "1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "081234567890",
        "address": "Jl. Merdeka No. 123, Jakarta"
      }
    ]
  }
}
```

#### `user(id: ID!)`
Mendapatkan detail pengguna berdasarkan ID.

**Query:**
```graphql
query {
  user(id: "1") {
    user_id
    name
    email
    phone
    address
  }
}
```

#### `login(email: String!, password: String!)`
Login pengguna dan mendapatkan token autentikasi.

**Query:**
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

**Response:**
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "user_id": "1",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

### Mutations

#### `registerUser(input: RegisterInput!)`
Mendaftarkan pengguna baru.

**Mutation:**
```graphql
mutation {
  registerUser(input: {
    name: "Jane Smith"
    email: "jane.smith@example.com"
    phone: "081234567891"
    address: "Jl. Sudirman No. 456"
    password: "password123"
  }) {
    token
    user {
      user_id
      name
      email
    }
  }
}
```

#### `updateUser(id: ID!, input: UpdateUserInput!)`
Memperbarui data pengguna.

**Mutation:**
```graphql
mutation {
  updateUser(id: "1", input: {
    name: "John Updated"
    phone: "081234567899"
  }) {
    user_id
    name
    email
    phone
  }
}
```

#### `deleteUser(id: ID!)`
Menghapus pengguna.

**Mutation:**
```graphql
mutation {
  deleteUser(id: "1")
}
```

---

## Product Service (Port 4011)

**Endpoint**: `http://localhost:4011/graphql`

### Queries

#### `products`
Mendapatkan daftar semua produk.

**Query:**
```graphql
query {
  products {
    product_id
    name
    description
    price
    stock
    category {
      category_id
      category_name
    }
    seller {
      user_id
      name
      email
    }
  }
}
```

#### `product(id: ID!)`
Mendapatkan detail produk berdasarkan ID.

**Query:**
```graphql
query {
  product(id: "1") {
    product_id
    name
    description
    price
    stock
    category {
      category_name
    }
  }
}
```

#### `productsByCategory(categoryId: ID!)`
Mendapatkan produk berdasarkan kategori.

**Query:**
```graphql
query {
  productsByCategory(categoryId: "1") {
    product_id
    name
    price
    stock
  }
}
```

#### `productsBySeller(userId: ID!)`
Mendapatkan produk berdasarkan penjual.

**Query:**
```graphql
query {
  productsBySeller(userId: "1") {
    product_id
    name
    price
    stock
  }
}
```

#### `categories`
Mendapatkan daftar semua kategori.

**Query:**
```graphql
query {
  categories {
    category_id
    category_name
  }
}
```

### Mutations

#### `createProduct(input: ProductInput!)`
Membuat produk baru.

**Mutation:**
```graphql
mutation {
  createProduct(input: {
    name: "Laptop ASUS"
    description: "Laptop ASUS dengan spesifikasi tinggi"
    price: 8500000
    stock: 10
    category_id: 1
    user_id: 1
  }) {
    product_id
    name
    price
    stock
  }
}
```

#### `updateProduct(id: ID!, input: ProductInput!)`
Memperbarui produk.

**Mutation:**
```graphql
mutation {
  updateProduct(id: "1", input: {
    name: "Laptop ASUS Updated"
    price: 8000000
    stock: 15
  }) {
    product_id
    name
    price
    stock
  }
}
```

#### `updateStock(id: ID!, stock: Int!)`
Memperbarui stok produk.

**Mutation:**
```graphql
mutation {
  updateStock(id: "1", stock: 20) {
    product_id
    stock
  }
}
```

#### `createCategory(categoryName: String!)`
Membuat kategori baru.

**Mutation:**
```graphql
mutation {
  createCategory(categoryName: "Electronics") {
    category_id
    category_name
  }
}
```

---

## Order Service (Port 4012)

**Endpoint**: `http://localhost:4012/graphql`

### Queries

#### `orders`
Mendapatkan daftar semua pesanan.

**Query:**
```graphql
query {
  orders {
    order_id
    user_id
    order_date
    total_amount
    status
    shipment_status
    shipment_id
    user {
      name
      email
    }
    items {
      product_id
      quantity
      price
      product {
        name
      }
    }
  }
}
```

#### `order(id: ID!)`
Mendapatkan detail pesanan berdasarkan ID.

**Query:**
```graphql
query {
  order(id: "1") {
    order_id
    total_amount
    status
    shipment_status
    items {
      product {
        name
      }
      quantity
      price
    }
  }
}
```

#### `ordersByUser(userId: ID!)`
Mendapatkan pesanan berdasarkan user.

**Query:**
```graphql
query {
  ordersByUser(userId: "1") {
    order_id
    total_amount
    status
    order_date
  }
}
```

### Mutations

#### `createOrder(input: OrderInput!)`
Membuat pesanan baru.

**Mutation:**
```graphql
mutation {
  createOrder(input: {
    user_id: 1
    items: [
      {
        product_id: 1
        quantity: 2
        price: 50000
      },
      {
        product_id: 2
        quantity: 1
        price: 75000
      }
    ]
  }) {
    order_id
    total_amount
    status
  }
}
```

**Note**: Mutation ini akan otomatis mengurangi stok produk di Product Service.

#### `updateOrderStatus(id: ID!, status: String!)`
Memperbarui status pesanan.

**Mutation:**
```graphql
mutation {
  updateOrderStatus(id: "1", status: "Dalam Pengiriman") {
    order_id
    status
  }
}
```

**Status yang valid**: `"Dipesan"`, `"Dalam Pengiriman"`, `"Selesai"`

#### `updateShipmentStatus(id: ID!, shipmentStatus: String!)`
Memperbarui status pengiriman.

**Mutation:**
```graphql
mutation {
  updateShipmentStatus(id: "1", shipmentStatus: "Shipped") {
    order_id
    shipment_status
    status
  }
}
```

#### `sendOrderToShipXpress(orderId: ID!)`
Mengirim pesanan ke ShipXpress untuk diproses.

**Mutation:**
```graphql
mutation {
  sendOrderToShipXpress(orderId: "1")
}
```

**Note**: Mutation ini akan mengirim data pesanan ke ShipXpress dan mengupdate status pesanan menjadi "Dalam Pengiriman".

---

## Payment Service (Port 4013)

**Endpoint**: `http://localhost:4013/graphql`

### Queries

#### `payments`
Mendapatkan daftar semua pembayaran.

**Query:**
```graphql
query {
  payments {
    payment_id
    order_id
    payment_date
    amount
    payment_status
    order {
      order_id
      total_amount
      status
    }
  }
}
```

#### `payment(id: ID!)`
Mendapatkan detail pembayaran berdasarkan ID.

**Query:**
```graphql
query {
  payment(id: "1") {
    payment_id
    amount
    payment_status
    order {
      order_id
      total_amount
    }
  }
}
```

#### `paymentsByOrder(orderId: ID!)`
Mendapatkan pembayaran berdasarkan pesanan.

**Query:**
```graphql
query {
  paymentsByOrder(orderId: "1") {
    payment_id
    amount
    payment_status
    payment_date
  }
}
```

### Mutations

#### `createPayment(input: PaymentInput!)`
Membuat pembayaran baru dengan status "Tertunda".

**Mutation:**
```graphql
mutation {
  createPayment(input: {
    order_id: 1
    amount: 500000
  }) {
    payment_id
    amount
    payment_status
  }
}
```

#### `updatePaymentStatus(id: ID!, status: String!)`
Memperbarui status pembayaran.

**Mutation:**
```graphql
mutation {
  updatePaymentStatus(id: "1", status: "Berhasil") {
    payment_id
    payment_status
  }
}
```

**Status yang valid**: `"Berhasil"`, `"Tertunda"`, `"Gagal"`

**Note**: Jika status diubah menjadi "Berhasil", pesanan akan otomatis dikirim ke ShipXpress.

#### `processPayment(input: PaymentInput!)`
Memproses pembayaran (otomatis set status "Berhasil" dan kirim ke ShipXpress).

**Mutation:**
```graphql
mutation {
  processPayment(input: {
    order_id: 1
    amount: 500000
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

**Note**: Mutation ini akan:
1. Membuat pembayaran dengan status "Berhasil"
2. Otomatis mengirim pesanan ke ShipXpress
3. Mengupdate status pesanan menjadi "Dalam Pengiriman"

---

## ShipXpress Mock Service (Port 4014)

**Endpoint**: `http://localhost:4014/graphql`

### Queries

#### `shipment(shipmentId: ID!)`
Mendapatkan detail shipment berdasarkan ID.

**Query:**
```graphql
query {
  shipment(shipmentId: "SHP-1234567890-ABC123") {
    shipmentId
    orderId
    userId
    status
    trackingNumber
    items {
      productId
      quantity
      price
    }
    createdAt
    updatedAt
  }
}
```

#### `shipments`
Mendapatkan daftar semua shipment.

**Query:**
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

#### `shipmentsByOrder(orderId: ID!)`
Mendapatkan shipment berdasarkan order ID.

**Query:**
```graphql
query {
  shipmentsByOrder(orderId: "1") {
    shipmentId
    status
    trackingNumber
  }
}
```

### Mutations

#### `createShipment(orderId: ID!, userId: Int!, items: [ShipmentItemInput!]!)`
Membuat shipment baru di ShipXpress.

**Mutation:**
```graphql
mutation {
  createShipment(
    orderId: "1"
    userId: 1
    items: [
      {
        productId: 1
        quantity: 2
        price: 50000
      }
    ]
  ) {
    success
    shipmentId
    message
  }
}
```

**Response:**
```json
{
  "data": {
    "createShipment": {
      "success": true,
      "shipmentId": "SHP-1234567890-ABC123",
      "message": "Shipment created successfully"
    }
  }
}
```

**Note**: Setelah shipment dibuat, ShipXpress akan otomatis mengirim webhook ke Order Service saat status berubah:
- Setelah 5 detik: Status menjadi "Shipped"
- Setelah 10 detik: Status menjadi "In Transit"
- Setelah 15 detik: Status menjadi "Delivered"

#### `updateShipmentStatus(shipmentId: ID!, status: String!)`
Memperbarui status shipment secara manual.

**Mutation:**
```graphql
mutation {
  updateShipmentStatus(shipmentId: "SHP-1234567890-ABC123", status: "Delivered") {
    success
    message
  }
}
```

**Status yang valid**: `"Processing"`, `"Shipped"`, `"In Transit"`, `"Delivered"`, `"Selesai"`

**Note**: Setiap update status akan otomatis mengirim webhook ke Order Service.

---

## Error Handling

Semua endpoint GraphQL mengembalikan error dalam format standar GraphQL:

```json
{
  "errors": [
    {
      "message": "Error message here",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["mutationName"]
    }
  ],
  "data": null
}
```

### Common Error Messages

- **User Service**:
  - `"Email already registered"` - Email sudah terdaftar
  - `"Invalid email or password"` - Email atau password salah
  - `"User not found"` - User tidak ditemukan

- **Product Service**:
  - `"Product not found"` - Produk tidak ditemukan
  - `"Category not found"` - Kategori tidak ditemukan

- **Order Service**:
  - `"Order not found"` - Pesanan tidak ditemukan
  - `"Insufficient stock"` - Stok tidak mencukupi
  - `"Error sending order to ShipXpress"` - Gagal mengirim ke ShipXpress

- **Payment Service**:
  - `"Order not found"` - Pesanan tidak ditemukan
  - `"Payment amount does not match order total"` - Jumlah pembayaran tidak sesuai

- **ShipXpress**:
  - `"Shipment not found"` - Shipment tidak ditemukan

---

## Best Practices

1. **Authentication**: Gunakan token JWT dari User Service untuk autentikasi (implementasi di frontend)
2. **Error Handling**: Selalu handle error response dari GraphQL
3. **Validation**: Validasi input sebelum mengirim mutation
4. **Caching**: Pertimbangkan caching untuk query yang sering digunakan
5. **Pagination**: Untuk query yang mengembalikan banyak data, pertimbangkan implementasi pagination

---

## Testing dengan GraphQL Playground

Setiap service menyediakan GraphQL Playground yang dapat diakses di:
- User Service: http://localhost:4010/graphql
- Product Service: http://localhost:4011/graphql
- Order Service: http://localhost:4012/graphql
- Payment Service: http://localhost:4013/graphql
- ShipXpress: http://localhost:4014/graphql

Gunakan GraphQL Playground untuk:
- Melihat schema lengkap
- Testing queries dan mutations
- Melihat dokumentasi otomatis
- Debugging queries

