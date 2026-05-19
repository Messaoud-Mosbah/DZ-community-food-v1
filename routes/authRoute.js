const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const {
  signup,
  verifyEmail,
  resend_verification_email,

  signin,
  logout,

  forgetPassword,
  verifyResetToken,
  resetPassword,
  restaurantProfile,
  userProfile,
  protect,
  allwodTo,
} = require("../services/authService");

const {
  signupValidator,
  loginValidator,

  validatePassword,
  userProfileValidator,
  restaurantProfileValidator,
} = require("../utils/validators/authValidators");

router.post("/sign-up", signupValidator, signup);

router.get("/verify-email-token/:token", verifyEmail);

router.post("/resend-verification-email", resend_verification_email);
// no link with front end
router.post("/sign-out", protect, logout);

router.post("/sign-in", loginValidator, signin);

router.post("/forget-password", forgetPassword);
// problem in front  in the case of user.password=new password

router.get("/verify-reset-password-token/:token", verifyResetToken);
////////////////////////////////////
router.post("/reset-password", validatePassword, resetPassword);

router.patch(
  "/user/onboarding",
  protect,
  userProfileValidator,
  userProfile
);
router.patch(

  "/restaurant/onboarding",

  protect,
  restaurantProfileValidator,
  restaurantProfile
);

module.exports = router;
