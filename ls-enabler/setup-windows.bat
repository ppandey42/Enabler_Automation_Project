@echo off
echo ===============================================
echo       LS ENABLER - Windows Setup Script
echo ===============================================
echo.

:: Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)
echo [✓] Git is installed

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.9+ from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [✓] Python is installed

:: Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [✓] Python version: %PYTHON_VERSION%

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from: https://nodejs.org/
    pause
    exit /b 1
)
echo [✓] Node.js is installed

:: Check Node.js version
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js version: %NODE_VERSION%

:: Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    echo Please reinstall Node.js with npm included
    pause
    exit /b 1
)
echo [✓] npm is installed

echo.
echo ===============================================
echo     Setting up Backend (Python FastAPI)
echo ===============================================

:: Navigate to backend directory
cd /d "%~dp0backend"

:: Create virtual environment
echo [INFO] Creating Python virtual environment...
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)
echo [✓] Virtual environment created

:: Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

:: Upgrade pip
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

:: Install Python dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)
echo [✓] Python dependencies installed

echo.
echo ===============================================
echo     Setting up Frontend (React + TypeScript)
echo ===============================================

:: Navigate to frontend directory
cd /d "%~dp0frontend"

:: Install Node.js dependencies
echo [INFO] Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo [✓] Node.js dependencies installed

echo.
echo ===============================================
echo        Starting Development Servers
echo ===============================================

:: Navigate back to root directory
cd /d "%~dp0"

:: Start the development servers
echo [INFO] Starting backend and frontend servers...
echo [INFO] This will open two terminal windows
echo [INFO] Backend: http://localhost:8000
echo [INFO] Frontend: http://localhost:5173
echo.

:: Start backend server in new window
start "LS ENABLER Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python main.py"

:: Wait a moment for backend to start
timeout /t 5 /nobreak >nul

:: Start frontend server in new window
start "LS ENABLER Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait for servers to start
echo [INFO] Waiting for servers to start...
timeout /t 10 /nobreak >nul

:: Open browser
echo [INFO] Opening application in browser...
start http://localhost:5173

echo.
echo ===============================================
echo            Setup Complete! 
echo ===============================================
echo.
echo Your LS ENABLER application is now running:
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo The application should open automatically in your browser.
echo.
echo To stop the servers, close the terminal windows or use:
echo .\stop-servers.bat
echo.
echo Happy coding! 🚀
echo.
pause