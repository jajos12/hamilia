#!/bin/bash
# Production script - starts backend only (frontend on Vercel)

set -e

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
BACKEND_PORT=$(find_port 8000)

echo "Starting Hamilia production server on port $BACKEND_PORT (env: $CONDA_ENV)..."

cd /home/jajos/code/personal_projects/agon
$UVICORN src.main:app --host 0.0.0.0 --port $BACKEND_PORT
