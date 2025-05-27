const express = require('express');
const userSchema = require('../models/usermodels');
const user = require('../models/usermodels');
const router = express.Router();

router.get('/',(req,res)=>{
    res.render('login');
});

router.get('/signup',(req,res)=>{
    res.render('signup')
});

//========================================

router.get('/home',(req,res)=>{
    const { message } = req.query;
    let userName = 'Guest';
    if (message && message.includes('Welcome')) {
        const match = message.match(/^Welcome\s+([^,]+),/);
        if (match) {
            userName = match[1];
        }
    }
    res.render('home', { message, userName });
})

//=====================================

router.post('/logout', (req, res) => {
    res.redirect('/?message=You have been logged out.');
});


router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.redirect('/?error=Missing email or password');
        }

        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.redirect('/?error=No user found');
        }

        if (user.password !== password) {
            return res.redirect('/?error=Invalid password');
        }

        return res.redirect(`/home?message=Welcome ${user.name}, you are now logged in!`);
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(502).send('Bad Gateway...');
    }
});


router.post('/signup',async (req,res)=>{
    const {name, email, password} = req.body;
    try {
        if(!email || !password){
        return res.redirect('/signup?error=Missing name, email or password');
        }
        const existingUser  = await userSchema.findOne({email});
        if(existingUser){
            return res.redirect('/signup?error=Email already registered');
        }
        const newUser = new userSchema({name,email,password});
        await newUser.save()
        return res.redirect('/?message=Your registration is complete. Please log in.');
    } catch (err) {
        return res.status(502).json({error:'Bad Gateway...'});
    }
});

module.exports = router;