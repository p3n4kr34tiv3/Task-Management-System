const { JWTUtils } = require('../utils/jwt')
const User = require('../models/User')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = JWTUtils.extractTokenFromHeader(authHeader)

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      })
      return
    }

    try {
      const decoded = JWTUtils.verifyAccessToken(token)
      
      // Verify user still exists
      const user = await User.findById(decoded.userId)
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication failed. User not found.'
        })
        return
      }

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      }

      next()
    } catch (tokenError) {
      res.status(401).json({
        success: false,
        message: tokenError instanceof Error ? tokenError.message : 'Invalid token'
      })
      return
    }
  } catch (error) {
    console.error('Authentication middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = JWTUtils.extractTokenFromHeader(authHeader)

    if (token) {
      try {
        const decoded = JWTUtils.verifyAccessToken(token)
        
        // Verify user still exists
        const user = await User.findById(decoded.userId)
        if (user) {
          req.user = {
            userId: decoded.userId,
            email: decoded.email
          }
        }
      } catch (tokenError) {
        // Token is invalid, but that's okay for optional auth
        // Just continue without setting req.user
      }
    }

    next()
  } catch (error) {
    console.error('Optional authentication middleware error:', error)
    // Don't fail the request for optional auth errors
    next()
  }
}

module.exports = {
  authenticate,
  optionalAuth
}