#!/bin/bash
echo "================================================"
echo "   TutorConnect Frontend Setup"
echo "================================================"

# Check Node
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "Node version: $(node -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Start dev server
echo "Starting frontend on http://localhost:3000"
npm run dev
