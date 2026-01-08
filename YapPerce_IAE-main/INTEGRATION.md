# Dokumentasi Integrasi YapPerce Marketplace dengan ShipXpress

## Overview

Dokumen ini menjelaskan bagaimana YapPerce Marketplace terintegrasi dengan sistem logistik ShipXpress melalui GraphQL dan webhook.

## Arsitektur Integrasi

```
YapPerce Marketplace                    ShipXpress
┌─────────────────┐                    ┌──────────────┐
│  Order Service  │ ───GraphQL──────>  │  ShipXpress  │
│                 │ <───Webhook──────── │              │
└─────────────────┘                    └──────────────┘
```

## Endpoint ShipXpress

**GraphQL Endpoint**: `http://shipxpress:4014/graphql` (internal) atau `http://localhost:4014/graphql` (external)

## 1. Mengirim Pesanan ke ShipXpress

Setelah pembayaran berhasil, Order Service akan mengirim data pesanan ke ShipXpress melalui GraphQL mutation.

### GraphQL Mutation

```graphql
mutation CreateShipment($orderId: ID!, $userId: Int!, $items: [ShipmentItemInput!]!) {
  createShipment(orderId: $orderId, userId: $userId, items: $items) {
    success
    shipmentId
    message
  }
}
```

### Input Format

```graphql
input ShipmentItemInput {
  productId: Int!
  quantity: Int!
  price: Float!
}
```

### Contoh Request

```json
{
  "query": "mutation CreateShipment($orderId: ID!, $userId: Int!, $items: [ShipmentItemInput!]!) { createShipment(orderId: $orderId, userId: $userId, items: $items) { success shipmentId message } }",
  "variables": {
    "orderId": "1",
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 50000.00
      }
    ]
  }
}
```

### Response Format

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

## 2. Menerima Update Status Pengiriman dari ShipXpress

ShipXpress akan mengirim update status pengiriman ke Order Service melalui webhook endpoint.

### Webhook Endpoint

**URL**: `http://order-service:4012/webhook/shipment-status` (internal) atau `http://localhost:4012/webhook/shipment-status` (external)

**Method**: POST

**Content-Type**: application/json

### Request Body Format

```json
{
  "shipmentId": "SHP-1234567890-ABC123",
  "orderId": "1",
  "status": "Shipped"
}
```

### Status Values

ShipXpress dapat mengirim status berikut:
- `Processing` - Pesanan sedang diproses
- `Shipped` - Barang telah dikirim
- `In Transit` - Barang sedang dalam perjalanan
- `Delivered` - Barang telah sampai
- `Selesai` - Pengiriman selesai (alternatif untuk Delivered)

### Response Format

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Shipment status updated"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "error": "Missing required fields: shipmentId, orderId, status"
}
```

**Error Response (500 Internal Server Error)**:
```json
{
  "error": "Internal server error"
}
```

## 3. Query Status Pengiriman dari ShipXpress

Order Service dapat melakukan query ke ShipXpress untuk mendapatkan informasi status pengiriman.

### GraphQL Query

```graphql
query GetShipment($shipmentId: ID!) {
  shipment(shipmentId: $shipmentId) {
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

### Contoh Request

```json
{
  "query": "query GetShipment($shipmentId: ID!) { shipment(shipmentId: $shipmentId) { shipmentId orderId userId status trackingNumber items { productId quantity price } createdAt updatedAt } }",
  "variables": {
    "shipmentId": "SHP-1234567890-ABC123"
  }
}
```

## Alur Integrasi Lengkap

1. **Pembayaran Berhasil** → Payment Service memproses pembayaran
2. **Trigger Pengiriman** → Payment Service memanggil `sendOrderToShipXpress` mutation di Order Service
3. **Kirim ke ShipXpress** → Order Service mengirim data pesanan ke ShipXpress melalui GraphQL
4. **ShipXpress Memproses** → ShipXpress membuat shipment dan mengembalikan shipmentId
5. **Update Order** → Order Service menyimpan shipmentId dan mengupdate status pesanan
6. **Status Updates** → ShipXpress mengirim update status melalui webhook ke Order Service
7. **Update Order Status** → Order Service mengupdate status pesanan berdasarkan status pengiriman

## Testing Integration

### 1. Test Mengirim Pesanan ke ShipXpress

```bash
# Via GraphQL Playground di http://localhost:4012/graphql
mutation {
  sendOrderToShipXpress(orderId: "1")
}
```

### 2. Test Webhook dari ShipXpress

```bash
curl -X POST http://localhost:4012/webhook/shipment-status \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "SHP-TEST-123",
    "orderId": "1",
    "status": "Shipped"
  }'
```

### 3. Test Query Status dari ShipXpress

```bash
# Via GraphQL Playground di http://localhost:4014/graphql
query {
  shipment(shipmentId: "SHP-TEST-123") {
    shipmentId
    status
    trackingNumber
  }
}
```

## Error Handling

### Error saat Mengirim ke ShipXpress

Jika terjadi error saat mengirim pesanan ke ShipXpress:
- Order status tetap "Dipesan"
- Error akan dikembalikan melalui GraphQL response
- Log error dicatat di Order Service

### Error saat Menerima Webhook

Jika terjadi error saat menerima webhook:
- Webhook mengembalikan status 500
- Error dicatat di log Order Service
- ShipXpress dapat mencoba mengirim ulang webhook

## Catatan Penting

1. **Shipment ID**: Setiap shipment yang dibuat di ShipXpress memiliki shipmentId unik yang disimpan di Order Service
2. **Status Mapping**: Status dari ShipXpress akan dipetakan ke status pesanan di Order Service:
   - `Processing` → Status: "Dalam Pengiriman", Shipment Status: "Processing"
   - `Shipped` / `In Transit` → Status: "Dalam Pengiriman", Shipment Status: "Shipped" / "In Transit"
   - `Delivered` / `Selesai` → Status: "Selesai", Shipment Status: "Delivered" / "Selesai"
3. **Retry Mechanism**: ShipXpress harus mengimplementasikan retry mechanism jika webhook gagal
4. **Security**: Di production, webhook endpoint harus dilindungi dengan authentication/authorization

## Konfigurasi Environment Variables

### Order Service
```env
SHIPXPRESS_URL=http://shipxpress:4014/graphql
```

### ShipXpress (untuk mengirim webhook)
```env
ORDER_SERVICE_WEBHOOK_URL=http://order-service:4012/webhook/shipment-status
```

