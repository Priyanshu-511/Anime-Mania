const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/usermodels');

passport.use(new LocalStrategy(
  { usernameField: 'email' }, // use if your form uses name="email"
  async (email, password, done) => {
    console.log('Received credentials:', email, password);
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'Invalid username' });
      }

      if (user.password === password) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (err) {
      return done(err);
    }
  }
));

module.exports = passport;
