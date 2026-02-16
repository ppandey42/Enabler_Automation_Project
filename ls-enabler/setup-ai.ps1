# AI Chatbot Setup Script for LS Enabler
# Run this after installing Ollama from https://ollama.ai/download

Write-Host "🤖 Setting up LS Enabler AI Chatbot..." -ForegroundColor Cyan

# Check if Ollama is installed
try {
    $ollamaVersion = ollama --version
    Write-Host "✅ Ollama is installed: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama not found. Please install from https://ollama.ai/download" -ForegroundColor Red
    exit 1
}

# Start Ollama service
Write-Host "🚀 Starting Ollama service..." -ForegroundColor Yellow
Start-Process "ollama" -ArgumentList "serve" -NoNewWindow

# Wait a moment for service to start
Start-Sleep -Seconds 3

# Pull AI models
Write-Host "📦 Downloading AI models..." -ForegroundColor Yellow

# Small, fast model for basic chat (3GB)
Write-Host "  - Downloading Llama2 7B (3GB)..." -ForegroundColor Cyan
ollama pull llama2:7b

# Alternative: Mistral for better performance
# Write-Host "  - Downloading Mistral 7B (4GB)..." -ForegroundColor Cyan
# ollama pull mistral

Write-Host "✅ AI models downloaded successfully!" -ForegroundColor Green

# Test the setup
Write-Host "🧪 Testing AI integration..." -ForegroundColor Yellow
$testScript = @"
import ollama
import chromadb
import sentence_transformers

try:
    # Test Ollama
    models = ollama.list()
    print(f"✅ Ollama models: {len(models['models'])} available")
    
    # Test ChromaDB
    client = chromadb.Client()
    print("✅ ChromaDB: Connected")
    
    # Test embeddings
    model = sentence_transformers.SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Embeddings: Model loaded")
    
    print("🎉 All AI components working!")
    
except Exception as e:
    print(f"❌ Error: {e}")
"@

python -c $testScript

Write-Host "`n🎉 LS Enabler AI Chatbot Setup Complete!" -ForegroundColor Green
Write-Host "`nWhat you can do now:" -ForegroundColor White
Write-Host "  • Upload company documents via the chatbot" -ForegroundColor Gray
Write-Host "  • Ask questions about your data" -ForegroundColor Gray
Write-Host "  • Get instant, secure AI responses" -ForegroundColor Gray
Write-Host "  • All data stays on your network!" -ForegroundColor Gray

Write-Host "`nTo start the full application:" -ForegroundColor White
Write-Host "  1. Backend: python -m uvicorn main:app --reload" -ForegroundColor Cyan
Write-Host "  2. Frontend: npm run dev" -ForegroundColor Cyan
Write-Host "  3. Look for 🤖 chat icon in your LS Enabler app!" -ForegroundColor Cyan