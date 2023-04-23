const path = require('path')
const express = require('express');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');
app.set('views', './views'); 
app.set('view engine', 'pug');


app.use(helmet());
// 1 Middleware
app.use(morgan('dev')); // Hiển thị GET url status 
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request'
});

app.use('/api', limiter);
app.use(express.json({limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

app.use(express.json());
app.use(express.static(`${__dirname}/public`))



app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


//2 Router Handlers

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server! `, 404));
});

app.use(globalErrorHandler);
// 4 Start Server
module.exports = app;