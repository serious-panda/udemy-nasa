const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: [true, 'Where is flight number'],
    },
    launchDate: {
        type: Date,
        required: true,
    },    
    mission: {
        type: String,
        required: true,
    },
    rocket: {
        type: String,
        required: true,
    },    
    target: {
        type: String,
        required: true,
    },
    customers: {
        type: [ String ],
        required: true,
    },
    upcoming: {
        type: Boolean,
        required: true,
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    },
    bla: {
        type: String,
        required: true,
    }
});
// launchesSchema.pre('findOneAndUpdate', function(next) {
//     this.options.runValidators = true;
//     next();
// });

module.exports = mongoose.model('Launch', launchesSchema);