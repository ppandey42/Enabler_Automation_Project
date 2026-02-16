@echo off
setlocal enabledelayedexpansion
title LS Enabler - Ultimate Startup Script

echo ================================================================
echo                    LS ENABLER ULTIMATE STARTUP
echo ================================================================
echo.

:: Set directories
set "BASE_DIR=%~dp0"
set "BACKEND_DIR=%BASE_DIR%backend"
set "FRONTEND_DIR=%BASE_DIR%frontend"

:: Colors for output (if supported)
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "RED=%ESC%[31m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "RESET=%ESC%[0m"

echo %BLUE%Step 1: Cleaning up existing processes...%RESET%
:: Kill existing processes more aggressively
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq python.exe" /fo csv ^| find /v "Image"') do (
    taskkill /pid %%i /f >nul 2>&1
)
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo csv ^| find /v "Image"') do (
    taskkill /pid %%i /f >nul 2>&1
)

:: Wait for cleanup
timeout /t 2 /nobreak >nul

echo %BLUE%Step 2: Starting Backend Server...%RESET%
cd /d "%BACKEND_DIR%"

:: Start backend in its own window
start "LS-Enabler Backend" /min cmd /k "echo Starting Backend... && python minimal_test.py"

:: Wait for backend to start
echo %YELLOW%Waiting for backend to initialize...%RESET%
timeout /t 4 /nobreak >nul

:: Check if backend is running
netstat -ano | findstr "8000.*LISTENING" >nul
if %errorlevel% equ 0 (
    echo %GREEN%✓ Backend started successfully on port 8000%RESET%
) else (
    echo %RED%✗ Backend failed to start%RESET%
    echo Trying alternative approach...
    start "LS-Enabler Backend Alt" cmd /k "python reliable_server.py"
    timeout /t 3 /nobreak >nul
)

echo %BLUE%Step 3: Starting Frontend Server...%RESET%
cd /d "%FRONTEND_DIR%"

:: Start frontend in its own window
start "LS-Enabler Frontend" cmd /k "echo Starting Frontend... && npm run dev"

:: Wait for frontend to start
echo %YELLOW%Waiting for frontend to initialize...%RESET%
timeout /t 6 /nobreak >nul

:: Check if frontend is running
netstat -ano | findstr "5173.*LISTENING" >nul
if %errorlevel% equ 0 (
    echo %GREEN%✓ Frontend started successfully on port 5173%RESET%
) else (
    echo %YELLOW%Frontend may still be starting...%RESET%
)

echo.
echo %GREEN%================================================================%RESET%
echo %GREEN%                   STARTUP COMPLETE!%RESET%
echo %GREEN%================================================================%RESET%
echo.
echo %BLUE%Services:%RESET%
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo %BLUE%Test URLs:%RESET%
echo   Health:   http://localhost:8000/health
echo   Main App: http://localhost:5173
echo.
echo %YELLOW%Both services are running in separate windows.%RESET%
echo %YELLOW%Close those windows to stop the services.%RESET%
echo.
echo %YELLOW%If you encounter "ERR_CONNECTION_REFUSED":
echo 1. Check Windows Firewall settings
echo 2. Try running as Administrator
echo 3. Check antivirus software%RESET%
echo.

:: Open the application in browser automatically
echo %BLUE%Opening application in browser...%RESET%
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo %GREEN%Setup complete! Press any key to close this window.%RESET%
pause >nul

endlocal