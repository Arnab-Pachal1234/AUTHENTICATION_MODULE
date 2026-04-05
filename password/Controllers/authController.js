const bcrypt = require('bcrypt');
const {User} = require('../Models/User');

const register = async (req, res) => {
    try {
        let { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        username = String(username);
        password = String(password);

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ username, passwordHash: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        //debugging step
        console.log("username is :- "+username);
        console.log("the password is :- "+password);
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }


        username = String(username);
        password = String(password);

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (isMatch) {
          
            const token = jwt.sign(
                { userId: user._id, username: user.username }, 
                process.env.JWT_SECRET, 
                { expiresIn: '2h' } 
            );

            res.status(200).json({ message: 'Login successful!', token: token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports =  {register,login};