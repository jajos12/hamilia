#!/bin/bash
# Development script - starts both backend and frontend

set -e

echo "Starting Hamilia development servers..."

# Check if conda env exists
if ! conda env list | grep -q "hamilia"; then
    echo "Creating conda environment..."
    conda create -n hamilia python=3.11 -y
fi

# Start backend in background
echo "Starting backend on http://localhost:8000..."
conda run -n hamilia uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on http://localhost:3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!

# Handle cleanup
cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "Hamilia is running:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"

wait
