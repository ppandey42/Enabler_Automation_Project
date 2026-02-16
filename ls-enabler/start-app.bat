@echo off
title LS-Enabler Application Starter
color 0A

echo.
echo 🚀 Starting LS-Enabler Application...
echo.

REM Kill existing processes
echo 🧹 Cleaning up existing processes...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start Backend
echo.
echo 🔧 Starting Backend Server...
cd /d "%~dp0backend"
start "LS-Enabler Backend" cmd /k "python simple_main.py"

REM Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo.
echo 🎨 Starting Frontend Server...
cd /d "%~dp0frontend"
start "LS-Enabler Frontend" cmd /k "npm run dev"

REM Wait for frontend
echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎉 LS-Enabler Application Started Successfully!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔧 Backend:  Check backend terminal window for port
echo 🎨 Frontend: Check frontend terminal window for port
echo.
echo 🌐 Open your browser and visit the frontend URL shown above
echo 💡 Close this window or press Ctrl+C to stop all services
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause