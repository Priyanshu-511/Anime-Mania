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


router.get('/api/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.json({ results: [], message: 'No search query provided' });
  }
  
  fs.readFile(path.join(__dirname, '../movies.json'), 'utf8', (err, jsonData) => {
    if (err) return res.status(500).json({ error: 'Error loading anime data' });
    
    const data = JSON.parse(jsonData);
    const searchTerm = query.toLowerCase();
    
    const results = data.filter(anime => {
      return (
        (anime["Anime name"] && anime["Anime name"].toLowerCase().includes(searchTerm)) ||
        (anime.Genre && anime.Genre.toLowerCase().includes(searchTerm)) ||
        (anime.Year && anime.Year.toString().includes(searchTerm)) ||
        (anime.Summary && anime.Summary.toLowerCase().includes(searchTerm)) ||
        (anime.Stars && anime.Stars.toLowerCase().includes(searchTerm))
      );
    });
    
    res.json({ 
      results, 
      total: results.length,
      query: query
    });
  });
});


router.get('/api/anime/:name', (req, res) => {
  const animeName = req.params.name;
  
  fs.readFile(path.join(__dirname, '../movies.json'), 'utf8', (err, jsonData) => {
    if (err) return res.status(500).json({ error: 'Error loading anime data' });
    
    const data = JSON.parse(jsonData);
    const anime = data.find(item => 
      item["Anime name"] && item["Anime name"].toLowerCase() === animeName.toLowerCase()
    );
    
    if (!anime) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    res.json(anime);
  });
});

router.post('/add-anime', (req, res) => {
  fs.readFile(path.join(__dirname, '../movies.json'), 'utf8', (err, jsonData) => {
    if (err) return res.status(500).send("Error reading data");

    let animeList = JSON.parse(jsonData);
    
    // Validate required fields
    if (!req.body["Anime name"] || !req.body.Year || !req.body.Score) {
      return res.redirect('/home?error=Missing required fields');
    }
    
    // Check if anime already exists
    const existingAnime = animeList.find(anime => 
      anime["Anime name"] && anime["Anime name"].toLowerCase() === req.body["Anime name"].toLowerCase()
    );
    
    if (existingAnime) {
      return res.redirect('/home?error=Anime already exists in database');
    }
    
    // Add timestamp for when the anime was added
    req.body.dateAdded = new Date().toISOString();
    
    animeList.push(req.body);

    fs.writeFile(path.join(__dirname, '../movies.json'), JSON.stringify(animeList, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving data");
      res.redirect('/home?message=Anime added successfully!');
    });
  });
});

// Delete anime endpoint
router.delete('/api/delete/:name', (req, res) => {
  const animeName = req.params.name;
  
  fs.readFile(path.join(__dirname, '../movies.json'), 'utf8', (err, jsonData) => {
    if (err) return res.status(500).json({ error: 'Error loading anime data' });
    
    let animeList = JSON.parse(jsonData);
    const initialLength = animeList.length;
    
    animeList = animeList.filter(anime => 
      !anime["Anime name"] || anime["Anime name"].toLowerCase() !== animeName.toLowerCase()
    );
    
    if (animeList.length === initialLength) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    fs.writeFile(path.join(__dirname, '../movies.json'), JSON.stringify(animeList, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Error saving data' });
      res.json({ message: 'Anime deleted successfully' });
    });
  });
});

router.get('/api/delete/:name', (req, res) => {
  const animeName = req.params.name;
  
  fs.readFile(path.join(__dirname, '../movies.json'), 'utf8', (err, jsonData) => {
    if (err) return res.status(500).json({ error: 'Error loading anime data' });
    
    let animeList = JSON.parse(jsonData);
    const initialLength = animeList.length;
    
    animeList = animeList.filter(anime => 
      !anime["Anime name"] || anime["Anime name"].toLowerCase() !== animeName.toLowerCase()
    );
    
    if (animeList.length === initialLength) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    
    fs.writeFile(path.join(__dirname, '../movies.json'), JSON.stringify(animeList, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Error saving data' });
      res.json({ message: 'Anime deleted successfully' });
    });
  });
});

router.get('/view-json', (req, res) => {
  const filePath = path.join(__dirname, '../movies.json');
  fs.readFile(filePath, 'utf8', (err, jsonData) => {
    if (err) return res.status(500).send('Error reading movies.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonData);
  });
});

router.get('/download-json', (req, res) => {
  const filePath = path.join(__dirname, '../movies.json');
  res.download(filePath, 'anime-data.json');
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
