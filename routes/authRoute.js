const express = require("express");
const router = express.Router();
const {
    signup, verifyEmail, resend_verification_email,
    signin, logout, toggleFollow,
    forgetPassword, verifyResetToken, resetPassword,
    restaurantProfile, userProfile,
    protect, allwodTo,
} = require("../services/authService");
const {
    signupValidator, loginValidator,
    validatePassword, userProfileValidator, restaurantProfileValidator,
} = require("../utils/validators/authValidators");
const upload = require("../middlewares/uploadMiddleware"); 
// ── AUTH ──────────────────────────────────────────────────────────
router.post("/sign-up",                  signupValidator,  signup);
router.get("/verify-email-token/:token", verifyEmail);
router.post("/resend-verification-email",resend_verification_email);
router.post("/sign-in",                  loginValidator,   signin);
router.post("/sign-out",                 protect,          logout);

// ── PASSWORD ──────────────────────────────────────────────────────
router.post("/forget-password",                    forgetPassword);
router.get("/verify-reset-password-token/:token",  verifyResetToken);
router.post("/reset-password",                     validatePassword, resetPassword);

// ── ONBOARDING ────────────────────────────────────────────────────
router.patch("/onboarding/user", protect,  upload.fields([{ name: "avatarImageFile", maxCount: 1 }]), userProfile);
router.patch("/onboarding/restaurant", protect ,upload.fields([{ name: "avatarImageFile", maxCount: 1 }]), restaurantProfile);
// ── FOLLOW ────────────────────────────────────────────────────────
router.post("/:userId/follow", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), toggleFollow);

module.exports = router;