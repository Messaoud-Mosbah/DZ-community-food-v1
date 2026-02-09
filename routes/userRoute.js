const express = require("express");

const {
  createUser,
  getAllUsers,
  getUser,
  getUserByIdentifier,
  updateUser,
  deleteUser,
  changeUserPassword,
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  getUserByIdentifierValidator,
  ProfileBasicValidator,
  FoodPreferencesValidator,
  UsagePreferencesValidator,
  RestaurantBasicValidator,
  RestaurantLocationValidator,
  RestaurantDetailsValidator,
  RestaurantServicesValidator,
  RestaurantVerificationValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

router.post("/", createUserValidator, createUser);
router.get("/", getAllUsers);
router.get("/user", getUserByIdentifierValidator, getUserByIdentifier);
router.put("/changeUserPassword/:id", changeUserPassword, changeUserPassword);

router.get("/:id", getUserValidator, getUser);
router.put("/:id", updateUserValidator, updateUser);
router.delete("/:id", deleteUserValidator, deleteUser);

// NORMAL USER PROFILE

/* paga 1
  fullName, profilePicture, city, phone, bio, social links
 */
router.put("/profile/basic/:id", ProfileBasicValidator, updateUser);

/*Page 2 
  favoriteCuisines, dietaryPreference, spiceLevel
 */
router.put(
  "/profile/food-preferences/:id",
  FoodPreferencesValidator,
  updateUser,
);

/* Page 3
  discoverRestaurants, sharePhotos, writeReviews, followCreators
 */
router.put(
  "/profile/usage-preferences/:id",
  UsagePreferencesValidator,
  updateUser,
);

//restaurant profile

/* Page 1 
Restaurant Name,Restaurant Logo ,OwnerName, Business Email, Phone Number
  Location & Contact
 */
router.put(
  "/restaurant/basic/:id",
  RestaurantBasicValidator,
  RestaurantLocationValidator,
  updateUser,
);

/* Page 2 
  Restaurant Details (required)
 */
router.put("/restaurant/details/:id", RestaurantDetailsValidator, updateUser);

/* Page 3 
  Services (yes / no)
 */
router.put("/restaurant/services/:id", RestaurantServicesValidator, updateUser);

/* Page 4 
  Verification (optional)
 */
router.put(
  "/restaurant/verification/:id",
  RestaurantVerificationValidator,
  updateUser,
);

module.exports = router;
