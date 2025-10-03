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
import { Plus, LogOut, Trash2, Edit, ArrowLeft, GripVertical } from 'lucide-react'
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
      color: 'bg-rose-500', 
      bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20',
      borderColor: 'border-rose-200 dark:border-rose-800/50',
      textColor: 'text-rose-700 dark:text-rose-300',
      shadow: 'shadow-rose-100/50 dark:shadow-rose-900/20'
    },
    medium: { 
      label: 'Medium Priority', 
      color: 'bg-amber-500', 
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800/50',
      textColor: 'text-amber-700 dark:text-amber-300',
      shadow: 'shadow-amber-100/50 dark:shadow-amber-900/20'
    },
    low: { 
      label: 'Low Priority', 
      color: 'bg-emerald-500', 
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800/50',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      shadow: 'shadow-emerald-100/50 dark:shadow-emerald-900/20'
    },
    backlog: { 
      label: 'Backlog', 
      color: 'bg-slate-500', 
      bgColor: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/20',
      borderColor: 'border-slate-200 dark:border-slate-800/50',
      textColor: 'text-slate-700 dark:text-slate-300',
      shadow: 'shadow-slate-100/50 dark:shadow-slate-900/20'
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
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100 dark:from-gray-900 dark:via-gray-950 dark:to-slate-900 flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <header className="border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl flex-shrink-0 relative z-10 shadow-sm dark:shadow-gray-900/20">
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
    shadow: string
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
        <Card className={`${config.bgColor} ${config.borderColor} border shadow-lg hover:shadow-xl transition-all duration-300 h-full rounded-2xl ${config.shadow}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                <CardTitle className={`text-xl font-bold ${config.textColor}`}>
                  {config.label}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full font-semibold">
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
      <Card className="group hover:shadow-lg transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 hover:border-blue-300 dark:hover:border-blue-700/50 cursor-grab active:cursor-grabbing rounded-xl shadow-sm hover:shadow-blue-100/30 dark:hover:shadow-blue-900/10">
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
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-base line-clamp-2 text-gray-900 dark:text-gray-50 pr-2">
                    {task.title}
                  </h3>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(task)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 bg-gray-50/50 dark:bg-gray-700/30 rounded-lg p-3">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdate({ status: e.target.value as Status })}
                    disabled={isUpdating}
                    className="text-xs border rounded-full px-2 py-1 bg-white dark:bg-gray-800 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="pending">📋 Pending</option>
                    <option value="in-progress">⚡ In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                  {task.priority && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 rounded-full font-medium border-0"
                    >
                      {task.priority === 'high' ? '🔴 High' : 
                       task.priority === 'medium' ? '🟡 Medium' : 
                       task.priority === 'low' ? '🟢 Low' : '🟣 Backlog'}
                    </Badge>
                  )}
                </div>

                {assignee && (
                  <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-700/30 rounded-full px-2 py-1">
                    <Avatar className="h-6 w-6 border border-gray-200 dark:border-gray-600">
                      <AvatarImage src={assignee.avatarUrl} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Task
          </DialogTitle>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Make changes to your task details
          </p>
        </DialogHeader>
        
        {task ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Task Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                className="border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-lg font-medium rounded-xl py-6 px-4"
                required
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                className="w-full min-h-[150px] border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-4 text-base bg-white dark:bg-gray-800 transition-colors resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-5 px-4"
                />
              </div>
              
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'high', label: 'High', color: 'bg-rose-500', textColor: 'text-rose-700 dark:text-rose-300' },
                    { value: 'medium', label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-300' },
                    { value: 'low', label: 'Low', color: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-300' },
                    { value: 'backlog', label: 'Backlog', color: 'bg-slate-500', textColor: 'text-slate-700 dark:text-slate-300' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: option.value as Priority })}
                      className={`flex items-center justify-center py-3 px-2 rounded-lg border transition-all ${
                        formData.priority === option.value
                          ? `${option.color} border-${option.value === 'high' ? 'rose' : option.value === 'medium' ? 'amber' : option.value === 'low' ? 'emerald' : 'slate'}-500 text-white shadow-sm`
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <span className={formData.priority === option.value ? 'text-white' : option.textColor}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'pending', label: 'Pending', color: 'bg-gray-500', textColor: 'text-gray-700 dark:text-gray-300' },
                    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300' },
                    { value: 'completed', label: 'Completed', color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-300' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: option.value as Status })}
                      className={`flex items-center justify-center py-3 px-2 rounded-lg border transition-all ${
                        formData.status === option.value
                          ? `${option.color} border-${option.value === 'pending' ? 'gray' : option.value === 'in-progress' ? 'blue' : 'green'}-500 text-white shadow-sm`
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <span className={formData.status === option.value ? 'text-white' : option.textColor}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Assignee */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Assignee
                </label>
                <select
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-white dark:bg-gray-800 transition-colors"
                >
                  <option value="">Unassigned</option>
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
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Add tags separated by commas (e.g., frontend, urgent, design)"
                className="border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-5 px-4"
              />
              {formData.tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.split(',').map((tag, index) => {
                    const cleanTag = tag.trim();
                    return cleanTag ? (
                      <Badge key={index} variant="secondary" className="px-3 py-1 rounded-full text-sm">
                        {cleanTag}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="px-8 py-6 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-semibold"
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
                className="px-8 py-6 rounded-xl font-semibold"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading task...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
