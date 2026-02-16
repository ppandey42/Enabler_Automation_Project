@echo off
echo Starting LS ENABLER Development Servers...

echo.
echo [1] Starting Backend Server...
cd /d "C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\backend"
start "LS ENABLER Backend" powershell -Command "cd 'C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\backend'; python -m uvicorn main:app --reload --port 8000; Read-Host 'Press Enter to close'"

timeout /t 3 /nobreak >nul

echo [2] Starting Frontend Server...
cd /d "C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\frontend"
start "LS ENABLER Frontend" powershell -Command "cd 'C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\frontend'; npm run dev; Read-Host 'Press Enter to close'"

echo.
echo Both servers are starting in separate windows...
echo.
echo IMPORTANT: Wait for both servers to start, then open:
echo   Frontend Dashboard: http://localhost:5173
echo   Backend API: http://localhost:8000
echo   API Documentation: http://localhost:8000/docs
echo.
echo If you see a blank screen, check the browser developer console (F12) for errors.
echo.
pause