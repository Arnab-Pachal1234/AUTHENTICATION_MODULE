require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const {authLimiter} = require('./middleware/authLimiter');
const {globalLimiter} = require('./middleware/globalLimiter');
const {register,login} = require('./Controllers/authController');
const {verifyToken} = require('./config/verifyToken');
const {userInfo , generateKey} = require('./Controllers/tokenController');

require('./config/mongo');

const app = express();

app.use(helmet()); 

// === THE VERCEL CORS FIX ===
const corsOptions = { origin: '*' };
app.use(cors(corsOptions)); 
app.options('/*splat', cors(corsOptions));// <-- YOU MUST ADD THIS LINE FOR VERCEL
// ===========================

app.use(express.json({ limit: '10kb' })); 

app.use(globalLimiter);

// Routes
app.post('/register', authLimiter, register);
app.post('/login', authLimiter, login);
app.get('/dashboard/me', verifyToken, userInfo);
app.post('/dashboard/generate-key', verifyToken, generateKey);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Production Auth Microservice running on port ${PORT}`);
});