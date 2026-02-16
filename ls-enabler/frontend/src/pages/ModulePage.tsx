import { useParams, Link, Navigate } from 'react-router-dom'
import { modules } from '../data/modules'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function ModulePage() {
  const { moduleKey } = useParams<{ moduleKey: string }>()
  
  const module = modules.find(m => m.key === moduleKey)
  
  if (!module) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link to="/" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{module.label}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900">{module.label}</h1>
        <p className="mt-2 text-lg text-gray-600">{module.description}</p>
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {module.entities.map((entity) => (
          <Link
            key={entity.key}
            to={`/module/${moduleKey}/${entity.key}`}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  {entity.label}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {entity.description}
                </p>
                
                {/* Show field count */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {entity.fields.length} fields
                  </span>
                  <ArrowRight size={16} className="text-primary-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900">Need Help?</h2>
        <p className="mt-2 text-blue-700">
          Each operation connects to a dedicated microservice. Select any operation above to access its form and submit data to the corresponding backend service.
        </p>
        <div className="mt-4 text-sm text-blue-600">
          <p><strong>API Endpoint Pattern:</strong> {module.entities[0]?.endpoint.split('/').slice(0, -1).join('/')}/*</p>
        </div>
      </div>
    </div>
  )
}