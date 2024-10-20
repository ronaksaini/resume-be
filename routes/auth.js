const express = require('express');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');


router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });

    try {
        await newUser.save();
        const user = await User.findOne({ email });
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        return res.json({
            isSuccess:true,
            message:"Signed up in successfully",
            token:token,
            user:user
        })
    } catch (error) {
        res.status(500).send('Error saving user');
    }
});



router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                isSuccess:false,
                message:"Email Id Not Found",
            })
        }

        if(password==user.password){
            const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
            return res.json({
                isSuccess:true,
                message:"Logged in successfully",
                token:token,
                user:user
            })
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
