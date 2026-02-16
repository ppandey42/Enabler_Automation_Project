#!/bin/bash

# LS ENABLER Development Setup Script

echo "Setting up LS ENABLER development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

echo "✅ Backend setup complete"

# Setup frontend
echo "📦 Setting up frontend..."
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

echo "✅ Frontend setup complete"

cd ..

echo "🚀 Setup complete! Run the following commands to start the development servers:"
echo ""
echo "Backend (in ./backend):"
echo "  source venv/bin/activate  # Activate virtual environment"
echo "  uvicorn main:app --reload --port 8000"
echo ""
echo "Frontend (in ./frontend):"
echo "  npm run dev"
echo ""
echo "Or use Docker:"
echo "  docker-compose up --build"
echo ""
echo "Access the application at http://localhost:5173"
echo "API documentation at http://localhost:8000/docs"