/* eslint-disable no-console */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name can have 40 characters maximum'],
        minlength: [10, 'A tour name can have 10 characters minimum']
        // validate: [validator.isAlpha, 'Tour name can only have alphabets']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'A tour difficulty can be: easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be between 1 to 5'],
        max: [5, 'Rating must be between 1 to 5'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discounted price should be less than Actual price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    CreatedAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1});
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//DOCUMENT MIDDLEWARE OR HOOKS: runs only before .save() and .create() methods
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

////// Responsible for embedding
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

/// for referencing
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline());
//     next();
// });

tourSchema.post(/^find/, function (doc, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds.`);
    //console.log(doc);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;