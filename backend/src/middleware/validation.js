const Joi = require('joi')

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    })

    if (error) {
      const errors = {}
      
      error.details.forEach(detail => {
        const path = detail.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(detail.message)
      })

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      })
      return
    }

    // Replace req.body with validated and sanitized data
    req.body = value
    next()
  }
}

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      convert: true // Convert string values to appropriate types
    })

    if (error) {
      const errors = {}
      
      error.details.forEach(detail => {
        const path = detail.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(detail.message)
      })

      res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      })
      return
    }

    // Replace req.query with validated and sanitized data
    req.query = value
    next()
  }
}

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    })

    if (error) {
      const errors = {}
      
      error.details.forEach(detail => {
        const path = detail.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(detail.message)
      })

      res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors
      })
      return
    }

    // Replace req.params with validated data
    req.params = value
    next()
  }
}

module.exports = {
  validate,
  validateQuery,
  validateParams
}