const {check,body,param} =require('express-validator')
const validatorMiddleware =require('../../middlewares/validatorMiddleware')
const User = require("../../models/userModel");





const signupValidator = [
check("userName")
    .trim()
    .notEmpty().withMessage("User name is required")
    .isLength({ min: 5 }).withMessage("User name is too short (min 5)")
    .isLength({ max: 20 }).withMessage("User name is too long (max 20)")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (val) => {
    const user = await User.findOne({ userName: val });
    if (user) throw new Error("Username already exists");

    }),

check("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(async (val) => {
    const user = await User.findOne({ email: val });
    if (user) throw new Error("Email already registered");

    },     
),

  check("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 8 characters")
    .isLength({ max: 18 }).withMessage("Password must be at most 16 characters"),

  check("passwordConfirm")
    .notEmpty().withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password")

      }
              return true;

    }),

    validatorMiddleware
    

]

const loginValidator = [
  check("identity")
    .notEmpty().withMessage("Email or Username is required"),

    body('email').optional()
    .notEmpty().withMessage('email required')
    .isEmail().withMessage('email invalid'),

    body('userName').optional()
    .matches(/^[a-zA-Z][a-zA-Z0-9]*$/)
    .notEmpty().withMessage('userName required'),
   
   check("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 8 characters")
    .isLength({ max: 18 }).withMessage("Password must be at most 16 characters"),

    validatorMiddleware

]

const updateUserRoleValidtor = [
  check("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["user", "resturant"]).withMessage("Invalid role type"),
  validatorMiddleware,
];

module.exports = {signupValidator ,loginValidator,updateUserRoleValidtor }