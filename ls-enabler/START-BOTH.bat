@echo off
echo === LS ENABLER STARTUP SCRIPT ===
echo.

:: Set the base directory
set BASE_DIR=C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler

:: Kill any existing processes on our ports
echo Cleaning up existing processes...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":8004"') do (
    if not "%%i"=="0" (
        echo Killing process %%i using port 8004
        taskkill /PID %%i /F >nul 2>&1
    )
)

for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":5173"') do (
    if not "%%i"=="0" (
        echo Killing process %%i using port 5173
        taskkill /PID %%i /F >nul 2>&1
    )
)

echo.
echo Starting Backend Server on port 8004...
cd /d "%BASE_DIR%\backend"
start "Backend Server" cmd /k "python simple_main.py"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server on port 5173...
cd /d "%BASE_DIR%\frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo === STARTUP COMPLETE ===
echo Backend: http://localhost:8004
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this script (servers will continue running in their own windows)
pause >nul