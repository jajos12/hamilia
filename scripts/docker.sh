#!/bin/bash
# Docker script - starts full stack with docker-compose

set -e

echo "Starting Hamilia with Docker..."

# Build and start containers
docker-compose up --build -d

echo ""
echo "Hamilia is running:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop: docker-compose down"
