# 🚀 LS ENABLER - Complete Installation Guide

This guide will help you get LS ENABLER running on your system in just a few minutes!

## 📋 Table of Contents
- [System Requirements](#system-requirements)
- [Quick Start (Recommended)](#quick-start-recommended)
- [Manual Installation](#manual-installation)
- [Docker Installation](#docker-installation)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

## 🖥️ System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 2GB free space
- **Internet**: Required for initial setup

### Required Software
- **Node.js** 18.0.0+ ([Download](https://nodejs.org/))
- **Python** 3.9.0+ ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))

## 🚀 Quick Start (Recommended)

### Option 1: Windows Users
```bash
git clone https://github.com/ppandey42/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler
.\setup-windows.bat
```

### Option 2: Linux/Mac Users  
```bash
git clone https://github.com/ppandey42/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler
chmod +x setup.sh
./setup.sh
```

**That's it!** 🎉 The setup script will:
- ✅ Check all system requirements
- ✅ Install all dependencies automatically
- ✅ Create virtual environments
- ✅ Start both backend and frontend servers
- ✅ Open the application in your browser

## ⚙️ Manual Installation

If you prefer manual setup or the automated script doesn't work:

### Step 1: Clone the Repository
```bash
git clone https://github.com/ppandey42/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler
```

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file (optional)
cp .env.example .env
```

### Step 3: Frontend Setup  
```bash
cd ../frontend

# Install Node.js dependencies
npm install

# Create environment file (optional)
cp .env.example .env
```

### Step 4: Start the Servers

**Terminal 1 (Backend):**
```bash
cd backend
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

python main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs

## 🐳 Docker Installation

For containerized deployment:

```bash
git clone https://github.com/ppandey42/Enabler_Automation_Project.git
cd Enabler_Automation_Project/ls-enabler

# Build and start with Docker Compose
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

Access the application at http://localhost:5173

## 🛠️ Development Workflow

### Starting Development Servers

**Windows:**
```bash
.\start-dev.bat
```

**Linux/Mac:**
```bash
./start-dev.sh
```

### Stopping Servers

**Windows:**
```bash
.\stop-servers.bat
```

**Linux/Mac:**
```bash
./stop-servers.sh
```

### Key Commands

| Task | Windows | Linux/Mac |
|------|---------|-----------|
| Initial Setup | `.\setup-windows.bat` | `./setup.sh` |
| Start Development | `.\start-dev.bat` | `./start-dev.sh` |  
| Stop All Servers | `.\stop-servers.bat` | `./stop-servers.sh` |

## 🐛 Troubleshooting

### Common Issues

#### ❌ Port Already in Use
**Problem**: `Error: Port 8000/5173 is already in use`

**Solution**:
```bash
# Windows
.\stop-servers.bat

# Linux/Mac  
./stop-servers.sh

# Or manually kill processes
# Windows:
netstat -ano | findstr :8000
taskkill /PID [PID_NUMBER] /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

#### ❌ Python Virtual Environment Issues
**Problem**: Virtual environment activation fails

**Solution**:
```bash
# Delete existing venv and recreate
rm -rf backend/venv  # Linux/Mac
rmdir /s backend\venv  # Windows

cd backend
python -m venv venv
# Continue with normal activation
```

#### ❌ Node.js Dependencies Issues
**Problem**: `npm install` fails

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json  # Linux/Mac
rmdir /s node_modules & del package-lock.json  # Windows

npm cache clean --force
npm install
```

#### ❌ Permission Issues (Linux/Mac)
**Problem**: Permission denied when running scripts

**Solution**:
```bash
chmod +x setup.sh start-dev.sh stop-servers.sh
```

### Getting Help

If you're still having issues:

1. **Check the logs**: Look at the terminal output for specific error messages
2. **Verify requirements**: Ensure Node.js and Python versions meet requirements
3. **Clean installation**: Delete the project folder and start fresh
4. **Check system resources**: Ensure you have enough RAM and disk space

## 🔧 System-Specific Notes

### Windows
- Use **PowerShell** or **Command Prompt** as Administrator if you encounter permission issues
- Windows Defender might flag Python scripts - add project folder to exceptions
- Use **Git Bash** for a better terminal experience

### macOS  
- Install **Homebrew** for easier package management:
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew install node python3 git
  ```

### Linux
- Ubuntu/Debian:
  ```bash
  sudo apt update
  sudo apt install nodejs npm python3 python3-pip python3-venv git
  ```
- CentOS/RHEL:
  ```bash
  sudo yum install nodejs npm python3 python3-pip git
  ```

## 🎯 Next Steps

Once everything is running:

1. **Explore the Dashboard**: Navigate through the different modules (RFI, REJECT, FS, TRB)
2. **Check API Documentation**: Visit http://localhost:8000/docs for interactive API docs
3. **Start Development**: The codebase is ready for customization and extension

## 📞 Support

If you encounter any issues not covered in this guide:

- Create an issue on the [GitHub repository](https://github.com/ppandey42/Enabler_Automation_Project/issues)  
- Check existing issues for similar problems
- Include your operating system, Python/Node.js versions, and error messages

Happy coding! 🚀