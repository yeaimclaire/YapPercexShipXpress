-- ShipXpress Database Schema
-- Based on ERD Design

-- Customer Table
CREATE TABLE IF NOT EXISTS customers (
  customer_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  C_type VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id SERIAL PRIMARY KEY,
  V_type VARCHAR(255) NOT NULL,
  license_plate VARCHAR(255) NOT NULL UNIQUE,
  capacity FLOAT NOT NULL,
  status VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  driver_id SERIAL PRIMARY KEY,
  name_driver VARCHAR(255) NOT NULL,
  phone_driver VARCHAR(255) NOT NULL,
  license_driver VARCHAR(255) NOT NULL UNIQUE,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
  profile_photo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  shipment_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  origin_address VARCHAR(255) NOT NULL,
  destination_address VARCHAR(255) NOT NULL,
  S_type VARCHAR(255) NOT NULL,
  weight FLOAT NOT NULL,
  status VARCHAR(255) NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Tracking_update Table
CREATE TABLE IF NOT EXISTS tracking_updates (
  tracking_id SERIAL PRIMARY KEY,
  shipment_id INTEGER NOT NULL REFERENCES shipments(shipment_id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(255),
  recipient_address VARCHAR(255),
  item_name VARCHAR(255),
  barcode VARCHAR(255),
  updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Users Table for Authentication
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipments_customer ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_vehicle ON shipments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tracking_shipment ON tracking_updates(shipment_id);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle ON drivers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_license ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

