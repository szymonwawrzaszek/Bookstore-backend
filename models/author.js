const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Book = require('./book');
const {BookShortcut} = require('./common');
const fileHelper = require('../helpers/file')

const Author = new Schema({
    firstName: {
        type: String,
        allowNull: false
    },
    lastName: {
        type: String,
        allowNull: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        allowNull: false
    },   
    books: [BookShortcut],
    publishers: [{
        type: Schema.Types.ObjectId,
        ref: "Publisher"
    }]        
});

Author.post('remove', (author, next) => {
    const booksIds = author.books.map(x => x.bookId)
    Book.find({_id: { $in : booksIds}})
        .then((books) => {
            books.forEach( book => {
                fileHelper.deleteFile(book.imageUrl)
            })
        })
        .catch( err => console.log(err))

    Book.deleteMany({ 
        _id: { $in: booksIds }
    }).exec();
    next();
});

module.exports = mongoose.model("Author", Author);