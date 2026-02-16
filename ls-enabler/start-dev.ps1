# LS ENABLER Development Server Startup Script
Write-Host "=== LS ENABLER Development Setup ===" -ForegroundColor Green
Write-Host ""

# Set working directories
$backendPath = "C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\backend"
$frontendPath = "C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\frontend"

# Check if directories exist
if (!(Test-Path $backendPath)) {
    Write-Host "ERROR: Backend directory not found at $backendPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (!(Test-Path $frontendPath)) {
    Write-Host "ERROR: Frontend directory not found at $frontendPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Directories found" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "[1] Starting Backend Server..." -ForegroundColor Yellow
Set-Location $backendPath
Start-Process powershell -ArgumentList "-Command", "cd '$backendPath'; Write-Host 'Starting Backend...'; python -m uvicorn main:app --reload --port 8000; Read-Host 'Backend stopped. Press Enter to close'"

# Wait a moment
Start-Sleep 3

# Start Frontend Server  
Write-Host "[2] Starting Frontend Server..." -ForegroundColor Yellow
Set-Location $frontendPath
Start-Process powershell -ArgumentList "-Command", "cd '$frontendPath'; Write-Host 'Starting Frontend...'; npm run dev; Read-Host 'Frontend stopped. Press Enter to close'"

Write-Host ""
Write-Host "=== Servers Starting ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see a blank screen:" -ForegroundColor Yellow
Write-Host "1. Wait for both servers to fully start" -ForegroundColor White
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor White  
Write-Host "3. Press F12 and check Console tab for errors" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to close this window"