const { JWTUtils } = require('../utils/jwt')
const User = require('../models/User')

class AuthController {
  static async signup(req, res) {
    try {
      const { name, email, password } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        })
        return
      }

      // Create new user
      const user = new User({
        name,
        email,
        password
      })

      await user.save()

      // Generate tokens
      const { accessToken, refreshToken } = JWTUtils.generateTokenPair(user._id.toString(), user.email)

      // Store refresh token
      user.refreshTokens = [refreshToken]
      await user.save()

      // Prepare response
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
      
      res.status(201).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: userResponse
        },
        message: 'User created successfully'
      })
    } catch (error) {
      console.error('Signup error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during signup'
      })
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body

      // Find user with password
      const user = await User.findOne({ email }).select('+password +refreshTokens')
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        })
        return
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password)
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        })
        return
      }

      // Generate new tokens
      const { accessToken, refreshToken } = JWTUtils.generateTokenPair(user._id.toString(), user.email)

      // Add new refresh token to user's tokens (keep max 5 tokens)
      user.refreshTokens.push(refreshToken)
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5)
      }
      await user.save()

      // Prepare response
      const userResponse = user.toJSON()

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: userResponse
        },
        message: 'Login successful'
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      })
    }
  }

  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        })
        return
      }

      try {
        // Verify refresh token
        const decoded = JWTUtils.verifyRefreshToken(refreshToken)

        // Find user and check if refresh token exists
        const user = await User.findById(decoded.userId).select('+refreshTokens')
        if (!user || !user.refreshTokens.includes(refreshToken)) {
          res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
          })
          return
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = JWTUtils.generateTokenPair(user._id.toString(), user.email)

        // Replace old refresh token with new one
        const tokenIndex = user.refreshTokens.indexOf(refreshToken)
        user.refreshTokens[tokenIndex] = newRefreshToken
        await user.save()

        // Prepare response
        const userResponse = user.toJSON()

        res.status(200).json({
          success: true,
          data: {
            accessToken,
            refreshToken: newRefreshToken,
            user: userResponse
          },
          message: 'Token refreshed successfully'
        })
      } catch (tokenError) {
        res.status(401).json({
          success: false,
          message: tokenError instanceof Error ? tokenError.message : 'Invalid refresh token'
        })
        return
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh'
      })
    }
  }

  static async logout(req, res) {
    try {
      const { refreshToken } = req.body

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      // Find user and remove refresh token
      const user = await User.findById(req.user.userId).select('+refreshTokens')
      if (user && refreshToken) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken)
        await user.save()
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      })
    }
  }

  static async logoutAll(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      // Clear all refresh tokens
      await User.findByIdAndUpdate(req.user.userId, { refreshTokens: [] })

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully'
      })
    } catch (error) {
      console.error('Logout all error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      })
    }
  }

  static async getProfile(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
        return
      }

      const user = await User.findById(req.user.userId)
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: user.toJSON(),
        message: 'Profile retrieved successfully'
      })
    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching profile'
      })
    }
  }
}

module.exports = { AuthController }