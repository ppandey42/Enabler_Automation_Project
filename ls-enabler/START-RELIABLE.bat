@echo off
echo ==========================================
echo   LS ENABLER - RELIABLE STARTUP SCRIPT
echo ==========================================
echo.

:: Install required Python packages if needed
echo Installing required packages...
pip install psutil fastapi uvicorn python-multipart --quiet
if %errorlevel% neq 0 (
    echo Warning: Some packages may not have installed correctly
    echo This is usually fine - the system will use fallback methods
)

echo.
echo Starting LS Enabler services...
echo.

:: Run the Python startup manager
python startup_manager.py

echo.
echo Script finished. Press any key to exit.
pause >nul