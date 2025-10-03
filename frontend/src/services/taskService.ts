import { apiClient } from '@/lib/api'
import type { 
  ITask, 
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  ApiResponse,
  PaginatedResponse,
  BoardData,
  IUser
} from '@/types'

export const taskService = {
  async createTask(data: CreateTaskRequest): Promise<ITask> {
    const response = await apiClient.post<ApiResponse<ITask>>('/tasks', data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to create task')
  },

  async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<ITask> | BoardData> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ITask> | BoardData>>('/tasks', filters)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch tasks')
  },

  async getTaskById(id: string): Promise<ITask> {
    const response = await apiClient.get<ApiResponse<ITask>>(`/tasks/${id}`)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch task')
  },

  async updateTask(id: string, data: UpdateTaskRequest): Promise<ITask> {
    const response = await apiClient.put<ApiResponse<ITask>>(`/tasks/${id}`, data)

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to update task')
  },

  async deleteTask(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/tasks/${id}`)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete task')
    }
  },

  async getUsers(): Promise<IUser[]> {
    const response = await apiClient.get<ApiResponse<IUser[]>>('/users')

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch users')
  }
}