const { check, param, query } = require("express-validator");
const { User } = require("../../models/index");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const passwordValidator = (fieldName = "password") =>
  check(fieldName)
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .isLength({ max: 50 }).withMessage("Password must be at most 50 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~\-=]/).withMessage("Password must contain at least one special character");

const passwordConfirmValidator = check("passwordConfirm")
  .notEmpty().withMessage("Password confirmation is required")
  .custom((val, { req }) => {
    if (val !== req.body.password) throw new Error("Password confirmation does not match password");
    return true;
  });

// 1. Create User
exports.createUserValidator = [
  check("userName")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage("Username can only contain letters, numbers, and underscores")
    .custom(async (val) => {
      const user = await User.findOne({ where: { userName: val } });
      if (user) throw new Error("Username already exists");
      return true;
    }),

  check("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(async (val) => {
      const user = await User.findOne({ where: { email: val } });
      if (user) throw new Error("Email already registered");
      return true;
    }),

  passwordValidator(),
  passwordConfirmValidator,

  check("role")
    .optional()
    .isIn(["USER", "RESTAURANT", "ADMIN"]).withMessage("Invalid role type"),

  validatorMiddleware,
];

// 2. Get User
exports.getUserValidator = [
  param("id").isUUID(4).withMessage("Invalid user ID format"),
  validatorMiddleware,
];

// 3. Get User By Identifier
exports.getUserByIdentifierValidator = [
  query("identifier")
    .trim()
    .notEmpty().withMessage("Username or Email is required")
    .custom((value) => {
      const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_-]+$/.test(value) && value.length >= 3 && value.length <= 30;
      if (!isEmail && !isUsername)
        throw new Error("Please enter a valid Email or a Username (3-30 chars, no special symbols)");
      return true;
    }),
  validatorMiddleware,
];

// 4. Delete User
exports.deleteUserValidator = [
  param("id").isUUID(4).withMessage("Invalid user ID format"),
  validatorMiddleware,
];

// 5. Update User
exports.updateUserValidator = [
  param("id").isUUID(4).withMessage("Invalid user ID format"),

  check("userName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage("Invalid username format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ where: { userName: val } });
      if (user && user.id.toString() !== req.params.id)
        throw new Error("Username already in use by another user");
      return true;
    }),

  check("email")
    .optional()
    .isEmail().withMessage("Invalid email format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ where: { email: val } });
      if (user && user.id.toString() !== req.params.id)
        throw new Error("Email already in use by another user");
      return true;
    }),

  validatorMiddleware,
];

// 6. Change Password
exports.changeUserPasswordValidator = [
  param("id").isUUID(4).withMessage("Invalid user ID format"),
  check("currentPassword").notEmpty().withMessage("Current password is required"),
  passwordValidator(),
  passwordConfirmValidator,
  validatorMiddleware,
];