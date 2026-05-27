const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const KITCHEN_TYPES = [
  "vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];

exports.UserProfileValidator = [
  check("profile-userBasicInformation-userName")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username can only contain letters, numbers, _ and -"),

  check("profile-userBasicInformation-fullName").optional(),

  check("profile-userBasicInformation-city").optional(),

  check("profile-userBasicInformation-phoneNumber")
    .optional()
    .matches(/^(0)(5|6|7|2|3|4)\d{8}$/)
    .withMessage("Please provide a valid Algerian phone number (e.g., 0550123456)."),

  check("profile-userBasicInformation-bio")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Bio must not exceed 300 characters."),

  check("profile-userUsagePreferences-usageGoal")
    .optional()
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      return true;
    }),

  check("profile-userUsagePreferences-kitchenCategory")
    .optional()
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      if (arr.length < 1) throw new Error("Select at least one kitchen category.");
      const isValid = arr.every((val) => KITCHEN_TYPES.includes(val));
      if (!isValid) throw new Error("One or more selected categories are invalid.");
      return true;
    }),

  validatorMiddleware,
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

exports.RestaurantProfileValidator = [
  check("userName")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username can only contain letters, numbers, _ and -"),

  check("profile-restaurantBasicInformation-restaurantName").optional(),

  check("profile-restaurantBasicInformation-businessEmail")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email."),

  check("profile-restaurantBasicInformation-phoneNumber")
    .optional()
    .matches(/^(0)(5|6|7|2|3|4)\d{8}$/)
    .withMessage("Please provide a valid Algerian phone number."),

  check("profile-restaurantLocationAndContact-city").optional(),

  check("profile-restaurantLocationAndContact-street").optional(),

  check("profile-restaurantLocationAndContact-postalCode").optional(),

  check("profile-restaurantLocationAndContact-googleMapsLink")
    .optional()
    .isURL()
    .withMessage("Google Maps link must be a valid URL."),

  check("profile-restaurantDetails-kitchenCategory")
    .optional()
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      if (arr.length < 1) throw new Error("Select at least one kitchen category.");
      const isValid = arr.every((cat) => KITCHEN_TYPES.includes(cat));
      if (!isValid) throw new Error(`Invalid category. Allowed: ${KITCHEN_TYPES.join(", ")}`);
      return true;
    }),

  check("profile-restaurantDetails-workingDays")
    .optional()
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      if (arr.length < 1) throw new Error("Working days must have at least one entry.");
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      arr.forEach((item, index) => {
        const parsed = typeof item === "string" ? JSON.parse(item) : item;
        if (!parsed.day || !DAYS_OF_WEEK.includes(parsed.day))
          throw new Error(`Item ${index + 1}: Invalid day.`);
        if (!parsed.from || !parsed.to)
          throw new Error(`Day ${parsed.day}: 'from' and 'to' required.`);
        if (!timeRegex.test(parsed.from) || !timeRegex.test(parsed.to))
          throw new Error(`Day ${parsed.day}: Time must be HH:mm.`);
      });
      return true;
    }),

  check("profile-restaurantServices")
    .optional()
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