const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// read static file
app.use(express.static(path.join(__dirname, 'public')));
// 1) global middleware
// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Date sanitization against NoSQL query injection

app.use(mongoSanitize());
// Data sanitizaition against XSS
app.use(xss());
//Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
// Security HTTP headers
app.use(helmet());
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 3600000,
  message: 'Too meny requests from this IP, please try again in an hour',
});
app.use('/api', limiter);
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});
// 3) Route

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this sever!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this sever!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
