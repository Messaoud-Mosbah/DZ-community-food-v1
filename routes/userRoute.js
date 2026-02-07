const express = require("express");

const {
  createUser,
  getAllUsers,
  getUser,
  getUserByIdentifier,
  updateUser,
  deleteUser,
  changeUserPassword
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
getUserByIdentifierValidator
} = require("../utils/validators/userValidator");

const router = express.Router();



router.post("/", createUserValidator,createUser);
router.get("/", getAllUsers);
router.get("/user",getUserByIdentifierValidator,getUserByIdentifier );

router.put("/changeUserPassword/:id",  changeUserPassword, changeUserPassword );


router.get("/:id", getUserValidator, getUser);
router.put("/:id", updateUserValidator, updateUser);

router.delete("/:id", deleteUserValidator, deleteUser);

module.exports = router;
