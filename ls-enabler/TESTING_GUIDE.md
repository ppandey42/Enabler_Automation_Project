# 🤖 LS Enabler GPT - Testing Guide

## 🚀 Quick Test Steps

### 1. **Start the Application**
- ✅ Backend: Running on port 8000
- ✅ Frontend: Running on http://localhost:5174
- ✅ Ollama: Active with Llama 3.2

### 2. **Login to LS Enabler**
- Username: `p`
- Password: `p`

### 3. **Access Enabler GPT**
- Click on the **"ENABLER GPT"** module card
- You'll see: "AI-Powered Chat Assistant - Get instant help, answers, and guidance for your operations"
- This will open the dedicated AI chat page

### 4. **Test AI Features**

#### **Basic Chat Test:**
- Type: "Hello, are you working?"
- Expected: AI responds with confirmation

#### **Company Q&A Test:**
- Try: "What are the key company policies I should know about?"
- Try: "How do I troubleshoot common technical issues?"

#### **Document Upload Test:**
- Click "Choose File" button
- Upload a .txt, .pdf, or .docx file
- Click "Upload" button
- AI will confirm document processing
- Ask questions about the uploaded content

### 5. **Expected Features**

#### **✅ Full-Page Experience:**
- Beautiful gradient background
- Professional chat interface
- Sidebar with quick actions and status
- Upload area for documents

#### **✅ AI Capabilities:**
- Offline processing (100% secure)
- Context-aware responses
- Source citations for answers
- Document learning

#### **✅ Quick Actions:**
- 📋 Company Policies
- 🔧 Technical Help  
- 📊 RFI Procedures
- 🎓 Training Resources

#### **✅ Security Features:**
- 🔒 100% Offline operation
- Local data processing
- No external API calls
- Company data stays internal

## 🎯 Demo Conversation Examples

### **Example 1: Basic Help**
```
You: "What can you help me with?"
AI: "I can help with company procedures, technical issues, document analysis..."
```

### **Example 2: Technical Support**
```
You: "How do I handle a failed job in the system?"
AI: "Here are the standard procedures for job failure handling..."
```

### **Example 3: Document Upload**
```
You: [Upload company manual]
AI: "Document processed! I can now answer questions about XYZ procedures..."
You: "What's the process for new employee onboarding?"
AI: "According to the uploaded manual, the onboarding process involves..."
```

## 🐛 Troubleshooting

### **If AI doesn't respond:**
1. Check Ollama: `ollama ps`
2. Verify backend: http://localhost:8000/docs
3. Check browser console for errors

### **If upload fails:**
1. Ensure file is .txt, .pdf, .docx, or .md
2. Check file size (< 50MB recommended)
3. Verify backend is running

## 🎉 Success Indicators

- ✅ Chat page opens smoothly
- ✅ AI responds to basic questions  
- ✅ Document upload works
- ✅ Quick actions populate input
- ✅ Sources are cited when available
- ✅ Back button returns to dashboard

**Your LS Enabler GPT is now fully integrated! 🚀**