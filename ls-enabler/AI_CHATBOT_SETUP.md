# AI Chatbot Setup Guide for LS Enabler

## 🚀 Quick Setup (Windows)

### 1. Install Ollama (Local AI)
```bash
# Download from: https://ollama.ai/download
# Or use winget:
winget install ollama
```

### 2. Install AI Model
```bash
# Small model (3GB) - Good for basic chat
ollama pull llama2:7b

# Larger model (13GB) - Better responses  
ollama pull llama2:13b

# Code-focused model (4GB)
ollama pull codellama:7b
```

### 3. Install Python Dependencies
```bash
cd backend
pip install ollama chromadb sentence-transformers langchain
```

### 4. Test Setup
```bash
# Start Ollama (should auto-start)
ollama serve

# Test in Python
python -c "import ollama; print(ollama.list())"
```

## 🛡️ Security Features

✅ **100% Offline** - No data leaves your network  
✅ **Local Storage** - All documents stored locally  
✅ **Private Models** - AI runs on your hardware  
✅ **Access Control** - Integrate with your auth system  

## 📊 Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| Llama2 7B | 3.8GB | Fast | Good | General chat |
| Llama2 13B | 7.3GB | Medium | Better | Complex Q&A |
| CodeLlama 7B | 3.8GB | Fast | Good | Code help |
| Mistral 7B | 4.1GB | Fast | Excellent | Professional use |

## 🔧 Integration Steps

### 1. Add to Backend Main
```python
# In backend/main.py
from app.routers import chatbot_ai

app.include_router(chatbot_ai.router, prefix="/api/chatbot", tags=["chatbot"])
```

### 2. Add to Frontend App
```tsx
// In frontend/src/App.tsx
import ChatBot from './components/ChatBot';

// Add in your main component:
{isAuthenticated && <ChatBot />}
```

## 📄 Document Upload Formats

Supported: `.txt`, `.pdf`, `.docx`, `.md`, `.json`  
Auto-processing: Chunking, embedding, indexing  

## 🎯 Use Cases

- **Technical Support**: Code troubleshooting  
- **Company Procedures**: Policy Q&A  
- **Training Material**: Interactive learning  
- **Documentation**: Smart search  

## ⚡ Performance Tips

- **RAM**: 8GB+ recommended  
- **GPU**: Optional, speeds up inference  
- **Storage**: 20GB+ for multiple models  
- **Network**: None needed after setup!  

## 🔐 Enterprise Security

- **Data Isolation**: Each department can have separate knowledge bases  
- **Audit Logs**: Track all interactions  
- **Access Control**: Role-based permissions  
- **Encryption**: Secure document storage  

Would you like me to help you set this up?