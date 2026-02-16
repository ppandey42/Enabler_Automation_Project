@echo off
echo ===============================================
echo       Stopping LS ENABLER Servers
echo ===============================================

:: Kill Python processes (backend)
echo [INFO] Stopping backend servers...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im uvicorn.exe >nul 2>&1

:: Kill Node processes (frontend) 
echo [INFO] Stopping frontend servers...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

:: Wait a moment
timeout /t 2 /nobreak >nul

echo [✓] All LS ENABLER servers have been stopped.
echo.
pause