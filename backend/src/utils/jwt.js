const jwt = require('jsonwebtoken')

class JWTUtils {
  static getAccessSecret() {
    const secret = process.env.JWT_ACCESS_SECRET
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is not defined')
    }
    return secret
  }

  static getRefreshSecret() {
    const secret = process.env.JWT_REFRESH_SECRET
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not defined')
    }
    return secret
  }

  static generateAccessToken(payload) {
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    return jwt.sign(payload, this.getAccessSecret(), { expiresIn })
  }

  static generateRefreshToken(payload) {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    return jwt.sign(payload, this.getRefreshSecret(), { expiresIn })
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.getAccessSecret())
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token')
      } else {
        throw new Error('Token verification failed')
      }
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.getRefreshSecret())
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token')
      } else {
        throw new Error('Refresh token verification failed')
      }
    }
  }

  static generateTokenPair(userId, email) {
    const tokenId = Math.random().toString(36).substr(2, 9) // Random token ID
    
    const accessPayload = {
      userId,
      email
    }

    const refreshPayload = {
      userId,
      email,
      tokenId
    }

    return {
      accessToken: this.generateAccessToken(accessPayload),
      refreshToken: this.generateRefreshToken(refreshPayload)
    }
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7) // Remove 'Bearer ' prefix
  }

  static getTokenExpiry(token) {
    try {
      const decoded = jwt.decode(token)
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000) // Convert from seconds to milliseconds
      }
      return null
    } catch (error) {
      return null
    }
  }

  static isTokenExpired(token) {
    const expiry = this.getTokenExpiry(token)
    if (!expiry) return true
    return new Date() >= expiry
  }
}

module.exports = { JWTUtils }