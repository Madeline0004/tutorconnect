#!/bin/bash
echo "================================================"
echo "   TutorConnect Backend Setup"
echo "================================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 not found. Please install Python 3.9+"
    exit 1
fi

# Create virtual env if not exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Copy env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your PostgreSQL credentials before continuing!"
    echo "   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/tutorconnect"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Start server
echo "Starting FastAPI server on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
