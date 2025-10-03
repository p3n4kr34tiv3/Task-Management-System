import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@/services/taskService'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Plus, LogOut, Trash2, Edit, ArrowLeft, GripVertical, Calendar, Tag, User, MessageCircle, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ITask, CreateTaskRequest, Priority, Status, BoardData, IUser } from '@/types'

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ITask | null>(null)
  const [activeTask, setActiveTask] = useState<ITask | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Fetch board data
  const { data: boardData, isLoading } = useQuery({
    queryKey: ['tasks', 'board'],
    queryFn: () => taskService.getTasks({ board: true }) as Promise<BoardData>
  })

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => taskService.getUsers()
  })

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsCreateModalOpen(false)
    }
  })

  // Edit task mutation
  const editTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ITask> }) => taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsEditModalOpen(false)
    }
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = boardData?.[event.active.data.current?.priority as Priority]?.find(
      (t) => t._id === event.active.id
    )
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTaskId = active.id as string
    const overPriority = over.id as Priority

    // Find the task and its current priority
    let currentPriority: Priority | null = null
    let task: ITask | null = null

    if (boardData) {
      for (const [priority, tasks] of Object.entries(boardData)) {
        const foundTask = tasks.find((t: ITask) => t._id === activeTaskId)
        if (foundTask) {
          currentPriority = priority as Priority
          task = foundTask
          break
        }
      }
    }

    // Update task priority if it changed
    if (task && currentPriority && currentPriority !== overPriority) {
      editTaskMutation.mutate({
        id: activeTaskId,
        data: { priority: overPriority }
      })
    }
  }

  const priorityConfig = {
    high: { 
      label: 'High Priority', 
      color: 'bg-red-500', 
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300'
    },
    medium: { 
      label: 'Medium Priority', 
      color: 'bg-amber-500', 
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-700 dark:text-amber-300'
    },
    low: { 
      label: 'Low Priority', 
      color: 'bg-green-500', 
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-700 dark:text-green-300'
    },
    backlog: { 
      label: 'Backlog', 
      color: 'bg-indigo-500', 
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      textColor: 'text-indigo-700 dark:text-indigo-300'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex-shrink-0 relative z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Home</span>
              </Link>
              <div className="border-l h-6 border-gray-300 dark:border-gray-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Task Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name}! 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-700 shadow-sm">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <CreateTaskModal
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSubmit={(data) => createTaskMutation.mutate(data)}
                users={users || []}
                isLoading={createTaskMutation.isPending}
              />
              <EditTaskModal
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                task={editingTask}
                users={users || []}
                onUpdate={(id: string, data: Partial<ITask>) => editTaskMutation.mutate({ id, data })}
                isLoading={editTaskMutation.isPending}
              />
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(priorityConfig).map(([priority, config]) => {
              const taskCount = boardData?.[priority as Priority]?.length || 0
              return (
                <motion.div
                  key={priority}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * Object.keys(priorityConfig).indexOf(priority) }}
                >
                  <Card className={`${config.bgColor} ${config.borderColor} border-2 shadow-sm hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{config.label}</p>
                          <p className="text-2xl font-bold ${config.textColor}">{taskCount}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${config.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

        {/* Task Boards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(priorityConfig).map(([priority, config]) => {
            const tasks = boardData?.[priority as Priority] || []
            return (
              <DroppableColumn
                key={priority}
                priority={priority as Priority}
                config={config}
                tasks={tasks}
                users={users || []}
                onUpdate={(id, data) => editTaskMutation.mutate({ id, data })}
                onDelete={(id) => deleteTaskMutation.mutate(id)}
                isUpdating={editTaskMutation.isPending}
                isDeleting={deleteTaskMutation.isPending}
                onEdit={(task) => {
                  setEditingTask(task);
                  setIsEditModalOpen(true);
                }}
              />
            )
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <DraggableTaskCard
              task={activeTask}
              users={users || []}
              onUpdate={() => {}}
              onDelete={() => {}}
              isUpdating={false}
              isDeleting={false}
              onEdit={() => {}}
            />
          ) : null}
        </DragOverlay>
        </DndContext>
        </div>
      </main>
    </div>
  )
}

// Droppable Column Component
interface DroppableColumnProps {
  priority: Priority
  config: {
    label: string
    color: string
    bgColor: string
    borderColor: string
    textColor: string
  }
  tasks: ITask[]
  users: IUser[]
  onUpdate: (id: string, data: Partial<ITask>) => void
  onDelete: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
  onEdit: (task: ITask) => void // Add this prop
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  priority,
  config,
  tasks,
  users,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  onEdit // Add this prop
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + 0.1 * ['high', 'medium', 'low', 'backlog'].indexOf(priority) }}
      className="h-full"
    >
      <div
        id={priority}
        className="h-full"
      >
        <Card className={`${config.bgColor} ${config.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-200 h-full`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${config.color} shadow-sm`} />
                <CardTitle className={`text-lg font-semibold ${config.textColor}`}>
                  {config.label}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {tasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[400px]">
            <SortableContext
              items={tasks.map(task => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DraggableTaskCard
                      task={task}
                      users={users}
                      onUpdate={(data) => onUpdate(task._id, data)}
                      onDelete={() => onDelete(task._id)}
                      isUpdating={isUpdating}
                      isDeleting={isDeleting}
                      onEdit={onEdit}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
            
            {tasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-white/50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  No tasks yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add your first task to get started
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// Draggable Task Card Component
interface DraggableTaskCardProps {
  task: ITask
  users: IUser[]
  onUpdate: (data: Partial<ITask>) => void
  onDelete: () => void
  isUpdating: boolean
  isDeleting: boolean
  onEdit: (task: ITask) => void // Add this prop
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ 
  task, 
  users, 
  onUpdate, 
  onDelete, 
  isUpdating, 
  isDeleting,
  onEdit // Add this prop
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status
  })

  const assignee = users.find(u => u._id === task.assignee)

  const handleStatusChange = (newStatus: Status) => {
    onUpdate({ status: newStatus })
  }

  const handleSaveEdit = () => {
    onUpdate(editData)
    setIsEditMode(false)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 hover:border-blue-200 dark:hover:border-blue-700 cursor-grab active:cursor-grabbing">
        <CardContent className="p-4">
          {isEditMode ? (
            <div className="space-y-3">
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Task title"
                className="border-2 focus:border-blue-400"
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Description"
                className="w-full p-3 border-2 rounded-lg text-sm resize-none focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    {...attributes} 
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                    {task.title}
                  </h3>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(task)}
                    className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 bg-gray-50 dark:bg-gray-800/50 rounded-md p-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as Status)}
                  disabled={isUpdating}
                  className="text-xs border-2 rounded-md px-2 py-1 bg-white dark:bg-gray-800 focus:border-blue-400 focus:outline-none font-medium"
                >
                  <option value="pending">📋 Pending</option>
                  <option value="in-progress">⚡ In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>

                {assignee && (
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 rounded-full px-2 py-1">
                    <Avatar className="h-5 w-5 border border-gray-200 dark:border-gray-600">
                      <AvatarImage src={assignee.avatarUrl} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-16">
                      {assignee.name.split(' ')[0]}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Create Task Modal Component
interface CreateTaskModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTaskRequest) => void
  users: IUser[]
  isLoading: boolean
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  users,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    priority: 'backlog',
    assignee: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onSubmit({
        ...formData,
        assignee: formData.assignee || undefined
      })
      setFormData({ title: '', description: '', priority: 'backlog', assignee: '' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className="border-2 focus:border-blue-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              className="w-full p-3 border-2 rounded-lg text-sm resize-none focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full p-2 border-2 rounded-lg focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
                <option value="backlog">🟣 Backlog</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Assign to
              </label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full p-2 border-2 rounded-lg focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800"
              >
                <option value="">👥 Unassigned</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-8"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Task Modal Component
interface EditTaskModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  task: ITask | null
  users: IUser[]
  onUpdate: (id: string, data: Partial<ITask>) => void
  isLoading: boolean
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onOpenChange,
  task,
  users,
  onUpdate,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'backlog',
    status: task?.status || 'pending',
    dueDate: task?.dueDate || '',
    assignee: task?.assignee || '',
    tags: (task?.tags || []).join(', ')
  })

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || '',
        assignee: task.assignee || '',
        tags: (task.tags || []).join(', ')
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (task && formData.title.trim()) {
      const updateData: Partial<ITask> = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as Priority,
        status: formData.status as Status,
        assignee: formData.assignee || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
      
      // Only include dueDate if it's set
      if (formData.dueDate) {
        updateData.dueDate = formData.dueDate
      } else {
        updateData.dueDate = undefined
      }
      
      onUpdate(task._id, updateData)
    }
  }

  const priorityOptions = [
    { value: 'high', label: '🔴 High Priority', color: 'text-red-500' },
    { value: 'medium', label: '🟡 Medium Priority', color: 'text-amber-500' },
    { value: 'low', label: '🟢 Low Priority', color: 'text-green-500' },
    { value: 'backlog', label: '🟣 Backlog', color: 'text-indigo-500' }
  ]

  const statusOptions = [
    { value: 'pending', label: '📋 Pending', color: 'text-gray-500' },
    { value: 'in-progress', label: '⚡ In Progress', color: 'text-blue-500' },
    { value: 'completed', label: '✅ Completed', color: 'text-green-500' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Task
          </DialogTitle>
        </DialogHeader>
        
        {task ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Task Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                className="border-2 focus:border-blue-400 text-lg font-medium"
                required
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                className="border-2 focus:border-blue-400 min-h-[120px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="border-2 focus:border-blue-400"
                />
              </div>
              
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as unknown as Priority })}
                  className="w-full p-2 border-2 rounded-lg focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as unknown as Status })}
                  className="w-full p-2 border-2 rounded-lg focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Assignee */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assignee
                </label>
                <select
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full p-2 border-2 rounded-lg focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800"
                >
                  <option value="">👥 Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (comma separated)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., frontend, urgent, design"
                className="border-2 focus:border-blue-400"
              />
              {formData.tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.split(',').map((tag, index) => (
                    tag.trim() && (
                      <Badge key={index} variant="secondary" className="px-2 py-1">
                        {tag.trim()}
                      </Badge>
                    )
                  ))}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="px-8"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => {
                  if (task && window.confirm('Are you sure you want to delete this task?')) {
                    // We'll need to pass a delete function as prop
                    onOpenChange(false)
                  }
                }}
                className="px-8"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading task...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
