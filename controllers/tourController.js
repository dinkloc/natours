const Tour = require('./../models/tourModels');
const APIFeatures = require('./../utils/apiFeature');
exports.TopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};



exports.getAllTours = async (req, res) => {
    try {
        //Excute query
        const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate(); 
        
        const tours = await features.query;
        
        // Send response
        
        res.status(200).json({
            status: 'success', 
            result: tours.length,
            data:  {
                tours: tours
            }
        });

        // const tours = await Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy');

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({req.params.id})

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};


exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    }
    catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        });
    }
};


exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndRemove(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

exports.getTourStats = async(req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: { $gte:4.5}}
            },
            {
                $group: {
                    _id: {$toUpper: '$difficulty' },
                    // _id: '$ratingsAverage',
                    numTours: {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            },
            {
                $sort: { avgPrice: 1 }
            }, 
            // {
            //     $match: {_id: { $ne: 'EASY' }}
            // }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind:  '$startDates' 
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    numTourStart: { $sum: 1 },
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {month: '$_id'} 
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStart: 1 }
            }, {
                $limit: 6
            }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });

    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};