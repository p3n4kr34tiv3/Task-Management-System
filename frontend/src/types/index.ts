// Core domain types
export type Priority = 'high' | 'medium' | 'low' | 'backlog'
export type Status = 'pending' | 'in-progress' | 'completed'

// User interface
export interface IUser {
  _id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// Task interface
export interface ITask {
  _id: string
  title: string
  description?: string
  dueDate?: string // ISO string
  priority: Priority
  status: Status
  assignee?: IUser['_id']
  createdBy: IUser['_id']
  createdAt: string
  updatedAt: string
  position?: number // For drag and drop ordering
  tags?: string[] // Tags for better organization
  attachments?: string[] // File attachments
  comments?: TaskComment[] // Comments on the task
}

// Task comment interface
export interface TaskComment {
  _id: string
  content: string
  author: IUser['_id']
  createdAt: string
  updatedAt: string
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  totalPages: number
  totalItems: number
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: IUser
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// Task API types
export interface CreateTaskRequest {
  title: string
  description?: string
  dueDate?: string
  priority: Priority
  assignee?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  dueDate?: string
  priority?: Priority
  status?: Status
  assignee?: string
  position?: number
}

export interface TaskFilters {
  priority?: Priority
  status?: Status
  assignee?: string
  page?: number
  limit?: number
  board?: boolean // For board view grouped by priority
}

// Board view types
export interface PriorityColumn {
  priority: Priority
  label: string
  color: string
  tasks: ITask[]
  count: number
}

export interface BoardData {
  high: ITask[]
  medium: ITask[]
  low: ITask[]
  backlog: ITask[]
}

// Form types (for react-hook-form)
export interface TaskFormData {
  title: string
  description?: string
  dueDate?: string
  priority: Priority
  assignee?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  name: string
  email: string
  password: string
}

// Error types
export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Context types
export interface AuthContextType {
  user: IUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

// Drag and drop types
export interface DragEndEvent {
  active: {
    id: string
    data: {
      current: {
        task: ITask
        priority: Priority
      }
    }
  }
  over: {
    id: string
    data: {
      current: {
        priority: Priority
      }
    }
  } | null
}

// Component prop types
export interface TaskCardProps {
  task: ITask
  onEdit: (task: ITask) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: Status) => void
  assignee?: IUser
}

export interface PriorityColumnProps {
  priority: Priority
  label: string
  color: string
  tasks: ITask[]
  onTaskUpdate: (taskId: string, updates: UpdateTaskRequest) => void
  onTaskDelete: (taskId: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}