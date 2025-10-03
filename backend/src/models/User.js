const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { Schema } = mongoose

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't include password in queries by default
    },
    avatarUrl: {
      type: String,
      default: null
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false // Don't include refresh tokens in queries by default
    }
  },
  {
    timestamps: true
  }
)

// Indexes for better query performance
userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const saltRounds = 12
    this.password = await bcrypt.hash(this.password, saltRounds)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate user initials
userSchema.methods.generateInitials = function() {
  return this.name
    .split(' ')
    .map((name) => name.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password +refreshTokens')
}

// Static method to clean up expired refresh tokens
userSchema.statics.cleanupRefreshTokens = function(userId, validTokens) {
  return this.findByIdAndUpdate(
    userId,
    { $set: { refreshTokens: validTokens } },
    { new: true }
  )
}

const User = mongoose.model('User', userSchema)

module.exports = User