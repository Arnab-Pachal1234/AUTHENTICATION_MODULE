require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const {authLimiter} = require('./middleware/authLimiter');
const {globalLimiter} = require('./middleware/globalLimiter');
const {register,login} = require('./Controllers/authController');
const {verifyToken} = require('./config/verifyToken');
const app = express();
const {userInfo , generateKey} = require('./Controllers/tokenController');

require('./config/mongo');


app.use(helmet()); 

app.use(cors({ origin: '*' })); 

app.use(express.json({ limit: '10kb' })); 


app.use(globalLimiter);

app.post('/register', authLimiter,register);

app.post('/login', authLimiter, login );

app.get('/dashboard/me', verifyToken, userInfo);

app.post('/dashboard/generate-key', verifyToken, generateKey);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Production Auth Microservice running on port ${PORT}`);
});