const express = require('express');
const user = require('../models/usermodels');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => res.render('login'));
router.get('/signup', (req, res) => res.render('signup'));

router.get('/home', (req, res) => {
  const { message } = req.query;
  let userName = 'Guest';

  if (message && message.includes('Welcome')) {
    const match = message.match(/^Welcome\s+([^,]+),/);
    if (match) userName = match[1];
  }

  fs.readFile(path.join(__dirname, '../movies.json'), 'utf8', (err, jsonData) => {
    if (err) return res.status(500).send('Error loading anime data');
    const data = JSON.parse(jsonData);
    res.render('home', { message, userName, data });
  });
});

router.post('/add-anime', (req, res) => {
  fs.readFile(path.join(__dirname, '../movies.json'), 'utf8', (err, jsonData) => {
    if (err) return res.status(500).send("Error reading data");

    let animeList = JSON.parse(jsonData);
    animeList.push(req.body);

    fs.writeFile(path.join(__dirname, '../movies.json'), JSON.stringify(animeList, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving data");
      res.redirect('/home');
    });
  });
});

router.post('/logout', (req, res) => {
  res.redirect('/?message=You have been logged out.');
});

router.post('/', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/?error=Login failed');
    return res.redirect(`/home?message=Welcome ${user.name}, you are now logged in!`);
  })(req, res, next);
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!email || !password || !name)
      return res.redirect('/signup?error=Missing name, email or password');

    const existingUser = await user.findOne({ email });
    if (existingUser)
      return res.redirect('/signup?error=Email already registered');

    const newUser = new user({ name, email, password });
    await newUser.save();
    return res.redirect('/?message=Your registration is complete. Please log in.');
  } catch (err) {
    return res.status(502).json({ error: 'Bad Gateway...' });
  }
});

module.exports = router;