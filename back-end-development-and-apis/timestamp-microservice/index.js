// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// Timestamp Microservice
app.get('/api/:input?', function(req, res) {
// Regarding ? after :input, it's there so it can get to this route
// even if there was no input provided. As in '.../api'
// The '?' indicates that 'input' in the route is OPTIONAL
    // console.log(req.params.input);
    let date;
    const jsonResInvalid = { error: 'Invalid Date' };
    let jsonRes = {};
    // Checking if 'input' paramater was provided or not
    if(req.params.input){
        // This should succeed if the input is a valid date
        date = new Date(req.params.input); 
    }
    // If there was no 'input' in the route, then 'input' would be undefined
    else
        date = new Date();
    
    // If input is a valid date, we don't need to do anything to date variable
    // Check if input is a unix timestamp or simply invalid input
    if(date.toString() === 'Invalid Date') {
        // Checking if input is a unix timestamp
        unix_num = Number(req.params.input);
        if(unix_num !== NaN){ // Number conversion succeeded
            date = new Date(unix_num);
        }
        // if number conversion failed, keep date 'Invalid Date'   
    }
    // We're done validating input

    // Producing object
    if(date.toString() === 'Invalid Date') 
        jsonRes = jsonResInvalid;
    else {
        jsonRes.unix = date.getTime();
        jsonRes.utc = date.toUTCString();
    }
    
    res.json(jsonRes);
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
