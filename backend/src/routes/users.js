const { Router } = require('express')
const { TaskController } = require('../controllers/taskController')
const { authenticate } = require('../middleware/auth')

const router = Router()

// All user routes require authentication
router.use(authenticate)

// Get users for assignment dropdown
router.get('/', TaskController.getUsers)

module.exports = router