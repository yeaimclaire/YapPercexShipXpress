# PowerShell script to seed all services after containers are running
# Usage: .\scripts\seed-all.ps1

Write-Host "Seeding all services..." -ForegroundColor Green

Write-Host "Seeding User Service..." -ForegroundColor Yellow
docker-compose exec -T user-service npm run seed

Write-Host "Seeding Product Service..." -ForegroundColor Yellow
docker-compose exec -T product-service npm run seed

Write-Host "Seeding Order Service..." -ForegroundColor Yellow
docker-compose exec -T order-service npm run seed

Write-Host "Seeding Payment Service..." -ForegroundColor Yellow
docker-compose exec -T payment-service npm run seed

Write-Host "All services seeded successfully!" -ForegroundColor Green

