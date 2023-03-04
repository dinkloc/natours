const Tour = require('./../models/tourModels');

exports.getAllTours = async (req, res) => {
    try {
        // Build Query
        const queryObj = {...req.query};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 2 Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        const query = Tour.find(JSON.parse(queryStr));

        
        //Excute query
        
        const tours = await query;
        
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
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};