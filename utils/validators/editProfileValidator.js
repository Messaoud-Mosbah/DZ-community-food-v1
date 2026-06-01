const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const KITCHEN_TYPES = [
  "Vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];

