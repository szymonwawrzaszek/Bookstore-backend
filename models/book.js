const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileHelper = require('../helpers/file')

const Book = new Schema({
    title: {
        type: String,
        allowNull: false
    },
    pageCount: {
        type: Number,
        allowNull: false,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "Author"
    }        
});

Book.post('remove', (book, next) => {
    fileHelper.deleteFile(book.imageUrl)
    next();
});

module.exports = mongoose.model("Book", Book);