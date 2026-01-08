#!/bin/bash

echo "Checking YapPerce Marketplace Services..."
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
    local name=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is running at $url"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not accessible at $url"
        return 1
    fi
}

# Check services
check_service "Frontend" "http://localhost:3000"
check_service "User Service" "http://localhost:4010/graphql"
check_service "Product Service" "http://localhost:4011/graphql"
check_service "Order Service" "http://localhost:4012/graphql"
check_service "Payment Service" "http://localhost:4013/graphql"
check_service "ShipXpress Mock" "http://localhost:4014/graphql"

echo ""
echo "=========================================="
echo "Check complete!"
echo ""
echo "If all services show ✓, you can access:"
echo "  - Frontend: http://localhost:3000"
echo "  - GraphQL Playgrounds: http://localhost:4010-4014/graphql"

