#!/bin/bash
# Development script - starts both backend and frontend

# Find available port starting from a base port
find_port() {
    local base=$1
    local port=$base
    while lsof -i :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            echo "ERROR: No available ports found" >&2
            exit 1
        fi
    done
    echo $port
}

# Detect which conda env has uvicorn
if [ -f "/home/jajos/miniconda3/envs/agon/bin/uvicorn" ]; then
    CONDA_ENV="agon"
elif [ -f "/home/jajos/miniconda3/envs/hamilia/bin/uvicorn" ]; then
    CONDA_ENV="hamilia"
else
    echo "ERROR: No conda env with uvicorn found."
    exit 1
fi

UVICORN="/home/jajos/miniconda3/envs/$CONDA_ENV/bin/uvicorn"

# Find available ports
BACKEND_PORT=$(find_port 8000)
FRONTEND_PORT=$(find_port $((BACKEND_PORT + 1)))

echo "Starting Hamilia development servers..."
echo "  Conda env: $CONDA_ENV"
echo "  Backend: http://localhost:$BACKEND_PORT"
echo "  Frontend: http://localhost:$FRONTEND_PORT"

# Kill any existing processes on these ports
kill $(lsof -t -i :$BACKEND_PORT) 2>/dev/null
kill $(lsof -t -i :$FRONTEND_PORT) 2>/dev/null
sleep 1

# Start backend
cd /home/jajos/code/personal_projects/agon
$UVICORN src.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
cd /home/jajos/code/personal_projects/agon/frontend
PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!

echo ""
echo "Hamilia is running:"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  API Docs: http://localhost:$BACKEND_PORT/docs"
echo ""
echo "Press Ctrl+C to stop"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
