import React, { useState, useEffect } from 'react'
import ChatPage from './pages/ChatPage'
import FSMonitoringPage from './pages/FSMonitoringPage'
import HSHandlingPage from './pages/HSHandlingPage'

function App() {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard') // 'dashboard' or 'chat'
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [signUpForm, setSignUpForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [loginError, setLoginError] = useState('')
  const [signUpError, setSignUpError] = useState('')
  const [signUpSuccess, setSignUpSuccess] = useState('')

  // Check for existing authentication on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('ls-enabler-auth')
    if (savedAuth === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple authentication - in real app, this would call an API
    if (loginForm.username === 'p' && loginForm.password === 'p') {
      setIsLoggedIn(true)
      localStorage.setItem('ls-enabler-auth', 'true')
      setLoginError('')
    } else {
      setLoginError('Invalid username or password')
    }
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpError('')
    
    // Validation
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setSignUpError('Passwords do not match')
      return
    }
    if (signUpForm.password.length < 6) {
      setSignUpError('Password must be at least 6 characters long')
      return
    }
    
    // Simple signup - in real app, this would call an API
    setSignUpSuccess('Account created successfully! Please login.')
    setSignUpForm({ username: '', email: '', password: '', confirmPassword: '' })
    setTimeout(() => {
      setIsSignUpMode(false)
      setSignUpSuccess('')
    }, 2000)
  }

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode)
    setLoginError('')
    setSignUpError('')
    setSignUpSuccess('')
  }

  const handleModuleClick = (moduleKey: string) => {
    if (moduleKey === 'CHATBOT') {
      setCurrentPage('chat')
    } else if (moduleKey === 'FS') {
      setCurrentPage('fs-monitor')
    } else if (moduleKey === 'HS') {
      setCurrentPage('fs-handling')
    } else {
      // Handle other modules here
      alert(`${moduleKey} module clicked - Feature coming soon!`)
    }
  }

  const goBackToDashboard = () => {
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('ls-enabler-auth')
    setShowProfileMenu(false)
    setLoginForm({ username: '', password: '' })
    setSignUpForm({ username: '', email: '', password: '', confirmPassword: '' })
    setLoginError('')
    setSignUpError('')
    setSignUpSuccess('')
    setIsSignUpMode(false)
    setCurrentPage('dashboard')
  }

  // Login Page
  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Light Space Theme with Stars */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, rgba(59, 130, 246, 0.6), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(139, 92, 246, 0.5), transparent),
            radial-gradient(2px 2px at 90px 40px, rgba(6, 182, 212, 0.7), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(59, 130, 246, 0.4), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(139, 92, 246, 0.6), transparent),
            radial-gradient(1px 1px at 200px 90px, rgba(6, 182, 212, 0.5), transparent),
            radial-gradient(2px 2px at 250px 50px, rgba(59, 130, 246, 0.7), transparent),
            radial-gradient(1px 1px at 300px 20px, rgba(139, 92, 246, 0.4), transparent),
            radial-gradient(1px 1px at 320px 80px, rgba(6, 182, 212, 0.6), transparent),
            radial-gradient(2px 2px at 100px 120px, rgba(59, 130, 246, 0.5), transparent),
            radial-gradient(1px 1px at 180px 10px, rgba(139, 92, 246, 0.7), transparent),
            radial-gradient(1px 1px at 280px 140px, rgba(6, 182, 212, 0.4), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '350px 200px',
          zIndex: 0
        }}></div>

        {/* Subtle cosmic clouds */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }}></div>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px 40px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          width: '400px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            color: '#0f172a', 
            margin: '0 0 12px 0',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.02em'
          }}>
            LS ENABLER
          </h1>
          <div style={{
            width: '50px',
            height: '3px',
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            margin: '0 auto 20px auto',
            borderRadius: '2px'
          }}></div>
          <p style={{ 
            fontSize: '16px', 
            color: '#64748b', 
            margin: '0 0 30px 0',
            fontWeight: '500'
          }}>
            {isSignUpMode ? 'Create your account' : 'Please sign in to continue'}
          </p>

          {!isSignUpMode ? (
            // Login Form
            <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              {loginError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '20px',
                  border: '1px solid #fecaca'
                }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Sign In
              </button>
            </form>
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={signUpForm.username}
                  onChange={(e) => setSignUpForm({...signUpForm, username: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({...signUpForm, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) => setSignUpForm({...signUpForm, confirmPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              {signUpError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '20px',
                  border: '1px solid #fecaca'
                }}>
                  {signUpError}
                </div>
              )}

              {signUpSuccess && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '20px',
                  border: '1px solid #bbf7d0'
                }}>
                  {signUpSuccess}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Create Account
              </button>
            </form>
          )}

          <div style={{ 
            marginTop: '30px', 
            textAlign: 'center',
            padding: '20px 0',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#64748b',
              margin: '0 0 15px 0'
            }}>
              {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'inherit'
              }}
            >
              {isSignUpMode ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {!isSignUpMode && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <strong>Demo Credentials:</strong><br/>
              Username: p<br/>
              Password: p
            </div>
          )}
        </div>
      </div>
    )
  }
  const getModuleIcon = (key: string) => {
    const icons = {
      'RFI': '📋',
      'REJECT': '❌',       'HS': '🔧',      'FS': '�',
      'TRB': '📊',
      'CHATBOT': '🤖',
      'ACTIVE_WR': '🔄',
      'JOB_FAILURES': '⚠️',
      'PENDING_TASKS': '⏳'
    }
    return icons[key as keyof typeof icons] || '📌'
  }

  const getModuleGradient = (key: string) => {
    const gradients = {
      'RFI': '#3b82f6, #1d4ed8',
      'REJECT': '#ef4444, #dc2626',
      'HS': '#06b6d4, #0891b2',
      'FS': '#3b82f6, #2563eb',
      'TRB': '#8b5cf6, #7c3aed',
      'CHATBOT': '#6366f1, #4f46e5',
      'ACTIVE_WR': '#f59e0b, #d97706',
      'JOB_FAILURES': '#ef4444, #b91c1c',
      'PENDING_TASKS': '#06b6d4, #0891b2'
    }
    return gradients[key as keyof typeof gradients] || '#6b7280, #4b5563'
  }

  const modules = [
    {
      key: 'RFI',
      label: 'RFI Handling',
      description: 'Request for Information Processing - Create, search, and manage RFI requests',
      color: 'bg-blue-500'
    },
    {
      key: 'REJECT',
      label: 'REJECT Handling', 
      description: 'Rejection Management System - Process, search, and handle rejection appeals',
      color: 'bg-red-500'
    },
    {
      key: 'HS',
      label: 'FS Handling',
      description: 'File System Management - Monitor server health, performance metrics, and system diagnostics',
      color: 'bg-cyan-500'
    },
    {
      key: 'FS',
      label: 'FS Handling',
      description: 'File System Management & Monitoring - Monitor disk space usage, manage alerts, and handle server storage',
      color: 'bg-green-500'
    },
    {
      key: 'TRB',
      label: 'TRB Handling',
      description: 'Transaction Broker Manager (TRB) - Submit, track, and manage technical document reviews',
      color: 'bg-purple-500'
    },
    {
      key: 'K2',
      label: 'K+2 Handling',
      description: 'K+2 Management System - Process, track, and manage K+2 operations and workflows',
      color: 'bg-teal-500'
    },
    {
      key: 'CHATBOT',
      label: 'ENABLER GPT',
      description: 'AI-Powered Chat Assistant - Get instant help, answers, and guidance for your operations',
      color: 'bg-indigo-500'
    },
    {
      key: 'ACTIVE_WR',
      label: 'Active WR\'s',
      description: 'Active Work Requests - Monitor, track, and manage ongoing work requests and their status',
      color: 'bg-orange-500'
    },
    {
      key: 'JOB_FAILURES',
      label: 'Job Failures',
      description: 'Job Failure Management - Analyze, investigate, and resolve system job failures efficiently',
      color: 'bg-red-600'
    },
    {
      key: 'PENDING_TASKS',
      label: 'Pending Tasks',
      description: 'Task Management - View, prioritize, and manage all pending tasks and assignments',
      color: 'bg-cyan-500'
    }
  ]

  // Show Chat Page when selected
  if (isLoggedIn && currentPage === 'chat') {
    return <ChatPage onBack={goBackToDashboard} />
  }

  // Show FS Monitoring Page when selected
  if (isLoggedIn && currentPage === 'fs-monitor') {
    return <FSMonitoringPage />
  }

  // Show FS Handling Page when selected
  if (isLoggedIn && currentPage === 'fs-handling') {
    return <HSHandlingPage onBack={goBackToDashboard} />
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px 30px', 
        marginBottom: '30px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        textAlign: 'center',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        position: 'relative'
      }}>
        {/* Profile Menu */}
        <div style={{ position: 'absolute', top: '20px', right: '30px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            PP
          </div>
          
          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              minWidth: '160px',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {[
                { label: 'Settings', icon: '⚙️' },
                { label: 'Help', icon: '❓' },
                { label: 'Admin Centre', icon: '👑' },
                { label: 'Logout', icon: '🚪' }
              ].map((item, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: index < 3 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                  onClick={() => {
                    setShowProfileMenu(false)
                    if (item.label === 'Logout') {
                      handleLogout()
                    } else {
                      console.log(`${item.label} clicked`)
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '800', 
          color: '#0f172a', 
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.02em',
          fontFamily: '"Inter", sans-serif'
        }}>
          LS ENABLER
        </h1>
        <div style={{
          width: '60px',
          height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
          margin: '0 auto 12px auto',
          borderRadius: '2px'
        }}></div>
        <p style={{ 
          fontSize: '16px', 
          color: '#475569', 
          margin: '0',
          fontWeight: '600',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          Workflow Management Dashboard
        </p>
      </div>

      {/* Welcome Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748b',
          fontWeight: '400'
        }}>
          Select a module to get started
        </p>
      </div>

      {/* Modules Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {modules.map((module) => (
          <div 
            key={module.key}
            onClick={() => handleModuleClick(module.key)}
            style={{ 
              backgroundColor: 'white', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              border: '2px solid transparent',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)'
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.25)'
              e.currentTarget.style.border = '2px solid rgba(102, 126, 234, 0.5)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'
              e.currentTarget.style.border = '2px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px',
                background: `linear-gradient(45deg, ${getModuleGradient(module.key)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                fontSize: '24px',
                transition: 'transform 0.3s ease'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>
                  {getModuleIcon(module.key)}
                </span>
              </div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1f2937', 
                margin: '0',
                fontFamily: '"Inter", sans-serif'
              }}>
                {module.label}
              </h3>
            </div>
            <p style={{ 
              fontSize: '16px', 
              color: '#4b5563', 
              lineHeight: '1.6', 
              margin: '0 0 24px 0',
              fontWeight: '400'
            }}>
              {module.description}
            </p>
            <div style={{ 
              fontSize: '14px', 
              color: '#3b82f6',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Access Module
              <span style={{ transition: 'transform 0.3s ease' }}>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '80px', 
        paddingTop: '30px', 
        borderTop: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '16px'
      }}>
        <p style={{ margin: '0 0 15px 0', fontWeight: '400' }}>
          © 2026 Amdocs Corporation. All rights reserved. | LS ENABLER v1.0.0
        </p>
        <p style={{ 
          marginTop: '8px', 
          fontWeight: '600',
          fontSize: '14px',
          color: '#3b82f6'
        }}>
          Made by Prachi Pandey
        </p>
      </div>
    </div>
  )
}

export default App