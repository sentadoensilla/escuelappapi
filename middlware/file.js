const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imagesArray: {
        type: Array
    }
}, {
    collection: 'files'
})

module.exports = mongoose.model('File', fileSchema)