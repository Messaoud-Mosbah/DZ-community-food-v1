const express = require("express");
const router = express.Router();
const { protect, allwodTo } = require("../services/authService");
const { getOwnProfile, getUserProfileById } = require("../services/viewProfile");

const setType = (type) => (req, res, next) => { req.profileType = type; next(); };

router.get("/me", protect, allwodTo("RESTAURANT","USER"), getOwnProfile);
<<<<<<< HEAD
router.get("/", setType("RESTAURANT","USER"), viewProfileByIdValidator, getUserProfileById);
=======
router.get("/", setType("RESTAURANT","USER"), getUserProfileById);
>>>>>>> 1f679669762168fdfab5aa06ae7762b8e3b3e308

module.exports = router;