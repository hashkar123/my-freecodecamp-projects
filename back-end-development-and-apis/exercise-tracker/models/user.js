const mongoose = require('mongoose');

const exerciseSchema = require('./exercise.js').ExerciseSchema;
const Exercise = require('./exercise.js').ExerciseModel;

// TODO: Add middleware that updates count whenever an Exercise is added or removed
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        alias: ['name', 'user', 'u'],
        required: true
    },
    _count: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v),
        validate: {
          validator: doesCountMatch,
          message: 'Count does not match the number of exercises.'
        },
        default: 0,
        required: true
        
    },
    exercises: {
        type: [exerciseSchema],
        default: [],
        required: true
    }
});

// Validator
function doesCountMatch(v) {
    // console.log('doesCountMatch validator start');
    // console.log(this);
    // console.log('doesCountMatch validator end');
    return this._count === this.exercises.length;
}

// Middleware

// Test for post middleware on find
// userSchema.post('findOneAndUpdate', _testForPostFindOneAndUpdate);
function _testForPostFindOneAndUpdate(...argArr) {
    // As it turns out, {this} refers to the query function with its arguments that were passed. And the first parameter of this function {argArr} contains one item that is the updated document.
    console.log('findOneAndUpdate function post middleware START.');
    console.log(`this=${this}`);
    console.log(`argArr=${argArr}`);
    console.log('findOneAndUpdate function post middleware END.');
}

// Exercises count validator for 'findOneAndUpdate' 
// * It's a post, thus it does not stop the update. It just prints an error.
userSchema.post('findOneAndUpdate', function (updatedDoc, next) {
    console.log('findOneAndUpdate function post middleware START.');
    if(updatedDoc._count === updatedDoc.exercises.length)
        console.log('Exercises count is valid!');
    else
        console.log('Exercises count is INVALID!');
    console.log('findOneAndUpdate function post middleware END.');
    next();
});


// Fuck the middleware! Just add a validator for the count field and that's it.
// https://mongoosejs.com/docs/api/schematype.html#SchemaType.prototype.validate()

// (X) TODO: Add middleware that increments the count when an exercise is inserted
// userSchema.post(['save', 'updateOne'], { document: true, query: false }, async function(doc, next) {
//     // Update _count
//     console.log('Start update count middleware ');
//     console.log(doc);
//     await doc.updateCount();
//     console.log('End update count middleware ');
//     next();
// });

// Model methods / Statics
userSchema.statics.findByIdAndAddExercise = async function (userId, exc) {
    // If exercise was added successfully, returns the updated user document.
    console.log('{findByIdAndAddExercise} function started');
    
    // Check if {exc} is NOT of model {Exercise}
    if(!exc instanceof Exercise) {
        console.log('{exc} is NOT an instance of {Exercise}');
        throw new TypeError('{exc} is NOT an instance of {Exercise}'); 
        // return;
    }

    // findByIdAndUpdate
    const update = {
        $push: { exercises: exc },
        $inc: { _count: 1 }
    };
    const options = {
        new: true,
        runValidators: true
    };
    // newDoc = await User.findByIdAndUpdate(userId, update, options).then((doc) => {
    //     console.log('{exc} added to user with _id:', userId);
    //     console.log('new doc:\n', doc);
    // }).catch((err) => {
    //     console.log('error occured in {findByIdAndAddExercise} function');
    //     console.log(err);
    // });
    let newDoc = await User.findOneAndUpdate({ _id: userId }, update, options).then((doc) => {
        console.log('{exc} added to user with _id:', userId);
        console.log('new doc:\n', doc);
        return doc;
    }).catch((err) => {
        console.log('error occured in {findByIdAndAddExercise} function');
        console.log(err);
        throw err;
    });
    console.log(`newDoc=${newDoc}`);
    console.log('{findByIdAndAddExercise} function ended');
    return newDoc;
}

// Instance method
userSchema.methods.addExercise = async function(exc) {
    console.log('{addExercise} function started');
    // Check if {exc} is NOT of model {Exercise}
    if(!exc instanceof Exercise) {
        console.log('{exc} is NOT an instance of {Exercise}');
        throw new TypeError('{exc} is NOT an instance of {Exercise}'); 
        // return;
    }
    // Add {exc} to {this.exercises}
    this.exercises.push(exc);
    // this._count += 1;
    
    // Save it (or update, whichever is more suitable)
    await this.save().then((doc) => {
        console.log('{exc} added, {_count} increamented.');
        console.log('New doc:\n', doc);
        // return;
    }).catch((err) => {
        console.log('Error occured when saving:');
        console.log(err);
        // return;
    });
    console.log('{addExercise} function ended');
}

userSchema.methods.updateCount = async function() {
    // DON'T USE THIS IN MIDDLEWARE! 
    // Look below for more info
    
    this._count = this.exercises.length;
    console.log(`{this.exercises.length} = ${this.exercises.length}`);
    console.log(`{this._count} = ${this._count}`);

    // PROBLEM!!!! The {save()} below triggers the post middleware which calls this function. Thus it keeps calling save() and then this function, then save, then this function... It turns into an infinite loop.
    await this.save().then((doc) => {
        console.log('Updated count:\n', doc);
    });
};

const User = new mongoose.model('User', userSchema);

exports.UserModel = User;