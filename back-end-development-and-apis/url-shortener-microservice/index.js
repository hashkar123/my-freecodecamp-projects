require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
    res.json({ greeting: 'hello API' });
});


// vvvvv URL Shortener Microservice vvvvv
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ShortenedUrl = require('./models/shortenedUrl.js').ShortenedUrlModel;
const url = require('url');
const dns = require('dns');
// const ShortenedUrlNextNum = require('./models/shortenedUrl.js').ShortenedUrlNextNum;

app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect(process.env['MONGO_URI']);

// Helper functions
async function getNextShortUrl() {
    const nextShortUrl = await ShortenedUrl.findOne({}).sort('-short_url')
        .then(function(doc) {
            const nextNum = doc.short_url + 1;
            // console.log('Inside then func nextNum is %d', nextNum);
            return nextNum;
        }).catch(function(err) {
            console.log(err);
            return 0;
        });
    // console.log('After findOne func nextShortUrl is %d', nextShortUrl);
    return nextShortUrl;
}

async function lookupPromise(host) {
    return new Promise((resolve, reject) => {
        dns.lookup(host, (err, address) => {
            if(err)
                reject(err);
            else
                resolve(address);
        });
    });
}


app.get('/api/shorturl/:number?', function(req, res) {
    const shortUrlStr = req.params.number;
    if (!shortUrlStr) // If number was not provided (it would be 'undefined')
        res.send('Not found');
    else {
        // let shortUrlNum;
        // try {
        //     shortUrlNum = Number(shortUrlStr);
        // } catch (error) {
        //     console.log(error);
        //     res.json({error: "Wrong format"});
        //     return;
        // }
        const shortUrlNum = Number(shortUrlStr);
        console.log(shortUrlNum);
        if (Number.isNaN(shortUrlNum)) {
            console.log('"number" parameter is not a valid number');
            res.json({ error: "Wrong format" });
            return;
        }
        else {
            console.log('shortUrlNum is not NaN');
            ShortenedUrl.find({ short_url: shortUrlNum })
                .then(function(docs) {
                    console.log(docs);
                    if (docs.length === 0)
                        res.send('Not found');
                    else {
                        const origUrl = docs[0].original_url;
                        if (docs.length > 1)
                            console.log('Found more than 1 URL with the same short URL... Redirecting to the first one found.');
                        res.redirect(origUrl);
                    }
                }).catch(function(err) {
                    console.log(err);
                });
        }

    }
});
app.post('/api/shorturl', async function(req, res) {
    const origUrl = req.body.url;
    // Check if URL is valid
    const invalidUrlRes = {error:"Invalid URL"};
    let hostname;
    console.log('Testing URL syntax validity...');
    try {
        hostname = new url.URL(origUrl).hostname;
    } catch (error) {
        console.log(invalidUrlRes);
        res.json(invalidUrlRes);
        return;
    }
    console.log('Testing using dns.lookup(..) function...');
    try {
        const address = await lookupPromise(hostname);
        console.log('URL is valid');
    } catch (error) {
        console.log(invalidUrlRes);
        res.json(invalidUrlRes);
        return;
    }
    
    // Saving
    const shortUrl = await getNextShortUrl();
    const newShortenedUrlObj = {
        original_url: origUrl,
        short_url: shortUrl
    };
    const newShortenedUrlDoc = new ShortenedUrl(newShortenedUrlObj);
    newShortenedUrlDoc.save()
        .then((newDoc) => {
            console.log('newShortenedUrl saved:\n', newDoc);
            res.json(newShortenedUrlObj);
            return;
        }).catch((err) => {
            const DUPLICATE_KEY_ERROR = 11000;
            const errCode = err.code;
            console.log('errCode = ', errCode);
            if(errCode === DUPLICATE_KEY_ERROR) {
                // URL already exists, returning existing document
                console.log('Error, trying to add duplicate URL!\nSending orignal doc...');
                // The _id field is always present unless you explicitly exclude it
                ShortenedUrl.findOne({original_url: origUrl}, 'original_url short_url -_id')
                    .then((doc) => {
                        res.json(doc);
                        return;
                    }).catch((err) => {
                        console.log('Error occurred finding the original URL');
                        console.log(err);
                        res.send(err);
                    });
            } else {
                console.log('Error occurred');
                console.log(err);
                res.send(err);
            }
            
        });
    // res.json({original_url: origUrl});
});

async function mongooseTest() {
    const suObj = {
        original_url: "https://www.google.com",
        short_url: 1
    }

    const suDoc = new ShortenedUrl(suObj);
    console.log(suDoc.toJSON());

    // Testing aliases
    console.log(suDoc.original_url);
    console.log(suDoc.orig);
    console.log(suDoc.original);
    console.log(suDoc.short_url);
    console.log(suDoc.short);
    console.log(suDoc['short']);
    console.log(suDoc.control);
    const successCallback = (doc) => {
        console.log('Succeeded!');
        console.log(doc);
    };
    const errCallback = (err) => {
        console.log('Error occured!');
        console.log(err);
    };

    // console.log('mongooseTest...');
    // console.log('saving...');
    // const savedSu1 = await suDoc.save()
    //     .then(successCallback)
    //     .catch(errCallback);
    // console.log(savedSu1);
    // console.log('saving again...');
    // const savedSu2 = await suDoc.save()
    //     .then(successCallback)
    //     .catch(errCallback);

    // console.log('deleting...');
    // await ShortenedUrl.deleteMany(suObj)
    //     .then(successCallback)
    //     .catch(errCallback);

    // Testing findById function to see if it actually finds the doc
    // console.log('Finding...');
    // await ShortenedUrl.find(suObj)
    //     .then(successCallback)
    //     .catch(errCallback);    
}
// mongooseTest();
// console.log('This is after "mongooseTest()" line');



// ^^^^^ URL Shortener Microservice ^^^^^

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});
