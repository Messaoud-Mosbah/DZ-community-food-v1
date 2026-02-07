

const { check, param } = require("express-validator");
const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// 1. Create User Validator
exports.createUserValidator = [
  check("userName")
    .trim()
    .notEmpty().withMessage("User name is required")
    .isLength({ min: 5 }).withMessage("User name is too short (min 5)")
    .isLength({ max: 20 }).withMessage("User name is too long (max 20)")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (val) => {
      const user = await User.findOne({ userName: val });
      if (user) throw new Error("Username already exists");
            return true;

    }),

  check("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) throw new Error("Email already registered");
            return true;

    }),
 

    

  check("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 8 characters")
    .isLength({ max: 18 }).withMessage("Password must be at most 16 characters"),

  check("passwordConfirm")
    .notEmpty().withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");

      }              return true;

    }),

  check("role")
    .optional()
    .isIn(["user", "resturant", "admin"]).withMessage("Invalid role type"),

  validatorMiddleware,
];

// 2. Update User Validator
exports.updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("userName")
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage("User name is too short")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Invalid username format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ userName: val });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error("Username already in use by another user");

      }              return true;

    }),

  check("email")
    .optional()
    .isEmail().withMessage("Invalid email format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error("Email already in use by another user");

      }              return true;

    }),

  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
check("currentPassword") 
    .notEmpty().withMessage("Current password is required"),
  check("password")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .isLength({ max: 16 }).withMessage("Password must be at most 16 characters"),


  check("passwordConfirm")
    .notEmpty().withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");

      }              return true;

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