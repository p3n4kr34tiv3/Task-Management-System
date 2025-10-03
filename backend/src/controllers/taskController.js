const mongoose = require('mongoose')
const Task = require('../models/Task')
const User = require('../models/User')

class TaskController {
  static async createTask(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { title, description, dueDate, priority = 'backlog', assignee } = req.body

      // Validate assignee if provided
      if (assignee) {
        const assigneeUser = await User.findById(assignee)
        if (!assigneeUser) {
          res.status(400).json({
            success: false,
            message: 'Assignee user not found'
          })
          return
        }
      }

      // Get next position for this priority
      const position = await Task.getNextPosition(priority, req.user.userId)

      // Create task
      const task = new Task({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        assignee: assignee || undefined,
        createdBy: req.user.userId,
        position
      })

      await task.save()

      // Populate assignee and createdBy
      await task.populate([
        { path: 'assignee', select: 'name email avatarUrl' },
        { path: 'createdBy', select: 'name email avatarUrl' }
      ])

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      })
    } catch (error) {
      console.error('Create task error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating task'
      })
    }
  }

  static async getTasks(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const {
        page = 1,
        limit = 10,
        priority,
        status,
        assignee,
        search,
        board = false
      } = req.query

      // Convert query params to proper types
      const pageNum = Number(page) || 1
      const limitNum = Number(limit) || 10
      const boardView = String(board) === 'true'

      // Build filter query
      const filter = {
        $or: [
          { createdBy: req.user.userId },
          { assignee: req.user.userId }
        ]
      }

      if (priority) {
        filter.priority = Array.isArray(priority) ? { $in: priority } : priority
      }

      if (status) {
        filter.status = Array.isArray(status) ? { $in: status } : status
      }

      if (assignee) {
        filter.assignee = Array.isArray(assignee) ? { $in: assignee } : assignee
      }

      if (search) {
        filter.$text = { $search: search }
      }

      if (boardView) {
        // Return tasks grouped by priority for board view
        const tasks = await Task.find(filter)
          .populate([
            { path: 'assignee', select: 'name email avatarUrl' },
            { path: 'createdBy', select: 'name email avatarUrl' }
          ])
          .sort({ position: 1, createdAt: -1 })
          .lean()

        const boardData = {
          high: tasks.filter(task => task.priority === 'high'),
          medium: tasks.filter(task => task.priority === 'medium'),
          low: tasks.filter(task => task.priority === 'low'),
          backlog: tasks.filter(task => task.priority === 'backlog')
        }

        res.status(200).json({
          success: true,
          data: boardData,
          message: 'Board data retrieved successfully'
        })
        return
      }

      // Regular paginated response
      const skip = (pageNum - 1) * limitNum
      const sortOptions = search 
        ? { score: { $meta: 'textScore' }, createdAt: -1 }
        : { position: 1, createdAt: -1 }

      const [tasks, totalItems] = await Promise.all([
        Task.find(filter)
          .populate([
            { path: 'assignee', select: 'name email avatarUrl' },
            { path: 'createdBy', select: 'name email avatarUrl' }
          ])
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Task.countDocuments(filter)
      ])

      const totalPages = Math.ceil(totalItems / limitNum)

      res.status(200).json({
        success: true,
        data: {
          data: tasks,
          page: pageNum,
          limit: limitNum,
          totalPages,
          totalItems
        },
        message: 'Tasks retrieved successfully'
      })
    } catch (error) {
      console.error('Get tasks error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching tasks'
      })
    }
  }

  static async getTaskById(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { id } = req.params

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid task ID'
        })
        return
      }

      const task = await Task.findOne({
        _id: id,
        $or: [
          { createdBy: req.user.userId },
          { assignee: req.user.userId }
        ]
      }).populate([
        { path: 'assignee', select: 'name email avatarUrl' },
        { path: 'createdBy', select: 'name email avatarUrl' }
      ])

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: task,
        message: 'Task retrieved successfully'
      })
    } catch (error) {
      console.error('Get task by ID error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching task'
      })
    }
  }

  static async updateTask(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { id } = req.params
      const updates = req.body

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid task ID'
        })
        return
      }

      // Find task and check permissions
      const task = await Task.findOne({
        _id: id,
        $or: [
          { createdBy: req.user.userId },
          { assignee: req.user.userId }
        ]
      })

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        })
        return
      }

      // Validate assignee if provided
      if (updates.assignee) {
        const assigneeUser = await User.findById(updates.assignee)
        if (!assigneeUser) {
          res.status(400).json({
            success: false,
            message: 'Assignee user not found'
          })
          return
        }
      }

      // Handle position/priority changes (drag and drop)
      if (updates.priority && updates.position !== undefined && 
          (updates.priority !== task.priority || updates.position !== task.position)) {
        await Task.reorderTasks(id, updates.priority, updates.position, req.user.userId)
        delete updates.position // Remove from regular updates since it's handled by reorderTasks
      }

      // Apply other updates
      Object.assign(task, updates)
      
      if (updates.dueDate) {
        task.dueDate = new Date(updates.dueDate)
      }

      await task.save()

      // Populate and return updated task
      await task.populate([
        { path: 'assignee', select: 'name email avatarUrl' },
        { path: 'createdBy', select: 'name email avatarUrl' }
      ])

      res.status(200).json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      })
    } catch (error) {
      console.error('Update task error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating task'
      })
    }
  }

  static async deleteTask(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const { id } = req.params

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid task ID'
        })
        return
      }

      // Find and delete task (only creator can delete)
      const task = await Task.findOneAndDelete({
        _id: id,
        createdBy: req.user.userId
      })

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found or you do not have permission to delete it'
        })
        return
      }

      // Adjust positions of remaining tasks in the same priority
      await Task.updateMany(
        { 
          priority: task.priority, 
          position: { $gt: task.position },
          createdBy: req.user.userId 
        },
        { $inc: { position: -1 } }
      )

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      })
    } catch (error) {
      console.error('Delete task error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting task'
      })
    }
  }

  static async getUsers(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const users = await User.find({}, 'name email avatarUrl').lean()

      res.status(200).json({
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      })
    } catch (error) {
      console.error('Get users error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching users'
      })
    }
  }
}

module.exports = { TaskController }