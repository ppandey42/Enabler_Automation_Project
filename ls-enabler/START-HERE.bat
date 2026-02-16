@echo off
echo.
echo 🚀 LS-Enabler Auto Startup
echo ═══════════════════════════════════════
echo.

REM Clean up existing processes
echo 🧹 Cleaning up existing processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

REM Start backend with auto-port detection
echo 🔧 Starting Backend Server (auto-detecting port)...
cd /d "%~dp0backend"
start "LS-Enabler Backend" python simple_main.py

timeout /t 3 >nul

REM Start frontend with dynamic config
echo 🎨 Starting Frontend Server...
cd /d "%~dp0frontend"
start "LS-Enabler Frontend" npm run dev

timeout /t 3 >nul

echo.
echo ✅ Both services starting successfully!
echo.
echo 📖 Instructions:
echo   • Backend: Automatically finds available port 8000+
echo   • Frontend: Automatically detects backend port
echo   • Check the opened terminal windows for URLs
echo   • Open your browser to the frontend URL
echo.
echo 💡 To stop: Close both terminal windows or press Ctrl+C in them
echo.

pause