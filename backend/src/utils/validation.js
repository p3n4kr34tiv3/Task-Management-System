const Joi = require('joi')

// Auth validation schemas
const signupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    })
})

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
})

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
})

// Task validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  dueDate: Joi.date()
    .iso()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Due date cannot be in the past',
      'date.iso': 'Due date must be a valid ISO date'
    }),
  priority: Joi.string()
    .valid('high', 'medium', 'low', 'backlog')
    .default('backlog')
    .messages({
      'any.only': 'Priority must be one of: high, medium, low, backlog'
    }),
  assignee: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Assignee must be a valid user ID'
    })
})

const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  dueDate: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .messages({
      'date.iso': 'Due date must be a valid ISO date'
    }),
  priority: Joi.string()
    .valid('high', 'medium', 'low', 'backlog')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: high, medium, low, backlog'
    }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
  assignee: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Assignee must be a valid user ID'
    }),
  position: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Position cannot be negative',
      'number.integer': 'Position must be an integer'
    })
})

// Query validation schemas
const taskQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1',
      'number.integer': 'Page must be an integer'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
      'number.integer': 'Limit must be an integer'
    }),
  priority: Joi.alternatives()
    .try(
      Joi.string().valid('high', 'medium', 'low', 'backlog'),
      Joi.array().items(Joi.string().valid('high', 'medium', 'low', 'backlog'))
    )
    .optional()
    .messages({
      'any.only': 'Priority must be one of: high, medium, low, backlog'
    }),
  status: Joi.alternatives()
    .try(
      Joi.string().valid('pending', 'in-progress', 'completed'),
      Joi.array().items(Joi.string().valid('pending', 'in-progress', 'completed'))
    )
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
  assignee: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    )
    .optional()
    .messages({
      'string.pattern.base': 'Assignee must be a valid user ID'
    }),
  search: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search query cannot exceed 100 characters'
    }),
  board: Joi.boolean()
    .optional()
    .default(false)
})

// MongoDB ObjectId validation
const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  })

// Drag and drop reorder validation
const reorderTaskSchema = Joi.object({
  priority: Joi.string()
    .valid('high', 'medium', 'low', 'backlog')
    .required()
    .messages({
      'any.only': 'Priority must be one of: high, medium, low, backlog',
      'any.required': 'Priority is required'
    }),
  position: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.min': 'Position cannot be negative',
      'number.integer': 'Position must be an integer',
      'any.required': 'Position is required'
    })
})

module.exports = {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  objectIdSchema,
  reorderTaskSchema
}