const { env } = require('../config/env');

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    error: error.message || 'Internal server error'
  };

  if (error.details) payload.details = error.details;
  if (env.NODE_ENV !== 'production') payload.stack = error.stack;

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler };
