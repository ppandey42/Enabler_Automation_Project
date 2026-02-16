import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface AIStatus {
  ollama: string;
  knowledge_base_documents: number;
  embedding_model: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAIStatus();
    // Add welcome message
    setMessages([{
      id: Date.now().toString(),
      type: 'ai',
      content: 'Hello! I\'m your LS Enabler AI assistant. I can help you with company procedures, technical questions, and more. How can I assist you today?',
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/chatbot/ai-status');
      const status = await response.json();
      setAIStatus(status);
    } catch (error) {
      console.error('Failed to check AI status:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversation_id: 'default'
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    console.log('Upload started for file:', file.name);
    
    try {
      setIsLoading(true);
      console.log('Loading state set to true');
      
      // Show upload start message
      const startMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `⏳ **Uploading "${file.name}"...**\n\n📊 **Progress:** Starting upload...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, startMessage]);
      console.log('Start message added');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'uploaded');
      console.log('FormData prepared');

      // Update progress message
      setTimeout(() => {
        const progressMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `⏳ **Processing "${file.name}"...**\n\n📊 **Progress:** File uploaded, extracting content...`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev.slice(0, -1), progressMessage]);
        console.log('Progress message updated');
      }, 500);

      console.log('Making request to direct backend URL');
      // Use direct backend URL to bypass proxy issues with multipart/form-data
      const response = await fetch('http://localhost:8004/api/chatbot/upload-document', {
        method: 'POST',
        mode: 'cors',
        body: formData
      });

      console.log('Response received:', response.status);
      setIsLoading(false);

      if (response.ok) {
        const result = await response.json();
        console.log('Success result:', result);
        
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: `✅ **Document "${file.name}" uploaded successfully!**

📊 **Processing Details:**
- **Chunks processed**: ${result.chunks_processed || 'N/A'}
- **File saved to**: ${result.file_path || 'Server storage'}
- **Size**: ${(file.size / 1024).toFixed(1)} KB

🤖 **Ready to answer questions** about the document content!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev.slice(0, -1), successMessage]);
        checkAIStatus();
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsLoading(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'ai',
        content: `❌ **Failed to process "${file.name}"**

**Error**: ${error.message || 'Unknown error occurred'}

**Please try:**
- Checking browser console for detailed errors
- Ensuring the backend server is running
- Refreshing the page and trying again

**Debug Info**: Check browser console (F12) for technical details`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-bold">🤖 LS Enabler AI</h3>
          <p className="text-xs opacity-75">
            {aiStatus ? `${aiStatus.knowledge_base_documents} docs loaded` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 text-xs opacity-75">
                  📚 Sources: {message.sources.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex space-x-2">
          <input
            type="file"
            accept=".txt,.pdf,.docx,.md"
            onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded cursor-pointer transition-colors"
            title="Upload document"
          >
            📎
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;