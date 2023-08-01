// Connect to mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env['MONGO_URI']);

const User = require('./models/user.js').UserModel;
const Exercise = require('./models/exercise.js').ExerciseModel;

async function findUserByIdAndAddExercise(userId, exc) {
    // Check if {exc} is NOT of model {Exercise}
    if(!exc instanceof Exercise) {
        console.log('{exc} is NOT an instance of {Exercise}');
        throw new TypeError('{exc} is NOT an instance of {Exercise}'); 
        // return;
    }

    // findByIdAndUpdate
    update = {};
    options = {
        new: true
    };
    await User.findByIdAndUpdate(userId, update, options).then((doc) => {
        console.log('{exc} added to user with _id:', userId);
        console.log('new doc:\n', doc);
    }).catch((err) => {
        console.log('error occured in {findUserByIdAndAddExercise} ')
    })
    
    
}