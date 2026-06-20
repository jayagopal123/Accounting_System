const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// 1. Register Global Parse Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Mount API Routes under v1 namespace
app.use('/api/v1', routes);

// 3. Fallback: Catch 404 Undefined Route Handler
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
});

// 4. Centralized Error Handler Middleware
app.use(errorHandler);

module.exports = app;
