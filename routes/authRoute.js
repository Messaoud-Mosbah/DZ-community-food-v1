
const express = require('express');
const router = express.Router();

const authServices = require('../services/authService')
const { registerValidator, loginValidator } = require("../utils/validators/authValidators");



router.post("/register", registerValidator,authServices.register);
router.post("/login", loginValidator,authServices.login);




module.exports = router;



