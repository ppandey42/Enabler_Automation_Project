Write-Host "🤖 LS Enabler AI Status Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Ollama Installation
Write-Host "1️⃣ Checking Ollama Installation..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version 2>$null
    Write-Host "   ✅ Ollama installed: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Ollama not installed" -ForegroundColor Red
    Write-Host "   📥 Download from: https://ollama.ai/download" -ForegroundColor Cyan
    exit 1
}

# 2. Check Ollama Process
Write-Host "2️⃣ Checking Ollama Process..." -ForegroundColor Yellow
$ollamaProcess = Get-Process ollama -ErrorAction SilentlyContinue
if ($ollamaProcess) {
    Write-Host "   ✅ Ollama service is running (PID: $($ollamaProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Ollama service not running" -ForegroundColor Red
    Write-Host "   🚀 Starting Ollama..." -ForegroundColor Cyan
    Start-Process "ollama" -ArgumentList "serve" -NoNewWindow
    Start-Sleep -Seconds 3
}

# 3. Check Available Models
Write-Host "3️⃣ Checking AI Models..." -ForegroundColor Yellow
$models = ollama list 2>$null
if ($models -like "*llama*" -or $models -like "*mistral*") {
    Write-Host "   ✅ AI models available:" -ForegroundColor Green
    ollama list | Select-String "NAME|llama|mistral" | ForEach-Object { Write-Host "      $($_)" -ForegroundColor Gray }
} else {
    Write-Host "   ⚠️  No AI models found" -ForegroundColor Red
    Write-Host "   📦 To install a model, run:" -ForegroundColor Cyan
    Write-Host "      ollama pull llama3.2" -ForegroundColor Gray
}

# 4. Test AI Response
Write-Host "4️⃣ Testing AI Response..." -ForegroundColor Yellow
$testResponse = ollama run llama3.2:latest "Respond with exactly: AI Working" 2>$null
if ($testResponse -like "*AI Working*") {
    Write-Host "   ✅ AI responding correctly" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  AI response: $testResponse" -ForegroundColor Yellow
}

# 5. Check Python Dependencies
Write-Host "5️⃣ Checking Python Dependencies..." -ForegroundColor Yellow
$pythonTest = python -c "
import sys
try:
    import ollama
    print('✅ ollama')
except:
    print('❌ ollama')

try:
    import chromadb
    print('✅ chromadb')
except:
    print('❌ chromadb')
    
try:
    import sentence_transformers
    print('✅ sentence-transformers')
except:
    print('❌ sentence-transformers')
    
try:
    import aiohttp
    print('✅ aiohttp')
except:
    print('❌ aiohttp')
" 2>$null

$pythonTest | ForEach-Object { 
    if ($_ -like "✅*") {
        Write-Host "   $_" -ForegroundColor Green 
    } else {
        Write-Host "   $_" -ForegroundColor Red
    }
}

# 6. Test Backend Integration
Write-Host "6️⃣ Testing Backend Integration..." -ForegroundColor Yellow
Set-Location "C:\Users\prachpan\OneDrive - AMDOCS\Desktop\Automation\ls-enabler\backend"
$backendTest = python -c "
try:
    from app.routers import chatbot_ai
    print('✅ Backend AI router loads successfully')
except Exception as e:
    print(f'❌ Backend error: {e}')
" 2>$null

if ($backendTest -like "*✅*") {
    Write-Host "   $backendTest" -ForegroundColor Green
} else {
    Write-Host "   $backendTest" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Summary:" -ForegroundColor White
Write-Host "============" -ForegroundColor White
Write-Host "If all items show ✅, your AI is ready!" -ForegroundColor Green
Write-Host "If any show ❌, follow the setup instructions." -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 To start your AI-enabled app:" -ForegroundColor Cyan
Write-Host "   Backend: python -m uvicorn main:app --reload" -ForegroundColor Gray
Write-Host "   Frontend: npm run dev" -ForegroundColor Gray