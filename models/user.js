const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    resetPasswordToken: {
        token: String,
        expirationDate: Date
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('User', User);