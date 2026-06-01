const express = require("express");
const router = express.Router();
const cloudinaryUpload = require("../middlewares/uploadMiddleware");

const { protect, allwodTo } = require("../services/authService");
const { editRestaurantProfile, editUserProfile, editAccount, deleteAccount } = require("../services/editProfile");

const uploadAvatar = cloudinaryUpload.fields([{ name: "avatarImageFile", maxCount: 1 }]);

router.patch("/user/edit-profile",       protect, allwodTo("USER"),                uploadAvatar,        editUserProfile);
router.patch("/restaurant/edit-profile", protect, allwodTo("RESTAURANT"),          uploadAvatar, editRestaurantProfile);

router.patch("/edit-account",            protect, allwodTo("USER", "RESTAURANT"),  editAccount);
router.delete("/delete-account",         protect, allwodTo("USER", "RESTAURANT"),  deleteAccount);

module.exports = router;