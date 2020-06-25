/* eslint-disable no-console */
/* eslint-disable import/no-useless-path-segments */
const AppError = require('./../utils/appError');

const handleCasteErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsErrorDB = err => {
    const message = `Duplicate Field: ${err.keyValue.name}. Please enter another value.`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Validation failed: ${errors.join('. ')}.`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid Token. Please login again', 401);

const handleJWTExpiredError = () => new AppError('Token expired. Please login again', 401);

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        // API
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // Rendered Website
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    });
}

const sendErrorProd = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        // Api
        if (err.isOperational) {
            // self generated error
            return res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message
            });
        }
        // unknown error
        console.error('Error:', err);
        return res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went wrong'
        });
    }
    // Rendered website
    if (err.isOperational) {
        // Self generated error 
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        });
    }
    // Unknown error
    console.error('Error:', err);
    return res.status(500).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later'
    });

}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError') error = handleCasteErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsErrorDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }
}