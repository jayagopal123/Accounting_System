import env from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = err.details || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Mongoose CastError (e.g., malformed ObjectID representation)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_FORMAT';
    message = `Invalid format for field: ${err.path}`;
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Log error stack traces in development/testing mode for internal errors
  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details.length > 0 && { details }),
      ...(env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

export default errorHandler;
