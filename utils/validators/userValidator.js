const { check, param } = require("express-validator");
const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// create user validator
exports.createUserValidator = [
  check("userName")
    .trim()
    .notEmpty()
    .withMessage("User name cannot be empty")
    .isLength({ min: 3 })
    .withMessage("User name must be at least 3 characters long"),

  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("This email is already registered");
      }
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  check("role")
    .optional()
    .isIn(["user", "manager", "admin"])
    .withMessage("Role must be either user, manager, or admin"),

  validatorMiddleware,
];

// updateb validator user
exports.updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),

  check("userName")
    .optional()
    .isLength({ min: 3 })
    .withMessage("User name must be at least 3 characters long"),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email, { req }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new Error("This email is already registered by another user");
      }
    }),

  check("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  check("role")
    .optional()
    .isIn(["user", "manager", "admin"])
    .withMessage("Role must be either user, manager, or admin"),

  validatorMiddleware,
];

// get user validator

exports.getUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  validatorMiddleware,
];

// delete user validator
exports.deleteUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  validatorMiddleware,
];
