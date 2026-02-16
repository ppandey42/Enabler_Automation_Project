#!/usr/bin/env pwsh
# Automatic startup script for LS-Enabler application

Write-Host "🚀 Starting LS-Enabler Application..." -ForegroundColor Green

# Kill any existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Navigate to project directory
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath
Write-Host "📂 Working directory: $projectPath" -ForegroundColor Cyan

# Start Backend (will auto-detect available port)
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Blue
$backendPath = Join-Path $projectPath "backend"
$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    python simple_main.py
} -ArgumentList $backendPath

Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if backend port file was created
$portFile = Join-Path $projectPath "frontend/.backend-port"
$attempts = 0
$maxAttempts = 10

while (-not (Test-Path $portFile) -and $attempts -lt $maxAttempts) {
    Write-Host "⏳ Waiting for backend to save port info... ($($attempts + 1)/$maxAttempts)" -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    $attempts++
}

if (Test-Path $portFile) {
    $portInfo = Get-Content $portFile | ConvertFrom-Json
    Write-Host "✅ Backend started on port: $($portInfo.backend_port)" -ForegroundColor Green
    Write-Host "🌐 Backend URL: $($portInfo.backend_url)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Backend port detection failed, continuing anyway..." -ForegroundColor Yellow
}

# Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Blue
$frontendPath = Join-Path $projectPath "frontend"
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $frontendPath

Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Display status
Write-Host ""
Write-Host "🎉 LS-Enabler Application Started Successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if (Test-Path $portFile) {
    $portInfo = Get-Content $portFile | ConvertFrom-Json
    Write-Host "🔧 Backend:  $($portInfo.backend_url)" -ForegroundColor Blue
}

# Find frontend port by checking common ports
$frontendPort = $null
for ($port = 5173; $port -le 5190; $port++) {
    $connection = Test-NetConnection -ComputerName "localhost" -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($connection) {
        $frontendPort = $port
        break
    }
}

if ($frontendPort) {
    Write-Host "🎨 Frontend: http://localhost:$frontendPort" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🌐 Open your browser and visit: http://localhost:$frontendPort" -ForegroundColor Yellow
} else {
    Write-Host "🎨 Frontend: Starting... (check terminal for port)" -ForegroundColor Blue
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "💡 Press Ctrl+C to stop all services" -ForegroundColor Cyan
Write-Host ""

# Keep script running and monitor jobs
try {
    while ($true) {
        # Check if jobs are still running
        $backendRunning = $backendJob.State -eq "Running"
        $frontendRunning = $frontendJob.State -eq "Running"
        
        if (-not $backendRunning -and -not $frontendRunning) {
            Write-Host "⚠️  Both services stopped" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "🛑 Stopping services..." -ForegroundColor Red
} finally {
    # Cleanup
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Kill processes again
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ All services stopped" -ForegroundColor Green
}