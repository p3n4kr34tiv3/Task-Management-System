const mongoose = require('mongoose')
const { Schema } = mongoose

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character long'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: null
    },
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function(value) {
          // If due date is provided, it should be in the future (for new tasks)
          if (value && this.isNew) {
            return value >= new Date()
          }
          return true
        },
        message: 'Due date cannot be in the past'
      }
    },
    priority: {
      type: String,
      enum: {
        values: ['high', 'medium', 'low', 'backlog'],
        message: 'Priority must be one of: high, medium, low, backlog'
      },
      default: 'backlog',
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Status must be one of: pending, in-progress, completed'
      },
      default: 'pending',
      required: true
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have a creator']
    },
    position: {
      type: Number,
      default: 0,
      min: [0, 'Position cannot be negative']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.__v
        return ret
      }
    },
    toObject: {
      transform: function(doc, ret) {
        delete ret.__v
        return ret
      }
    }
  }
)

// Compound indexes for better query performance
taskSchema.index({ priority: 1, position: 1 })
taskSchema.index({ assignee: 1, status: 1 })
taskSchema.index({ createdBy: 1, priority: 1 })
taskSchema.index({ status: 1, dueDate: 1 })
taskSchema.index({ createdAt: -1 })
taskSchema.index({ updatedAt: -1 })

// Text index for search functionality
taskSchema.index({ 
  title: 'text', 
  description: 'text' 
}, {
  weights: {
    title: 10,
    description: 5
  }
})

// Instance method to get formatted due date
taskSchema.methods.getFormattedDueDate = function() {
  if (!this.dueDate) return null
  return this.dueDate.toISOString().split('T')[0] // Returns YYYY-MM-DD format
}

// Instance method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  if (!this.dueDate || this.status === 'completed') return false
  return new Date() > this.dueDate
}

// Instance method to get time until/since deadline
taskSchema.methods.getTimeToDeadline = function() {
  if (!this.dueDate) return 'No deadline'
  
  const now = new Date()
  const diffMs = this.dueDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`
  } else if (diffDays === 0) {
    return 'Due today'
  } else {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
  }
}

// Static method to get tasks grouped by priority
taskSchema.statics.getTasksByPriority = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    { $sort: { position: 1, createdAt: -1 } },
    {
      $group: {
        _id: '$priority',
        tasks: { $push: '$$ROOT' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        priority: '$_id',
        tasks: 1,
        count: 1,
        _id: 0
      }
    }
  ]
  
  return this.aggregate(pipeline)
}

// Static method to get next position for a priority
taskSchema.statics.getNextPosition = async function(priority, createdBy) {
  const lastTask = await this.findOne(
    { priority, createdBy },
    {},
    { sort: { position: -1 } }
  )
  
  return lastTask ? lastTask.position + 1 : 0
}

// Static method to reorder tasks
taskSchema.statics.reorderTasks = async function(
  taskId, 
  newPriority, 
  newPosition,
  createdBy
) {
  const session = await mongoose.startSession()
  session.startTransaction()
  
  try {
    // Get the task being moved
    const task = await this.findById(taskId).session(session)
    if (!task) throw new Error('Task not found')
    
    const oldPriority = task.priority
    
    // If moving to different priority, adjust positions in both priorities
    if (oldPriority !== newPriority) {
      // Decrease positions in old priority (tasks after the moved task)
      await this.updateMany(
        { 
          priority: oldPriority, 
          position: { $gt: task.position },
          createdBy 
        },
        { $inc: { position: -1 } }
      ).session(session)
      
      // Increase positions in new priority (tasks at or after new position)
      await this.updateMany(
        { 
          priority: newPriority, 
          position: { $gte: newPosition },
          createdBy 
        },
        { $inc: { position: 1 } }
      ).session(session)
    } else {
      // Moving within same priority
      if (newPosition > task.position) {
        // Moving down: decrease positions of tasks between old and new position
        await this.updateMany(
          { 
            priority: newPriority,
            position: { $gt: task.position, $lte: newPosition },
            createdBy 
          },
          { $inc: { position: -1 } }
        ).session(session)
      } else if (newPosition < task.position) {
        // Moving up: increase positions of tasks between new and old position
        await this.updateMany(
          { 
            priority: newPriority,
            position: { $gte: newPosition, $lt: task.position },
            createdBy 
          },
          { $inc: { position: 1 } }
        ).session(session)
      }
    }
    
    // Update the moved task
    await this.findByIdAndUpdate(
      taskId,
      { priority: newPriority, position: newPosition },
      { session }
    )
    
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const Task = mongoose.model('Task', taskSchema)

module.exports = Task