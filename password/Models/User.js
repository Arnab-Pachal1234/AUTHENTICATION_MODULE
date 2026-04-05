const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    apiKey: { type: String, default: null } 
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = {User};