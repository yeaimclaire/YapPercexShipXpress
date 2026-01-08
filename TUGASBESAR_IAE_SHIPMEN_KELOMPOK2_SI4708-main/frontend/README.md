# ShipXpress Frontend

Frontend web application untuk ShipXpress Logistics Management System.

## 🎨 Design

- **Base Color**: #FEF3E2 (Cream)
- **Accent Color**: #FAB12F (Orange)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

### Build

```bash
npm run build
```

## 📁 Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx       # Layout dengan sidebar dan header
│   ├── pages/
│   │   ├── Dashboard.jsx    # Dashboard overview
│   │   ├── Customers.jsx    # Customer management
│   │   ├── Vehicles.jsx     # Vehicle management
│   │   ├── Drivers.jsx      # Driver management
│   │   ├── Shipments.jsx    # Shipment management
│   │   └── Tracking.jsx     # Tracking updates
│   ├── apolloClient.js     # Apollo Client configuration
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── package.json
└── vite.config.js
```

## 🔌 GraphQL Connection

Frontend terhubung ke GraphQL Gateway di:
- Development: http://localhost:4000/graphql
- Production: Sesuaikan di `apolloClient.js`

## 📝 Features

- ✅ Dashboard dengan statistik
- ✅ Customer management (CRUD)
- ✅ Vehicle management (CRUD)
- ✅ Driver management (CRUD)
- ✅ Shipment management (CRUD)
- ✅ Tracking updates (CRUD)
- ✅ Responsive design
- ✅ Modern UI dengan Tailwind CSS

