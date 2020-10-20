const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Address = new Schema({
    city: String,
    street: String,
    postCode: String
})

const BookShortcut = new Schema({
    bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book"
    },
    title: {
        type: String,
        allowNull: false
    }
})

module.exports = {
    Address: Address,
    BookShortcut: BookShortcut
}