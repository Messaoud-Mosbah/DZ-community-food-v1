const express = require('express');
const router = express.Router();

const {signup,
    login,
    updateUserRole ,
    protect,
    forgotPassword,resetPassword,verifyEmail ,sendVerificationEmail
} = require('../services/authService');

const { signupValidator,
    loginValidator,
    updateUserRoleValidtor
 } = require("../utils/validators/authValidators");



router.post("/signup", signupValidator,signup);
router.patch("/signup/role",protect, updateUserRoleValidtor,updateUserRole );


router.post("/login", loginValidator,login);



router.get('/resetPassword/:token', (req, res) => {
  res.send(`
    <h2>Reset Password</h2>
    <form method="POST" action="/api/v1/auth/resetPassword/${req.params.token}">
      <input type="password" name="password" placeholder="New Password" required /><br><br>
      <input type="password" name="passwordConfirm" placeholder="Confirm Password" required /><br><br>
      <button type="submit">Reset</button>
    </form>
  `);
});


router.post('/forgotPassword' ,forgotPassword );
router.post('/resetPassword/:token',resetPassword);
router.get('/verifyEmail/:token',verifyEmail);
router.post('/sendVerificationEmail',protect,sendVerificationEmail);

module.exports = router;



