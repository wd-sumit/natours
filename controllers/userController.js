/* eslint-disable import/no-useless-path-segments */
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     }, 
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('The uploaded file is not image', 400), false);
    }
}
const upload = multer({ 
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const filteredObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) filteredObj[el] = obj[el];
    });
    return filteredObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('Password cannot be updated here. please go to update password url to update password', 400)
        );
    }
    const filterBody = filterObj(req.body, 'email', 'name');
    if (req.file) filterBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });
    res.status(201).json({
        success: true,
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.createUser = (req, res) => {
    res.status(500)
        .json({
            status: 'error',
            message: 'route not defined. Use /signup instead'
        });
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// DO NOT ATTEMPT TO UPDATE PASSWORD
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
