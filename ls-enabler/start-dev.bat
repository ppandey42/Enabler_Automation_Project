@echo off
echo ===============================================
echo    Starting LS ENABLER Development Servers
echo ===============================================
echo.

:: Check if setup has been run
if not exist "backend\venv" (
    echo [ERROR] Backend environment not found!
    echo Please run setup-windows.bat first.
    echo.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not found!
    echo Please run setup-windows.bat first.
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting backend server...
start "LS ENABLER Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python main.py"

echo [INFO] Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

echo [INFO] Starting frontend server...
start "LS ENABLER Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [INFO] Waiting for servers to start...
timeout /t 8 /nobreak >nul

echo [INFO] Opening application in browser...
start http://localhost:5173

echo.
echo ===============================================
echo     LS ENABLER Development Servers Started!
echo ===============================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo The application should open automatically in your browser.
echo.
echo To stop the servers, close the terminal windows or run:
echo .\stop-servers.bat
echo.
echo Happy coding! 🚀
echo.
pause