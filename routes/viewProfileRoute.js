const express = require("express");
const router = express.Router();
const { protect, allwodTo } = require("../services/authService");
const { viewProfileByIdValidator } = require("../utils/validators/viewProfileValidator");
const { getOwnProfile, getUserProfileById } = require("../services/viewProfile");

const setType = (type) => (req, res, next) => { req.profileType = type; next(); };

router.get("/restaurant/me", protect, allwodTo("RESTAURANT"), getOwnProfile);
router.get("/user/me",        protect, allwodTo("USER"),       getOwnProfile);

router.get("/restaurant/:id", setType("RESTAURANT"), viewProfileByIdValidator, getUserProfileById);
router.get("/user/:id",       setType("USER"),       viewProfileByIdValidator, getUserProfileById);

module.exports = router;