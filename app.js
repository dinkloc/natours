const express = require('express');

const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(express.json());

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');



// 1 Middleware
app.use((req, res, next) => {
    console.log('Hello from the middleware ');
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

//2 Router Handlers




// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
    // 4 Start Server
    
module.exports = app;