const express = require('express');
const morgan = require('morgan');
const app = express();
// 1 Middleware
app.use(morgan('dev')); // Hiển thị GET url status 
app.use(express.json());
app.use(express.static(`${__dirname}/public`))
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
app.use((req, res, next) => {
    console.log('Hello from the middleware ');
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
//2 Router Handlers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// 4 Start Server
module.exports = app;