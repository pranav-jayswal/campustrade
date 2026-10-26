// Catches requests to routes that don't exist and forwards a 404
// to the centralized error handler below.
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Single place where every thrown/forwarded error ends up.
// Keep this registered LAST in server.js, after all routes.
const errorHandler = (err, req, res, next) => {
  // If a route already set a 2xx status but then threw, default to 500.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Malformed MongoDB ObjectId (e.g. bad :id in a route param)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose validation errors (missing/invalid required fields)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Duplicate key error (e.g. registering with an email already in use)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only leak stack traces outside production
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
