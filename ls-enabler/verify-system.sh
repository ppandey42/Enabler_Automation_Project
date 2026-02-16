#!/bin/bash

echo "=========================================="
echo "     LS ENABLER - System Verification"  
echo "=========================================="
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check system requirements
echo "Checking system requirements..."
echo

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_status "Git: $GIT_VERSION"
else
    print_error "Git is not installed"
    MISSING_DEPS=1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python: $PYTHON_VERSION"
else
    print_error "Python 3 is not installed"
    MISSING_DEPS=1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js: $NODE_VERSION"
else
    print_error "Node.js is not installed"
    MISSING_DEPS=1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm: v$NPM_VERSION"
else
    print_error "npm is not installed"
    MISSING_DEPS=1
fi

echo

# Check project structure
echo "Checking project structure..."
echo

if [ -d "backend" ]; then
    print_status "Backend directory exists"
    
    if [ -f "backend/main.py" ]; then
        print_status "Backend main.py found"
    else
        print_error "Backend main.py not found"
    fi
    
    if [ -f "backend/requirements.txt" ]; then
        print_status "Backend requirements.txt found"
    else
        print_error "Backend requirements.txt not found"
    fi
    
    if [ -d "backend/venv" ]; then
        print_status "Python virtual environment exists"
    else
        print_warning "Python virtual environment not found (run setup first)"
    fi
else
    print_error "Backend directory not found"
fi

if [ -d "frontend" ]; then
    print_status "Frontend directory exists"
    
    if [ -f "frontend/package.json" ]; then
        print_status "Frontend package.json found"
    else
        print_error "Frontend package.json not found"
    fi
    
    if [ -d "frontend/node_modules" ]; then
        print_status "Node.js dependencies installed"
    else
        print_warning "Node.js dependencies not found (run setup first)"
    fi
else
    print_error "Frontend directory not found"
fi

echo

# Summary
if [ -z "$MISSING_DEPS" ]; then
    echo -e "${GREEN}=========================================="
    echo -e "           System Ready! ✓"
    echo -e "==========================================${NC}"
    echo
    echo "You can now run the setup script:"
    echo "  ./setup.sh"
    echo
else
    echo -e "${RED}=========================================="
    echo -e "        Missing Dependencies!"
    echo -e "==========================================${NC}"
    echo
    echo "Please install the missing dependencies and run this script again."
    echo
fi