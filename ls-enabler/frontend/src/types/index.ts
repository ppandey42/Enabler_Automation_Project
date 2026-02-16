// Types for the LS ENABLER application

export interface Module {
  key: string
  label: string
  description: string
  entities: Entity[]
}

export interface Entity {
  key: string
  label: string
  description: string
  endpoint: string
  fields: Field[]
}

export interface Field {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'email' | 'file' | 'number'
  required?: boolean
  options?: string[]
  placeholder?: string
}

export interface FormData {
  [key: string]: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Specific response types for each module
export interface RFIResponse {
  rfi_id: string
  title: string
  description: string
  status: 'Open' | 'In Progress' | 'Closed'
  priority: 'High' | 'Medium' | 'Low'
  requester: string
  created_at: string
  updated_at: string
}

export interface RejectResponse {
  request_id: string
  reject_reason: string
  detailed_reason: string
  reviewer: string
  status: 'Pending' | 'Appealed' | 'Final'
  created_at: string
}

export interface FileResponse {
  file_id: string
  filename: string
  category: string
  description: string
  tags: string[]
  upload_date: string
  file_size: number
  file_type: string
}

export interface ReviewResponse {
  review_id: string
  document_title: string
  document_type: string
  submitter: string
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Needs Revision'
  priority: 'Urgent' | 'High' | 'Normal' | 'Low'
  reviewer_email?: string
  review_deadline?: string
  submitted_at: string
  completed_at?: string
}