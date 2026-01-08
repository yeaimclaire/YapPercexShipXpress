#!/bin/bash
# ShipXpress Setup Script for Linux/Mac
# Script ini membantu setup awal project

echo "🚢 ShipXpress Setup Script"
echo "========================="
echo ""

# Check Docker
echo "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker found: $DOCKER_VERSION"
else
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check Docker Compose
echo "Checking Docker Compose..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    echo "✅ Docker Compose found: $COMPOSE_VERSION"
else
    echo "❌ Docker Compose not found."
    exit 1
fi

# Pull base images
echo ""
echo "Pulling base Docker images..."
echo "This may take a few minutes..."

if docker pull node:18-alpine && docker pull postgres:15-alpine; then
    echo "✅ Base images pulled successfully!"
else
    echo "⚠️  Warning: Failed to pull some images. You may need to login to Docker Hub."
    echo "Run: docker login"
fi

# Build and start services
echo ""
echo "Building and starting services..."
echo "This may take several minutes..."

if docker-compose up --build -d; then
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "   Gateway: http://localhost:4000/graphql"
    echo "   Customer: http://localhost:4001/graphql"
    echo "   Vehicle: http://localhost:4002/graphql"
    echo "   Driver: http://localhost:4003/graphql"
    echo "   Shipment: http://localhost:4004/graphql"
    echo "   Tracking: http://localhost:4005/graphql"
    echo ""
    echo "Check status with: docker-compose ps"
    echo "View logs with: docker-compose logs -f"
else
    echo "❌ Failed to start services. Check the error above."
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure Docker is running"
    echo "2. Try: docker login"
    echo "3. Check: docker-compose logs"
    exit 1
fi

