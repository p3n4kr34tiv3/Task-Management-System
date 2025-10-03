const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }

    const conn = await mongoose.connect(mongoURI)

    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB')
    })

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB')
    })

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('MongoDB connection closed due to application termination')
      process.exit(0)
    })

  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

module.exports = connectDB