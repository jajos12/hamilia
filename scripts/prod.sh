#!/bin/bash
# Production script - starts backend only (frontend on Vercel)

set -e

echo "Starting Hamilia production server..."

# Check if conda env exists
if ! conda env list | grep -q "hamilia"; then
    echo "Creating conda environment..."
    conda create -n hamilia python=3.11 -y
    conda run -n hamilia pip install -e .
fi

# Start backend
echo "Starting backend on http://localhost:8000..."
conda run -n hamilia uvicorn src.main:app --host 0.0.0.0 --port 8000
