const path = require('path')
const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
app.set('views', './views'); 
app.set('view engine', 'pug');

// 1 Middleware
app.use(morgan('dev')); // Hiển thị GET url status 
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
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
    next();
});

// 4 Start Server
module.exports = app;