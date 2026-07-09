#!/bin/bash
# Stop all Hamilia services

set -e

echo "Stopping Hamilia..."

# Stop docker containers if running
if docker-compose ps | grep -q "hamilia"; then
    docker-compose down
fi

# Kill any running uvicorn processes
pkill -f "uvicorn src.main:app" 2>/dev/null || true

# Kill any running next dev processes
pkill -f "next dev" 2>/dev/null || true

echo "Hamilia stopped."
