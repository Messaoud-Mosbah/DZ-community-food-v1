const { check, param } = require("express-validator");
const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// 1. Create User Validator
exports.createUserValidator = [
  check("userName")
    .trim()
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 5 })
    .withMessage("User name is too short (min 5)")
    .isLength({ max: 20 })
    .withMessage("User name is too long (max 20)")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (val) => {
      const user = await User.findOne({ userName: val });
      if (user) throw new Error("Username already exists");
      return true;
    }),

  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) throw new Error("Email already registered");
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 18 })
    .withMessage("Password must be at most 16 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  check("role")
    .optional()
    .isIn(["user", "resturant", "admin"])
    .withMessage("Invalid role type"),

  validatorMiddleware,
];

// 2. Update User Validator
exports.updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("userName")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("User name is too short")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Invalid username format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ userName: val });
      if (user && user._id.toString() !== req.params.id)
        throw new Error("Username already in use by another user");
      return true;
    }),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user && user._id.toString() !== req.params.id)
        throw new Error("Email already in use by another user");
      return true;
    }),

  validatorMiddleware,
];
// Page 1 – Basic Info
exports.ProfileBasicValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  // Required
  check("profile.fullName").notEmpty().withMessage("Full name is required"),
  // Optional
  check("profile.profilePicture").optional().isURL(),
  check("profile.city").optional().isString(),
  check("profile.phone").optional().isMobilePhone("any"),
  check("profile.bio").notEmpty().isLength({ max: 200 }),
  check("profile.socialLinks.*").optional().isURL(),
  check("profile.socialLinks").optional().isArray(),

  validatorMiddleware,
];

// Page 2 – Food Preferences
exports.FoodPreferencesValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("foodPreferences.favoriteCuisines").optional().isArray({ min: 1 }),
  check("foodPreferences.favoriteCuisines.*")
    .optional()
    .isIn(["Italian", "Asian", "Fast Food", "Traditional", "Vegan"])
    .withMessage("Invalid cuisine type"),

  check("foodPreferences.dietaryPreference")
    .optional()
    .isIn(["None", "Vegetarian", "Vegan", "Halal", "Gluten-free"])
    .withMessage("Invalid dietary preference"),

  check("foodPreferences.spiceLevel")
    .optional()
    .isIn(["Mild", "Medium", "Hot"])
    .withMessage("Invalid spice level"),

  validatorMiddleware,
];

// Page 3 – Usage Preferences (Optional)
exports.UsagePreferencesValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("usagePreferences.discoverRestaurants").optional().isBoolean(),
  check("usagePreferences.sharePhotos").optional().isBoolean(),
  check("usagePreferences.writeReviews").optional().isBoolean(),
  check("usagePreferences.followCreators").optional().isBoolean(),

  validatorMiddleware,
];
// Page 1 part 1 – Basic Restaurant Info (Required)
exports.RestaurantBasicValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("restaurant.restaurantName")
    .notEmpty()
    .withMessage("Restaurant name is required"),
  check("restaurant.logo")
    .notEmpty()
    .isURL()
    .withMessage("Restaurant logo is required"),
  check("restaurant.ownerName")
    .notEmpty()
    .withMessage("Owner name is required"),
  check("restaurant.businessEmail")
    .isEmail()
    .withMessage("Valid business email is required"),
  check("restaurant.phone")
    .notEmpty()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),

  validatorMiddleware,
];

// Page 1 part 2 – Location & Contact
exports.RestaurantLocationValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("restaurant.address").notEmpty().withMessage("Address is required"),
  check("restaurant.city").notEmpty().withMessage("City is required"),
  check("restaurant.googleMapsLink")
    .optional()
    .isURL()
    .withMessage("Invalid Google Maps link"),
  check("restaurant.deliveryAvailable").notEmpty().isBoolean(),

  validatorMiddleware,
];

// Page 2 – Restaurant Details (Required)
exports.RestaurantDetailsValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("restaurant.cuisineTypes")
    .isArray({ min: 1 })
    .withMessage("Cuisine types are required"),
  check("restaurant.cuisineTypes.*")
    .isIn(["Traditional", "Italian", "Asian", "Fast Food", "Cafe", "Dessert"])
    .withMessage("Invalid cuisine type"),

  check("restaurant.priceRange")
    .notEmpty()
    .isIn(["affordable", "medium", "expensive"])
    .withMessage("Invalid price range"),

  check("restaurant.openingHours.open")
    .notEmpty()
    .withMessage("Opening time is required"),
  check("restaurant.openingHours.close")
    .notEmpty()
    .withMessage("Closing time is required"),

  check("restaurant.daysOpen")
    .isArray({ min: 1 })
    .withMessage("Days open are required"),
  check("restaurant.daysOpen.*")
    .isIn(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
    .withMessage("Invalid day"),

  validatorMiddleware,
];

// Page 3 – Services (Required yes/no)
exports.RestaurantServicesValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("restaurant.services.dineIn").notEmpty().isBoolean(),
  check("restaurant.services.takeaway").notEmpty().isBoolean(),
  check("restaurant.services.delivery").notEmpty().isBoolean(),
  check("restaurant.services.reservation").notEmpty().isBoolean(),

  validatorMiddleware,
];

// Page 4 – Verification (Optional)
exports.RestaurantVerificationValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("restaurant.businessRegistrationNumber").optional().isString(),
  check("restaurant.description").optional().isString(),

  validatorMiddleware,
];

//change user psw
exports.changeUserPasswordValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  check("password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 16 })
    .withMessage("Password must be at most 16 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  validatorMiddleware,
];

// 3. Get/Delete User Validator
exports.getUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  validatorMiddleware,
];

exports.getUserByIdentifierValidator = [
  check("identifier")
    .notEmpty()
    .withMessage("user name  or email are required"),
  validatorMiddleware,
];
