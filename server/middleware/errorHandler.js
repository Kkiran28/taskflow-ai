const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error.message = `Duplicate value entered for ${field}`;
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: message.join(', '),
    });
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    error.message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

module.exports = errorHandler;