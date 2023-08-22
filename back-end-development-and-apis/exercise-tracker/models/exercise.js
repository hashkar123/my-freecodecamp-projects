const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    duration: { 
        type: Number, // In minutes
        min: 0,
        required: true
    },
    date: {
        type: Date,
        validate: {
          validator: (v) => (v <= Date.now()),
          message: 'Date provided is in the future.'
        },
        required: true
    }
});
const Exercise = new mongoose.model('Exercise', exerciseSchema);


exports.ExerciseModel = Exercise;
exports.ExerciseSchema = exerciseSchema;