# ShipXpress Setup Script for Windows PowerShell
# Script ini membantu setup awal project

Write-Host "🚢 ShipXpress Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found." -ForegroundColor Red
    exit 1
}

# Pull base images
Write-Host ""
Write-Host "Pulling base Docker images..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

try {
    Write-Host "Pulling node:18-alpine..." -ForegroundColor Gray
    docker pull node:18-alpine
    
    Write-Host "Pulling postgres:15-alpine..." -ForegroundColor Gray
    docker pull postgres:15-alpine
    
    Write-Host "✅ Base images pulled successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Failed to pull some images. You may need to login to Docker Hub." -ForegroundColor Yellow
    Write-Host "Run: docker login" -ForegroundColor Yellow
}

# Build and start services
Write-Host ""
Write-Host "Building and starting services..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray

try {
    docker-compose up --build -d
    Write-Host ""
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service URLs:" -ForegroundColor Cyan
    Write-Host "   Gateway: http://localhost:4000/graphql" -ForegroundColor White
    Write-Host "   Customer: http://localhost:4001/graphql" -ForegroundColor White
    Write-Host "   Vehicle: http://localhost:4002/graphql" -ForegroundColor White
    Write-Host "   Driver: http://localhost:4003/graphql" -ForegroundColor White
    Write-Host "   Shipment: http://localhost:4004/graphql" -ForegroundColor White
    Write-Host "   Tracking: http://localhost:4005/graphql" -ForegroundColor White
    Write-Host ""
    Write-Host "Check status with: docker-compose ps" -ForegroundColor Gray
    Write-Host "View logs with: docker-compose logs -f" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to start services. Check the error above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker Desktop is running" -ForegroundColor White
    Write-Host "2. Try: docker login" -ForegroundColor White
    Write-Host "3. Check: docker-compose logs" -ForegroundColor White
    exit 1
}

