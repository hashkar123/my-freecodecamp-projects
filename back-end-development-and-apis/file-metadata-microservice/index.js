var express = require('express');
var cors = require('cors');
require('dotenv').config()

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// vvv File Metadata Microservice vvv

// Set up storage for uploaded files
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
// Create the multer instance
const upload = multer({ storage: storage });

app.post('/api/fileanalyse', upload.single('upfile'),  function(req, res) {
    console.log('req.body=>\n', req.body);
    console.log('req.file=>\n', req.file);
    const result = {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
    };
    res.json(result);
    // res.send('Look at console');
});

// ^^^ File Metadata Microservice ^^^


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
