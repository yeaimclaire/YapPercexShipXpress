# Fix Docker Authentication Issue
# Script untuk mengatasi masalah Docker Hub authentication

Write-Host "🔧 Fixing Docker Authentication Issue" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if images already exist locally
Write-Host ""
Write-Host "Checking for existing images..." -ForegroundColor Yellow

$nodeImage = docker images node:18-alpine -q
$postgresImage = docker images postgres:15-alpine -q

if ($nodeImage -and $postgresImage) {
    Write-Host "✅ Required images found locally!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Building services with existing images..." -ForegroundColor Yellow
    docker-compose build
    docker-compose up -d
    Write-Host ""
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    exit 0
}

# Try to login
Write-Host ""
Write-Host "Attempting to login to Docker Hub..." -ForegroundColor Yellow
Write-Host "If you don't have an account, create one at: https://hub.docker.com" -ForegroundColor Gray
Write-Host ""

$login = Read-Host "Do you want to login to Docker Hub? (y/n)"
if ($login -eq "y" -or $login -eq "Y") {
    docker login
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Pulling required images..." -ForegroundColor Yellow
        docker pull node:18-alpine
        docker pull postgres:15-alpine
        Write-Host ""
        Write-Host "Building and starting services..." -ForegroundColor Yellow
        docker-compose up --build -d
        Write-Host ""
        Write-Host "✅ Services started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Login failed. Please check your credentials." -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative solutions:" -ForegroundColor Yellow
        Write-Host "1. Verify your email at https://hub.docker.com" -ForegroundColor White
        Write-Host "2. Create a new Docker Hub account" -ForegroundColor White
        Write-Host "3. Use existing images if available" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Cannot proceed without Docker Hub login for pulling images." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Cyan
    Write-Host "1. Create free account at https://hub.docker.com" -ForegroundColor White
    Write-Host "2. Verify your email address" -ForegroundColor White
    Write-Host "3. Run: docker login" -ForegroundColor White
    Write-Host "4. Then run: docker-compose up --build" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use existing images if you have them:" -ForegroundColor Yellow
    Write-Host "  docker-compose build" -ForegroundColor Gray
    Write-Host "  docker-compose up" -ForegroundColor Gray
}

