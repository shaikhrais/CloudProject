const router = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Auth login
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', authController.login);

// Auth logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Auth with Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback route for Google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('/');
});

// Auth signup
router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', authController.signup);

module.exports = router;
