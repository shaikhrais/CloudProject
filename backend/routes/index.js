const router = require('express').Router();
const authController = require('../controllers/authController');

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.redirect('/auth/login');
  } else {
    next();
  }
};

router.get('/profile', authCheck, (req, res) => {
  res.render('profile', { user: req.user });
});

router.post('/profile', authCheck, authController.updateUser);

module.exports = router;
