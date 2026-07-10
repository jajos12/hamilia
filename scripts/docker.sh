#!/bin/bash
# Docker script - starts full stack with docker-compose

set -e

echo "Starting Hamilia with Docker..."

# Build and start containers
docker-compose up --build -d

# Get mapped ports
BACKEND_PORT=$(docker-compose port backend 8000 2>/dev/null | cut -d: -f2 || echo "8000")
FRONTEND_PORT=$(docker-compose port frontend 3000 2>/dev/null | cut -d: -f2 || echo "3000")

echo ""
echo "Hamilia is running:"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  API Docs: http://localhost:$BACKEND_PORT/docs"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop: docker-compose down"
