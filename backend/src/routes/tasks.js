const { Router } = require('express')
const { TaskController } = require('../controllers/taskController')
const { authenticate } = require('../middleware/auth')
const { validate, validateQuery, validateParams } = require('../middleware/validation')
const { 
  createTaskSchema, 
  updateTaskSchema, 
  taskQuerySchema,
  objectIdSchema
} = require('../utils/validation')
const Joi = require('joi')

const router = Router()

// All task routes require authentication
router.use(authenticate)

// Task CRUD routes
router.post('/', validate(createTaskSchema), TaskController.createTask)
router.get('/', validateQuery(taskQuerySchema), TaskController.getTasks)
router.get('/:id', validateParams(Joi.object({ id: objectIdSchema })), TaskController.getTaskById)
router.put('/:id', 
  validateParams(Joi.object({ id: objectIdSchema })), 
  validate(updateTaskSchema), 
  TaskController.updateTask
)
router.delete('/:id', validateParams(Joi.object({ id: objectIdSchema })), TaskController.deleteTask)

module.exports = router