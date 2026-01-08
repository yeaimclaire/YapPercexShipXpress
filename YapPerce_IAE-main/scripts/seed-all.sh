#!/bin/bash

# Script to seed all services after containers are running
# Usage: ./scripts/seed-all.sh

echo "Seeding all services..."

echo "Seeding User Service..."
docker-compose exec -T user-service npm run seed

echo "Seeding Product Service..."
docker-compose exec -T product-service npm run seed

echo "Seeding Order Service..."
docker-compose exec -T order-service npm run seed

echo "Seeding Payment Service..."
docker-compose exec -T payment-service npm run seed

echo "All services seeded successfully!"

