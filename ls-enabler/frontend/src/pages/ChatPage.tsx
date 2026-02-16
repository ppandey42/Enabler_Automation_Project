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

interface ChatPageProps {
  onBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAIStatus();
    // Add welcome message
    setMessages([{
      id: Date.now().toString(),
      type: 'ai',
      content: 'Welcome to LS Enabler GPT! I\'m your AI assistant powered by advanced language models. I can help you with:\n\n• Company policies and procedures\n• Technical documentation and troubleshooting\n• Process automation and workflow optimization\n• Data analysis and insights\n\nFeel free to upload documents to enhance my knowledge base or ask me anything directly.',
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
          conversation_id: 'main'
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
        content: 'I\'m experiencing connectivity issues. Please ensure the AI service is running and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;

    try {
      console.log('ChatPage: Starting upload for:', selectedFile.name);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', 'user-uploaded');
      
      console.log('ChatPage: FormData prepared, making request');
      
      const response = await fetch('http://localhost:8004/api/chatbot/upload-document', {
        method: 'POST',
        mode: 'cors',
        body: formData
      });

      console.log('ChatPage: Response received:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('ChatPage: Upload result:', result);
        
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `📄 Successfully processed "${selectedFile.name}". The document has been analyzed and added to my knowledge base. You can now ask specific questions about its content.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        checkAIStatus();
      } else {
        const error = await response.text();
        console.error('ChatPage: Upload failed with status:', response.status, error);
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('ChatPage: Failed to upload document:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `❌ Failed to process "${selectedFile.name}". Please verify the file format and try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      type: 'ai',
      content: 'Conversation cleared. How may I assist you?',
      timestamp: new Date()
    }]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button 
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
            >
              ← Back to Dashboard
            </button>
            <div style={{ height: '24px', width: '1px', background: '#d1d5db' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>
                🤖
              </div>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1f2937' 
                }}>
                  LS Enabler GPT
                </h1>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: '#6b7280' 
                }}>
                  AI-Powered Enterprise Assistant
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f9fafb',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }}></div>
              {aiStatus ? `${aiStatus.knowledge_base_documents} documents indexed` : 'Loading...'}
            </div>
            <button 
              onClick={clearChat}
              style={{
                background: '#f3f4f6',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '24px',
        height: 'calc(100vh - 120px)'
      }}>
        {/* Main Chat Area */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {messages.map((message) => (
              <div key={message.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {/* Avatar and Name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: message.type === 'user' 
                      ? 'linear-gradient(45deg, #6b7280, #9ca3af)' 
                      : 'linear-gradient(45deg, #3b82f6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    {message.type === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {/* Message Bubble */}
                <div style={{
                  background: message.type === 'user' 
                    ? 'linear-gradient(45deg, #3b82f6, #6366f1)' 
                    : '#f9fafb',
                  color: message.type === 'user' ? 'white' : '#1f2937',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: message.type === 'ai' ? '1px solid #e5e7eb' : 'none',
                  maxWidth: '100%',
                  wordWrap: 'break-word'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {message.content}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.2)',
                      fontSize: '12px',
                      opacity: 0.8
                    }}>
                      📚 Sources: {message.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                maxWidth: '80%'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    🤖
                  </div>
                </div>
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginLeft: '40px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out 0.16s'
                      }}></div>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s infinite ease-in-out 0.32s'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '24px',
            background: '#f9fafb'
          }}>
            {/* File Upload Preview */}
            {selectedFile && (
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                background: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px' }}>📄</div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1e3a8a' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '12px', color: '#3730a3' }}>
                      {Math.round(selectedFile.size / 1024)} KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={uploadDocument}
                  style={{
                    background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Upload & Process
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx,.md,.json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '18px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = '#f0f9ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = 'white';
                }}
              >
                📎
              </label>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type your message here..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                disabled={isLoading}
              />
              
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  background: isLoading || !input.trim() 
                    ? '#d1d5db' 
                    : 'linear-gradient(45deg, #3b82f6, #6366f1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Actions */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
              color: 'white',
              padding: '16px',
              fontWeight: '600'
            }}>
              Quick Actions
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { text: "What are the current company policies?", icon: "📋", label: "Company Policies" },
                { text: "How do I troubleshoot technical issues?", icon: "🔧", label: "Technical Support" },
                { text: "What are the procedures for handling RFIs?", icon: "📊", label: "RFI Procedures" },
                { text: "What training resources are available?", icon: "🎓", label: "Training Resources" }
              ].map((action, index) => (
                <button 
                  key={index}
                  onClick={() => setInput(action.text)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f0f9ff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{action.icon}</span>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '13px', color: '#1f2937' }}>
                      {action.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Click to ask
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(45deg, #10b981, #059669)',
              color: 'white',
              padding: '16px',
              fontWeight: '600'
            }}>
              System Status
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: "AI Service", value: "Online", color: "#10b981" },
                { label: "Knowledge Base", value: `${aiStatus?.knowledge_base_documents || 0} docs`, color: "#6b7280" },
                { label: "Model", value: "Llama 3.2", color: "#6b7280" },
                { label: "Security", value: "Offline", color: "#3b82f6" }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Information */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
              color: 'white',
              padding: '16px',
              fontWeight: '600'
            }}>
              💡 Tips
            </div>
            <div style={{ padding: '16px', fontSize: '13px', lineHeight: '1.6', color: '#6b7280' }}>
              <div style={{ marginBottom: '8px' }}>• Upload documents to enhance AI knowledge</div>
              <div style={{ marginBottom: '8px' }}>• Ask specific questions for better responses</div>
              <div style={{ marginBottom: '8px' }}>• All data processed locally and securely</div>
              <div>• Use quick actions for common queries</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;