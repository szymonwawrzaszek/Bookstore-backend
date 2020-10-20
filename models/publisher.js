const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const {Address, BookShortcut} = require('./common');

const Publisher = new Schema({
    name: {
        type: String,
        allowNull: false
    },
    establishmentDate: {
        type: Date,
        allowNull: false
    },
    address: {
        type: Address,
        allowNull: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        allowNull: false
    },   
    books: [BookShortcut] ,
    authors: [{ author: {
                    type: Schema.Types.ObjectId,
                    ref: "Author"
                    },
                status: {
                    type: String,
                }        
    }]
})

module.exports = mongoose.model("Publisher", Publisher);