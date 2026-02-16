import { Link } from 'react-router-dom'
import { modules } from '../data/modules'
import { FileText, AlertTriangle, FolderOpen, ClipboardCheck, ArrowRight } from 'lucide-react'

const getModuleIcon = (moduleKey: string) => {
  switch (moduleKey) {
    case 'RFI':
      return FileText
    case 'REJECT':
      return AlertTriangle
    case 'FS':
      return FolderOpen
    case 'TRB':
      return ClipboardCheck
    default:
      return FileText
  }
}

const getModuleColor = (moduleKey: string) => {
  switch (moduleKey) {
    case 'RFI':
      return 'text-blue-600 bg-blue-100'
    case 'REJECT':
      return 'text-red-600 bg-red-100'
    case 'FS':
      return 'text-green-600 bg-green-100'
    case 'TRB':
      return 'text-purple-600 bg-purple-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to LS ENABLER</h1>
        <p className="mt-2 text-lg text-gray-600">
          Streamline your team operations with our comprehensive module system
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {modules.map((module) => {
          const Icon = getModuleIcon(module.key)
          const colorClass = getModuleColor(module.key)
          
          return (
            <div key={module.key} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <Icon size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{module.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{module.entities.length}</p>
                  <p className="text-sm text-gray-500">operations</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => {
          const Icon = getModuleIcon(module.key)
          const colorClass = getModuleColor(module.key)
          
          return (
            <Link
              key={module.key}
              to={`/module/${module.key}`}
              className="module-card group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${colorClass} group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                    {module.label}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {module.description}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {module.entities.length} operations available
                      </span>
                      <ArrowRight size={16} className="text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/module/RFI/create_rfi"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <FileText size={20} className="text-blue-600" />
            <span className="font-medium">Create New RFI</span>
          </Link>
          
          <Link
            to="/module/FS/upload_file"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <FolderOpen size={20} className="text-green-600" />
            <span className="font-medium">Upload File</span>
          </Link>
          
          <Link
            to="/module/TRB/submit_review"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <ClipboardCheck size={20} className="text-purple-600" />
            <span className="font-medium">Submit Review</span>
          </Link>
          
          <Link
            to="/module/REJECT/search_rejects"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <AlertTriangle size={20} className="text-red-600" />
            <span className="font-medium">Search Rejections</span>
          </Link>
        </div>
      </div>
    </div>
  )
}