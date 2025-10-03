const { Router } = require('express')
const { AuthController } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')
const { validate } = require('../middleware/validation')
const { 
  signupSchema, 
  loginSchema, 
  refreshTokenSchema 
} = require('../utils/validation')

const router = Router()

// Public routes
router.post('/signup', validate(signupSchema), AuthController.signup)
router.post('/login', validate(loginSchema), AuthController.login)
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh)

// Protected routes
router.post('/logout', authenticate, AuthController.logout)
router.post('/logout-all', authenticate, AuthController.logoutAll)
router.get('/profile', authenticate, AuthController.getProfile)

module.exports = router