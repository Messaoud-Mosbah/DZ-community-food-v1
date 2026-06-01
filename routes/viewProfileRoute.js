const express = require("express");
const router = express.Router();
const { protect, allwodTo } = require("../services/authService");
const { viewProfileByIdValidator } = require("../utils/validators/viewProfileValidator");
const { getOwnProfile, getUserProfileById } = require("../services/viewProfile");

const setType = (type) => (req, res, next) => { req.profileType = type; next(); };

router.get("/me", protect, allwodTo("RESTAURANT","USER"), getOwnProfile);
router.get("/", setType("RESTAURANT","USER"), viewProfileByIdValidator, getUserProfileById);

module.exports = router;