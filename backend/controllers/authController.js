const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    res.status(400).send('Error creating user');
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
};

exports.updateUser = async (req, res) => {
  const { username, email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.username = username;
    user.email = email;
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    res.status(400).send('Error updating user');
  }
};
