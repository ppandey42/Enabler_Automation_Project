#!/bin/bash

echo "==============================================="
echo "       LS ENABLER - Setup Script"
echo "==============================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on supported OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
else
    print_error "Unsupported operating system. Please use the Windows setup script."
    exit 1
fi

print_info "Detected OS: $OS"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    echo "Please install Git:"
    if [[ "$OS" == "macOS" ]]; then
        echo "  brew install git"
        echo "  Or download from: https://git-scm.com/downloads"
    else
        echo "  sudo apt-get install git (Ubuntu/Debian)"
        echo "  sudo yum install git (CentOS/RHEL)"
        echo "  Or download from: https://git-scm.com/downloads"
    fi
    exit 1
fi
print_status "Git is installed ($(git --version))"

# Check if Python is installed
if ! command -v $PYTHON_CMD &> /dev/null; then
    print_error "Python 3 is not installed"
    echo "Please install Python 3.9+:"
    if [[ "$OS" == "macOS" ]]; then
        echo "  brew install python3"
        echo "  Or download from: https://www.python.org/downloads/"
    else
        echo "  sudo apt-get install python3 python3-pip python3-venv (Ubuntu/Debian)"
        echo "  sudo yum install python3 python3-pip (CentOS/RHEL)"
        echo "  Or download from: https://www.python.org/downloads/"
    fi
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
print_status "Python is installed ($PYTHON_VERSION)"

# Check Python version (should be 3.9+)
PYTHON_VER=$($PYTHON_CMD -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
REQUIRED_VER="3.9"
if ! $PYTHON_CMD -c "import sys; exit(0 if sys.version_info >= (3, 9) else 1)" 2>/dev/null; then
    print_warning "Python version $PYTHON_VER detected. Python 3.9+ is recommended."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+:"
    if [[ "$OS" == "macOS" ]]; then
        echo "  brew install node"
        echo "  Or download from: https://nodejs.org/"
    else
        echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs (Ubuntu/Debian)"
        echo "  Or download from: https://nodejs.org/"
    fi
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js is installed ($NODE_VERSION)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    echo "Please reinstall Node.js with npm included"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_status "npm is installed (v$NPM_VERSION)"

echo
echo "==============================================="
echo "     Setting up Backend (Python FastAPI)"
echo "==============================================="

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Create virtual environment
print_info "Creating Python virtual environment..."
$PYTHON_CMD -m venv venv
if [ $? -ne 0 ]; then
    print_error "Failed to create virtual environment"
    exit 1
fi
print_status "Virtual environment created"

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_info "Upgrading pip..."
$PIP_CMD install --upgrade pip

# Install Python dependencies
print_info "Installing Python dependencies..."
$PIP_CMD install -r requirements.txt
if [ $? -ne 0 ]; then
    print_error "Failed to install Python dependencies"
    exit 1
fi
print_status "Python dependencies installed"

echo
echo "==============================================="
echo "     Setting up Frontend (React + TypeScript)"
echo "==============================================="

# Navigate to frontend directory
cd "../frontend"

# Install Node.js dependencies
print_info "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install Node.js dependencies"
    exit 1
fi
print_status "Node.js dependencies installed"

echo
echo "==============================================="
echo "        Starting Development Servers"
echo "==============================================="

# Navigate back to root directory
cd ".."

print_info "Starting backend and frontend servers..."
print_info "Backend: http://localhost:8000"
print_info "Frontend: http://localhost:5173"
echo

# Create a simple startup script for future use
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "Starting LS ENABLER Development Servers..."

# Start backend in background
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Servers started!"
echo "Backend: http://localhost:8000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo
echo "To stop servers, run: ./stop-servers.sh"

# Wait for user input
echo "Press Ctrl+C to stop all servers"
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-dev.sh

# Create stop script
cat > stop-servers.sh << 'EOF'
#!/bin/bash
echo "Stopping LS ENABLER servers..."

# Kill Python processes (backend)
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

# Kill Node processes (frontend)
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

echo "All servers stopped."
EOF

chmod +x stop-servers.sh

# Start backend server
print_info "Starting backend server..."
cd backend
source venv/bin/activate
$PYTHON_CMD main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
print_info "Waiting for backend to initialize..."
sleep 8

# Start frontend server
print_info "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
print_info "Waiting for frontend to initialize..."
sleep 5

# Try to open browser
if command -v xdg-open > /dev/null; then
    print_info "Opening application in browser..."
    xdg-open http://localhost:5173
elif command -v open > /dev/null; then
    print_info "Opening application in browser..."
    open http://localhost:5173
fi

echo
echo "==============================================="
echo "            Setup Complete! 🚀"
echo "==============================================="
echo
echo "Your LS ENABLER application is now running:"
echo
echo -e "Frontend:  ${GREEN}http://localhost:5173${NC}"
echo -e "Backend:   ${GREEN}http://localhost:8000${NC}"
echo -e "API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo
echo "The application should open automatically in your browser."
echo
echo "Useful commands:"
echo "  ./start-dev.sh     - Start development servers"
echo "  ./stop-servers.sh  - Stop all servers"
echo
echo "Happy coding! 🎉"
echo

# Keep script running to maintain servers
echo "Press Ctrl+C to stop all servers and exit"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped. Goodbye!'; exit" INT

wait