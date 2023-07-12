// Connect to MonogoDB Atlas
const mongoose = require('mongoose');

// On mongoose 5.x
// mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

// On mongoose 7.x
mongoose.connect(process.env['MONGO_URI']);




