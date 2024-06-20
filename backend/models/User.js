const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // Make password optional for Google OAuth users
  }
});

module.exports = mongoose.model('User', userSchema);
