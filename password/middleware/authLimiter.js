const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5, 
    message: { error: 'Too many authentication attempts. Please try again in an hour.' }
});
module.exports = {authLimiter}