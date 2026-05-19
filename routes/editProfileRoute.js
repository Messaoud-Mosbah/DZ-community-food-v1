const express = require("express");
const router = express.Router();
const { protect } = require("../services/authService");
const {
  editRestaurantProfile,
  editUserProfile,
 editAccount,
  verifyNewEmail,
  allwodTo,
} = require("../services/editProfile");
const {
  RestaurantProfileValidator,
  UserProfileValidator,
editAccountValidator
} = require("../utils/validators/editProfileValidator");

router.patch(
  "/user/edit-profile",
  protect,
  allwodTo("USER"),
  UserProfileValidator,
  editUserProfile,
);
router.patch(
  "/restaurant/edit-profile",
  protect,
  allwodTo("RESTAURANT"),
  RestaurantProfileValidator,
  editRestaurantProfile,
);

router.patch("/edit-account", protect,  allwodTo("USER", "RESTAURANT"), editAccountValidator, editAccount);

module.exports = router;
