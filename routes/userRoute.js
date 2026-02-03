const express = require("express");

const {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

router.post("/", createUserValidator, createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserValidator, getUser);
router.put("/:id", updateUserValidator, updateUser);
router.delete("/:id", deleteUserValidator, deleteUser);

module.exports = router;
