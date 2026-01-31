const express = require('express');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidators');

const {
  signup,
  login,
  
} = require('../services/authService');

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);

module.exports = router;
