const crypto = require('crypto');
const User = require('../Models/User')

const userInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({ username: user.username, apiKey: user.apiKey });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user data' });
    }
}
const generateKey =  async (req, res) => {
    try {
        // Generate a random 32-character hex string
        const newApiKey = 'pk_live_' + crypto.randomBytes(16).toString('hex');
        
        const user = await User.findByIdAndUpdate(
            req.user.userId, 
            { apiKey: newApiKey }, 
            { new: true }
        );
        
        res.json({ message: 'New API Key generated!', apiKey: user.apiKey });
    } catch (error) {
        res.status(500).json({ error: 'Error generating API key' });
    }
}
module.exports = {userInfo,generateKey};