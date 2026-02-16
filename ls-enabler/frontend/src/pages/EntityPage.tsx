import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { modules } from '../data/modules'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { apiService } from '../services/api'
import { type FormData } from '../types'

export default function EntityPage() {
  const { moduleKey, entityKey } = useParams<{ moduleKey: string; entityKey: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<any>(null)
  
  const module = modules.find(m => m.key === moduleKey)
  const entity = module?.entities.find(e => e.key === entityKey)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  if (!module || !entity) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      // Handle file uploads separately
      const hasFiles = entity.fields.some(field => field.type === 'file')
      
      let result
      if (hasFiles) {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof FileList) {
            formData.append(key, value[0])
          } else if (value !== undefined && value !== '') {
            formData.append(key, value.toString())
          }
        })
        result = await apiService.uploadFile(entity.endpoint, formData)
      } else {
        // Regular JSON submission
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([, value]) => value !== undefined && value !== '')
        )
        result = await apiService.post(entity.endpoint, cleanData)
      }

      if (result.success) {
        toast.success(result.message || 'Operation completed successfully!')
        setResponse(result.data)
        reset()
      } else {
        toast.error(result.error || 'Operation failed')
        setResponse({ error: result.error })
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred')
      setResponse({ error: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link to="/" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-400">/</span>
        <Link to={`/module/${moduleKey}`} className="text-gray-500 hover:text-gray-700">
          {module.label}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{entity.label}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to={`/module/${moduleKey}`}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
          <span>Back to {module.label}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{entity.label}</h1>
            <p className="mt-2 text-gray-600">{entity.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Endpoint:</span> {entity.endpoint}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {entity.fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    {...register(field.name, { required: field.required })}
                    id={field.name}
                    placeholder={field.placeholder}
                    rows={4}
                    className={`input ${errors[field.name] ? 'border-red-300 focus-visible:ring-red-600' : ''}`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    {...register(field.name, { required: field.required })}
                    id={field.name}
                    className={`input ${errors[field.name] ? 'border-red-300 focus-visible:ring-red-600' : ''}`}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'file' ? (
                  <input
                    {...register(field.name, { required: field.required })}
                    id={field.name}
                    type="file"
                    className={`input ${errors[field.name] ? 'border-red-300 focus-visible:ring-red-600' : ''}`}
                  />
                ) : (
                  <input
                    {...register(field.name, { required: field.required })}
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    className={`input ${errors[field.name] ? 'border-red-300 focus-visible:ring-red-600' : ''}`}
                  />
                )}
                
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.label} is required
                  </p>
                )}
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Response Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Response</h2>
          
          {!response ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Send size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Submit the form to see the response</p>
            </div>
          ) : (
            <div className="space-y-4">
              {response.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{response.error}</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2">
                    <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}