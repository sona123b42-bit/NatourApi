const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// ✅ 1) Setup CORS FIRST (for local + Render)
const allowedOrigins = [
  'http://localhost:3000', // local dev
  'https://natourapi.onrender.com', // your backend
  'https://your-frontend.vercel.app', // your frontend (later)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // ✅ allow cookies
  })
);
app.options('*', cors());
// ✅ 2) Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false, // ✅ disable opener policy too
    contentSecurityPolicy: false, // ✅ allow embeds (cookies, fonts, etc.)
  })
);

// ✅ 3) Request logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ✅ 4) Body + Cookie parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ✅ 5) Sanitization
app.use(mongoSanitize());
app.use(xss());

// ✅ 6) Prevent parameter pollution
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
app.use(compression());
// ✅ 7) Static files (public)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 8) Rate limiter
const limiter = rateLimit({
  max: 1000,
  windowMs: 3600000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// ✅ 9) Custom middleware for logging time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ✅ 10) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
// ✅ 11) Handle unmatched routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ✅ 12) Global error handler
app.use(globalErrorHandler);

module.exports = app;
