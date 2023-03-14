const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1 get tour data from collection
    const tours = await Tour.find();
    // 2 Build template
    // 3 Render template using data from step 1
    res.status(200).render('overview', {
        title: 'All Tours', 
        tours
    });
});

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'All Tours'
    });
};