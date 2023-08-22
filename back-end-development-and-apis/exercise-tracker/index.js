const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// VVV Exercise Tracker VVV
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
const mongoose = require('mongoose');
mongoose.connect(process.env['MONGO_URI'])
    .then(() => console.log("Database connected!"))
    .catch(err => console.log(err));
const User = require('./models/user.js').UserModel;
const Exercise = require('./models/exercise.js').ExerciseModel;


// You can POST to /api/users with form data username to create a new user.
// Waiting:The returned response from POST /api/users with form data username will be an object with username and _id properties.
app.post('/api/users', async (req, res) => {
    // TODO: The returned response from POST /api/users with form data username will be an object with username and _id properties.!!!
    // console.log(req.body);
    const username = req.body.username;
    const userIns = new User({
        username: username
    });
    await userIns.save().then(function(doc) {
        console.log(`User saved successfully!\n${doc}`);
    // TODO: The returned response from POST /api/users with form data username will be an object with username and _id properties.!!!
        const result = (({username, _id}) => ({username, _id}))(userIns);
        res.json(result);
    }).catch(function(err) {
        console.log('Error occured while saving!');
        console.error(err);
        res.send(err);
    });
    // res.send('How the fuck did you get here...');
});

// Waiting:You can make a GET request to /api/users to get a list of all users.
// Waiting:The GET request to /api/users returns an array.
// Waiting:Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
app.get('/api/users', async (req, res) => {
    let usersArr = await User.find({}, 'username _id').exec();
    res.json(usersArr);
});

// Waiting:You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
// Waiting:The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.
app.post('/api/users/:_id/exercises', async (req, res) => {
    const userId = req.params._id;
    let { description, duration, date } = req.body;
    console.log({ description, duration, date });
    if(!date) // If date wasn't provided
        date = new Date(); // Sets it to current date
    const exc = new Exercise({ description, duration, date });
    console.log('Before validation');
    console.log(exc);
    try {
        await exc.validate().catch((err) => { throw err; });
    } catch(err) {
        console.log(err);
        res.send(err);
        return;
    }
    console.log('After validation');
    console.log(exc);
    await User.findByIdAndAddExercise(userId, exc)
        .then((updatedDoc) => {
            console.log(updatedDoc);
            const result = {
                _id: updatedDoc._id,
                username: updatedDoc.username,
                date: exc.date.toDateString(),
                duration: exc.duration,
                description: exc.description
            };
            res.json(result);
        }).catch((err) => (res.send(err)));
    
    // res.send('Look at NodeJS console');
    
});

// Waiting:You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
// Waiting:A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user.
// Waiting:A GET request to /api/users/:_id/logs will return the user object with a log array of all the exercises added.
// Waiting:Each item in the log array that is returned from GET /api/users/:_id/logs is an object that should have a description, duration, and date properties.
// Waiting:The description property of any object in the log array that is returned from GET /api/users/:_id/logs should be a string.
// Waiting:The duration property of any object in the log array that is returned from GET /api/users/:_id/logs should be a number.
// Waiting:The date property of any object in the log array that is returned from GET /api/users/:_id/logs should be a string. Use the dateString format of the Date API.
// Waiting:You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
app.get('/api/users/:_id/logs', async (req, res) => {
    const userId = req.params._id;
    const { from, to, limit } = req.query
    // console.log({ from, to, limit });

    const result = {};
    // Get user
    let user;
    try {
        user = await User.findById(userId, '_id username _count exercises').exec();
    } catch(err) {
        console.log('Error occured retrieving user');
        res.send(err);
        return;
    }
    console.log(user);
    result._id = user._id;
    result.username = user.username;

    // Filtering by date
    let fromDate = new Date(from);
    let toDate = new Date(to);
    // console.log({fromDate,toDate});
    
    const dateCheck = {};
    if(fromDate.toString() !== 'Invalid Date') {
        dateCheck.from = (date) => (date >= fromDate);
        result.from = fromDate.toDateString();
    }
    else dateCheck.from = (date) => (true);
    if(toDate.toString() !== 'Invalid Date') {
        dateCheck.to = (date) => (date <= toDate);
        result.to = toDate.toDateString();
    }
    else dateCheck.to = (date) => (true);
    let log = user.exercises.filter((exc) => (dateCheck.from(exc.date) && dateCheck.to(exc.date)));
    // console.log(log);

    // Selecting by limit provided
    let limitNum = Number(limit);
    let count;
    if(!isNaN(limitNum) && limit < log.length) {
        log = log.slice(0, limit);
        count = limit;
    } else {
        count = log.length;
    }
    result.count = count;

    // Changing {date} property of exercises from Date object to string using date.toDateString() API
    log = log.map((exc) => {
        // I'm changing the exc document to a JS Object so I can change the date type to string (Mongoose doesn't allow me)
        const excObj = exc.toObject();
        // console.log(excObj);
        // console.log(excObj.date);
        // console.log(excObj.date.toDateString());
        excObj.date = excObj.date.toDateString();
        // console.log(excObj);
        return excObj;
    });
    // console.log(log);
    
    result.log = log;
    
    
    res.json(result);
});



// Tests
app.get('/test/addingExercisesTest', async (req, res) => {
    const mongoTests = require('./mongoTests.js');
    await mongoTests.addingExercisesTest();
    res.send('Look at NodeJS console to see test logs');
    console.log('GET "/test/addingExercisesTest" end!');
});
app.get('/test/countValidatorTest', async (req, res) => {
    const mongoTests = require('./mongoTests.js');
    await mongoTests.countValidatorTest();
    res.send('Look at NodeJS console to see test logs');
    console.log('GET "/test/countValidatorTest" end!');
});

// ^^^ Exercise Tracker ^^^



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
