const mongoose = require('mongoose');

const Exercise = require('./models/exercise.js').ExerciseModel;
const User = require('./models/user.js').UserModel;

// Tests
async function addingExercisesTest() {
    const userObj = {
        username: 'user for addingExercisesTest'
    };
    const userIns = new User(userObj);
    console.log('Creating user...');
    await userIns.save().then(function(doc) {
        console.log('doc saved');
    }).catch(function(err) {
        console.log('Error occured while saving:');
        console.error(err);
        throw err;
    });
    console.log(userIns);

    const exc1 = new Exercise({
        description: 'exc1',
        duration: 1,
        date: new Date('2001-01-11')
    });
    const exc2 = new Exercise({
        description: 'exc2',
        duration: 2,
        date: new Date('2002-02-22')
    });
    console.log('Adding {exc1}');
    await User.findByIdAndAddExercise(userIns._id, exc1);
    // await userIns.addExercise(exc1);
    console.log(userIns);
    
    console.log('Adding {exc2}');
    await User.findByIdAndAddExercise(userIns._id, exc2);
    // await userIns.addExercise(exc2);
    console.log(userIns);

    
    // console.log('Deleting created user...');
    // await User.findByIdAndDelete(userIns._id).then(function(docs) {
    //     console.log('userIns deleted successfully.');
    //     console.log('Deleted docs:\n', docs);
    // });

    console.log('Deleting all "user for addingExercisesTest" users...');
    await User.deleteMany({ username: userIns.username })
        .then(function(docs) {
            console.log('users deleted successfully.');
            console.log('Deleted docs:\n', docs);
        }).catch(function(err) {
            console.log(err);
        });

    console.log('{addingExercisesTest} function end!');
}

function isDocOfModelTest() {
    const Exercise = require('./models/exercise').ExerciseModel;
    let exrDoc = new Exercise({
        description: 'This is exercise discription',
        duration: 5,
    });
    console.log(exrDoc);
    console.log(exrDoc.constructor)
    if(exrDoc.constructor === Exercise) {
        console.log('{exrDoc} is of model {Exercise}');
    } else {
        console.log('{exrDoc} is NOT of model {Exercise}');
    }
    
    const User = require('./models/user').UserModel;
    let userDoc = new User({
        username: 'This is a username'
    });
    if(userDoc.constructor === Exercise) {
        console.log('{userDoc} is of model {Exercise}');
    } else {
        console.log('{userDoc} is NOT of model {Exercise}');
    }
    if(userDoc instanceof Exercise) {
        console.log('{userDoc} is instanceof model {Exercise}');
    } else {
        console.log('{userDoc} is NOT instanceof model {Exercise}');
    }
    if(!userDoc instanceof User) {
        console.log('{userDoc} is instanceof model {User}');
    } else {
        console.log('{userDoc} is NOT instanceof model {User}');
    }
}

async function countValidatorTest() {
    console.log('countValidatorTest start');
    
    const userObj = {
        username: 'user for countValidatorTest'
    };
    let userIns = new User(userObj);
    console.log('Creating user...');
    await userIns.save().then(function(doc) {
        console.log('doc saved');
    }).catch(function(err) {
        console.log('Error occured while saving:');
        console.error(err);
        throw err;
    });
    console.log(userIns);

    console.log('Adding exercise...');
    const exc1 = new Exercise({
        description: 'exc1',
        duration: 1,
        date: new Date('2001-01-11')
    });
    userIns = await User.findByIdAndAddExercise(userIns._id, exc1);
    console.log(userIns);
    
    
    console.log('Making _count not match the number of exercises.');
    userIns._count += 1;
    console.log(userIns);
    console.log('Saving...');
    await userIns.save().then(function(doc) {
        console.log('doc saved');
    }).catch(function(err) {
        console.log('Error occured while saving:');
        console.error(err);
        // throw err;
    });

    console.log('Deleting all "user for countValidatorTest" users...');
    await User.deleteMany({ username: userIns.username })
        .then(function(docs) {
            console.log('users deleted successfully.');
            console.log('Deleted docs:\n', docs);
        }).catch(function(err) {
            console.log(err);
        });
    
    console.log('countValidatorTest end');
    
}


exports.isDocOfModelTest = isDocOfModelTest;
exports.addingExercisesTest = addingExercisesTest;
exports.countValidatorTest = countValidatorTest;
