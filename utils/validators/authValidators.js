const { check, body, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/user-info/userModel");
const KITCHEN_TYPES = [
  "Vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];
const DAYS_OF_WEEK = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const signupValidator = [
  check("userName")
    .trim()
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("User name is too short (min 3)") 
    .isLength({ max: 30 })
    .withMessage("User name is too long (max 30)")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (val) => {
      const user = await User.findOne({ where: { userName: val } });
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
      // التعديل: استخدام where في Sequelize
      const user = await User.findOne({ where: { email: val } });
      if (user) throw new Error("Email already registered");
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 50 })
    .withMessage("Password must be at most 18 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~\-=]/)
    .withMessage("Password must contain at least one special character"),
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

const loginValidator = [
  check("identifier").notEmpty().withMessage("Email or Username is required"),

  check("password").notEmpty().withMessage("Password is required"),

  validatorMiddleware,
];

const validatePassword = [
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 50 })
    .withMessage("Password must be at most 18 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~\-=]/)
    .withMessage("Password must contain at least one special character"),
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

// ------USER PROFILE VALIDATOR

const userProfileValidator = [
  check("role")
    .equals("USER")
    .withMessage("Role must be USER for this endpoint."),

  // --- userBasicInformation ---
  check("profile.userBasicInformation.fullName")
    .notEmpty()
    .withMessage("Full name is required."),

  check("profile.userBasicInformation.phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required.")
    .matches(/^(0)(5|6|7|2|3|4)\d{8}$/)
    .withMessage("Invalid Algerian phone number (e.g., 0550123456)."),

  check("profile.userBasicInformation.bio")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Bio cannot exceed 300 characters."),

  check("profile.userBasicInformation.profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL."),

  // --- userUsagePreferences ---
  // check("profile.userUsagePreferences.usageGoal")
  //   .isArray().withMessage("Usage goal must be an array (e.g., ['Order Food'])."),

  // check("profile.userUsagePreferences.kitchenCategory")
  //   .isArray().withMessage("Kitchen category must be an array.")
  //   .custom((value) => {
  //     const isValid = value.every((val) => KITCHEN_TYPES.includes(val));
  //     if (!isValid) throw new Error(`Invalid category. Allowed: ${KITCHEN_TYPES.join(", ")}`);
  //     return true;
  //   }),

  validatorMiddleware,
];
const restaurantProfileValidator = [
  check("role")
    .equals("RESTAURANT")
    .withMessage("Role must be RESTAURANT for this endpoint."),

  // --- restaurantBasicInformation ---
  check("profile-restaurantBasicInformation-restaurantName")
    .notEmpty()
    .withMessage("Restaurant name is required."),

  check("profile-restaurantBasicInformation-phoneNumber")
    .notEmpty()
    .withMessage("Restaurant phone number is required.")
    .matches(/^(0)(5|6|7|2|3|4)\d{8}$/)
    .withMessage("Invalid Algerian phone number."),

  // --- restaurantLocationAndContact ---
  check("profile-restaurantLocationAndContact-city")
    .notEmpty()
    .withMessage("City is required."),

  check("profile-restaurantLocationAndContact-street").optional(),

  check("profile-restaurantLocationAndContact-googleMapsLink")
    .notEmpty()
    .withMessage("googleMapsLink is required.")
    .isURL()
    .withMessage("Enter a valid URL."),

  // --- restaurantDetails ---
  check("profile-restaurantDetails-kitchenCategory")
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      if (arr.length < 1) throw new Error("Select at least one kitchen category.");
      const isValid = arr.every((val) => KITCHEN_TYPES.includes(val));
      if (!isValid) throw new Error("One or more selected categories are invalid.");
      return true;
    }),

  check("profile-restaurantDetails-workingDays")
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      if (arr.length < 1) throw new Error("Working days must have at least one entry.");
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      arr.forEach((item) => {
        const parsed = typeof item === "string" ? JSON.parse(item) : item;
        if (!DAYS_OF_WEEK.includes(parsed.day))
          throw new Error(`Invalid day: ${parsed.day}`);
        if (!timeRegex.test(parsed.from) || !timeRegex.test(parsed.to))
          throw new Error(`Invalid time format in ${parsed.day}`);
      });
      return true;
    }),

  // --- restaurantServices ---
  check("profile-restaurantServices")
    .custom((value) => {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      const allowedKeys = ["dineIn", "takeAway", "delivery", "reservation", "parkAvailability"];
      Object.keys(parsed).forEach((key) => {
        if (!allowedKeys.includes(key))
          throw new Error(`Invalid service key: ${key}`);
        if (!["YES", "NO"].includes(parsed[key]))
          throw new Error(`Service '${key}' must be YES or NO.`);
      });
      return true;
    }),

  validatorMiddleware,
];
module.exports = {
  signupValidator,
  loginValidator,

  validatePassword,
  restaurantProfileValidator,

  userProfileValidator,
};
