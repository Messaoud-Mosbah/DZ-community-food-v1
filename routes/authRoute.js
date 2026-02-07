const express = require('express');
const router = express.Router();

const {signup,
    login,
    updateUserRole ,
    protect
} = require('../services/authService');

const { signupValidator,
    loginValidator,
    updateUserRoleValidtor
 } = require("../utils/validators/authValidators");



router.post("/signup", signupValidator,signup);
router.patch("/signup/role",protect, updateUserRoleValidtor,updateUserRole );


router.post("/login", loginValidator,login);




module.exports = router;



