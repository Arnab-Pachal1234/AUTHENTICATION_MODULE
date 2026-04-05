const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    apiKey: { type: String, default: null } 
}, { timestamps: true });

// Export the model so other files can use it
module.exports = mongoose.model('User', userSchema);