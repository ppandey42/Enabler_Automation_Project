import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Settings, User, HelpCircle } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LS</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">LS ENABLER</h1>
                  <p className="text-sm text-gray-500">Team Operations Dashboard</p>
                </div>
              </Link>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Home size={16} />
                <span>Dashboard</span>
              </Link>
              
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">
                <HelpCircle size={16} />
                <span>Help</span>
              </button>
              
              <div className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100">
                <User size={16} />
                <span>Admin User</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>&copy; 2026 Amdocs Corporation. All rights reserved.</p>
            <p>LS ENABLER v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  )
}