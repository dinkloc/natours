const { promisify} = require('util')
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { access } = require('fs');
const { decode } = require('punycode');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  };
  

// const createSendToken = (user, statusCode, res) => {
//     const token = signToken(user._id);
//     const cookieOptions = {
//         expires: new Date(
//         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//         ),
//         httpOnly: true
//     };
//     if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

//     res.cookie('jwt', token, cookieOptions);

//     // Remove password from output
//     user.password = undefined;

//     res.status(statusCode).json({
//         status: 'success',
//         token,
//         data: {
//         user
//         }
//     });
// };




exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })

});
  

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next (
            new AppError('You are not logged in! Please log in to the access', 401)
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists

    const freshUser = await User.findById(decoded.id); 
    if (!freshUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }
    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again', 401)
        );
    }
    req.user = freshUser;
    next(); 
})

exports.restricTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};