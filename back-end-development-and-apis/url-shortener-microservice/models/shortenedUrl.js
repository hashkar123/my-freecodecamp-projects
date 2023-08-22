const mongoose = require('mongoose');

const shortenedUrlSchema = new mongoose.Schema({
    // _id: {
    //     type: mongoose.ObjectId,
    //     required: false
    // },
    original_url: {
        type: String,
        alias: ['orig', 'original'],
        required: true,
        unique: true
    },
    short_url: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v),
        alias: 'short',
        required: true,
        unique: true
    }
});
// shortenedUrlSchema.alias('original_url', 'original');

// Decided not to use 'shortenedUrlNextNum' because it's just over-engineering for this kind of project
// const shortenedUrlNextNumSchema = new mongoose.Schema({
//     nextNum: {
//         type: Number,
//         get: v => Math.round(v),
//         set: v => Math.round(v),
//         required: true,
//         unique: true
//     }
// });

const ShortenedUrl = mongoose.model('ShortenedUrl', shortenedUrlSchema);
// const ShortenedUrlNextNum = mongoose.model('shortenedUrlNextNum', shortenedUrlNextNumSchema);


exports.ShortenedUrlModel = ShortenedUrl;
// exports.ShortenedUrlNextNumModel = ShortenedUrlNextNum;