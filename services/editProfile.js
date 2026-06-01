const { GENERATE_TOKEN } = require("../utils/createToken");
const asyncHandler = require("express-async-handler");
const { User, UserProfile, RestaurantProfile } = require("../models");
const ApiError = require("../utils/apiError");
const bcrypt = require("bcryptjs");
const { parseFormDataToProfile } = require("../utils/parse");

const userAttributes = ["id", "userName", "email", "slug", "role", "followersCount", "followingCount", "isVerified", "isOnboardingCompleted", "createdAt"];

exports.editUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user   = await User.findByPk(userId);
  if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

  let dbProfile = await UserProfile.findOne({ where: { userId } });
  if (!dbProfile) dbProfile = await UserProfile.create({ userId });

  const { profile } = parseFormDataToProfile(req.body);

  // ── Profile Picture ──────────────────────────────────────────
  if (req.files?.avatarImageFile?.[0]) {
    dbProfile.profilePicture = req.files.avatarImageFile[0].url;
  } else if (req.body.avatarImageFile === "") {
    dbProfile.profilePicture = null;
  }

  const basic = profile?.userBasicInformation;
  if (basic) {
    if (basic.fullName    !== undefined) dbProfile.fullName    = basic.fullName;
    if (basic.city        !== undefined) dbProfile.city        = basic.city;
    if (basic.phoneNumber !== undefined) dbProfile.phoneNumber = basic.phoneNumber;
    if (basic.bio         !== undefined) dbProfile.bio         = basic.bio;
  }
  const prefs = profile?.userUsagePreferences;
  if (prefs) {
    if (prefs.usageGoal !== undefined) {
      dbProfile.usageGoal = Array.isArray(prefs.usageGoal) ? prefs.usageGoal : [prefs.usageGoal];
      dbProfile.changed("usageGoal", true);
    }
    if (prefs.kitchenCategory !== undefined) {
      dbProfile.kitchenCategory = Array.isArray(prefs.kitchenCategory) ? prefs.kitchenCategory : [prefs.kitchenCategory];
      dbProfile.changed("kitchenCategory", true);
    }
  }

  await dbProfile.save();

  const newUser = await User.findByPk(userId, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });

  res.status(200).json({
    status:  "SUCCESS",
    message: "User profile updated successfully",
    data:    { user: newUser },
    errors:  null,
  });
});

exports.editRestaurantProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user   = await User.findByPk(userId);
  if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

  let dbProfile = await RestaurantProfile.findOne({ where: { userId } });
  if (!dbProfile) {
    dbProfile = await RestaurantProfile.create({
      userId,
      services:        { dineIn: "NO", takeAway: "NO", delivery: "NO", reservation: "NO", parkAvailability: "NO" },
      workingDays:     [],
      kitchenCategory: [],
    });
  }

  const { profile } = parseFormDataToProfile(req.body);

  // ── Logo ─────────────────────────────────────────────────────────────
  if (req.files?.avatarImageFile?.[0]) {
    dbProfile.restaurantLogoUrl = req.files.avatarImageFile[0].url;
  } else if (req.body.avatarImageFile === "") {
    dbProfile.restaurantLogoUrl = null;
  }

  const basic = profile?.restaurantBasicInformation;
  if (basic) {
    if (basic.restaurantName !== undefined) dbProfile.restaurantName = basic.restaurantName;
    if (basic.businessEmail  !== undefined) dbProfile.businessEmail  = basic.businessEmail;
    if (basic.phoneNumber    !== undefined) dbProfile.phoneNumber    = basic.phoneNumber;
  }

  const details = profile?.restaurantDetails;
  if (details) {
    if (details.bio !== undefined) dbProfile.bio = details.bio;

    // ── kitchenCategory ────────────────────────────────────────────────
    if (details.kitchenCategory !== undefined) {
      dbProfile.kitchenCategory = Array.isArray(details.kitchenCategory)
        ? details.kitchenCategory
        : [details.kitchenCategory];
      dbProfile.changed("kitchenCategory", true);
    }

    // ── Working Days ───────────────────────────────────────────────────
    if (details.workingDays !== undefined) {
      const wd = details.workingDays;
      const days  = Array.isArray(wd.day)  ? wd.day  : wd.day  ? [wd.day]  : [];
      const froms = Array.isArray(wd.from) ? wd.from : wd.from ? [wd.from] : [];
      const tos   = Array.isArray(wd.to)   ? wd.to   : wd.to   ? [wd.to]   : [];

      dbProfile.workingDays = days.map((day, i) => ({
        day,
        from: froms[i] || "",
        to:   tos[i]   || "",
      }));
      dbProfile.changed("workingDays", true);
    }
  }

  const location = profile?.restaurantLocationAndContact;
  if (location) {
    if (location.city           !== undefined) dbProfile.city           = location.city;
    if (location.street         !== undefined) dbProfile.street         = location.street;
    if (location.postalCode     !== undefined) dbProfile.postalCode     = location.postalCode;
    if (location.googleMapsLink !== undefined) dbProfile.googleMapsLink = location.googleMapsLink;
  }

  // ── Services ────────────────────────────────────────────────────────
  const services = profile?.restaurantServices;
  if (services) {
    dbProfile.services = { ...dbProfile.services, ...services };
    dbProfile.changed("services", true);
  }

  await dbProfile.save();

  const newUser = await User.findByPk(userId, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });

  res.status(200).json({
    status:  "SUCCESS",
    message: "Restaurant profile updated successfully",
    data:    { user: newUser },
    errors:  null,
  });
});

exports.editAccount = asyncHandler(async (req, res, next) => {
  const { userName, currentPassword, newPassword, newPasswordConfirm, email } = req.body;

  if (newPassword && !currentPassword) return next(new ApiError("Current password required", 400));
  if (newPassword && newPassword.length < 8) return next(new ApiError("New password must be at least 8 characters", 400));
  if (newPassword && newPassword !== newPasswordConfirm) return next(new ApiError("Passwords do not match", 400));

  const user = await User.findByPk(req.authenticatedUser.id);
  if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

  if (userName !== undefined) user.userName = userName;
  if (email    !== undefined) user.email    = email;

  if (currentPassword && newPassword) {
    const correct = await bcrypt.compare(currentPassword, user.password);
    if (!correct) return next(new ApiError("Current password is incorrect", 401));
    user.password          = newPassword;
    user.passwordChangedAt = Date.now();
  }

  await user.save();

  const jwtToken = await GENERATE_TOKEN({ email: user.email, id: user.id, userName: user.userName });
  const newUser  = await User.findByPk(user.id, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });

  res.status(200).json({ status: "SUCCESS", message: "Account updated successfully", data: { user: newUser, jwtToken }, errors: null });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const deleted = await User.destroy({ where: { id: req.authenticatedUser.id } });
  if (!deleted) return next(new ApiError("User not found", 404));
  res.status(200).json({ status: "SUCCESS", message: "Account deleted successfully", data: null, errors: null });
});