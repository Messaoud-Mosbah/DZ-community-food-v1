const upload = require("../middlewares/uploadMiddleware"); 
const asyncHandler = require("express-async-handler");
const { User, UserProfile, RestaurantProfile } = require("../models");
const userAttributes = ["id", "userName", "email", "slug", "role", "followersCount", "followingCount", "isOnboardingCompleted", "createdAt"];

exports.editUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);
  if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

  let profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) profile = await UserProfile.create({ userId });

  if (req.files?.avatarImageFile?.[0]) {
    profile.profilePicture = `/uploads/images/${req.files.avatarImageFile[0].filename}`;
  } else if (req.body.avatarImageFile === "") {
    profile.profilePicture = null;
  }

  const fields = {
    fullName:        "profile-userBasicInformation-fullName",
    city:            "profile-userBasicInformation-city",
    phoneNumber:     "profile-userBasicInformation-phoneNumber",
    bio:             "profile-userBasicInformation-bio",
    usageGoal:       "profile-userUsagePreferences-usageGoal",
    kitchenCategory: "profile-userUsagePreferences-kitchenCategory",
  };

  Object.entries(fields).forEach(([profileField, bodyKey]) => {
    if (req.body[bodyKey] !== undefined) {
      const value = req.body[bodyKey];
      if (profileField === "usageGoal" || profileField === "kitchenCategory") {
        profile[profileField] = Array.isArray(value) ? value : [value];
      } else {
        profile[profileField] = value;
      }
    }
  });

  await profile.save();

  const newUser = await User.findByPk(userId, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });
  res.status(200).json({ status: "SUCCESS", message: "User profile updated successfully", data: { user: newUser }, errors: null });
});


exports.editRestaurantProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);
  if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

  let profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) {
    profile = await RestaurantProfile.create({
      userId,
      services: { dineIn: "NO", takeAway: "NO", delivery: "NO", reservation: "NO", parkAvailability: "NO" },
      workingDays: [],
      kitchenCategory: [],
    });
  }

  // الصورة
  if (req.files?.avatarImageFile?.[0]) {
    profile.restaurantLogoUrl = `/uploads/images/${req.files.avatarImageFile[0].filename}`;
  } else if (req.body.avatarImageFile === "") {
    profile.restaurantLogoUrl = null;
  }

  // الحقول العادية
  const fields = {
    restaurantName: "profile-restaurantBasicInformation-restaurantName",
    businessEmail:  "profile-restaurantBasicInformation-businessEmail",
    phoneNumber:    "profile-restaurantBasicInformation-phoneNumber",
    bio:            "profile-restaurantBasicInformation-bio",
    city:           "profile-restaurantLocationAndContact-city",
    street:         "profile-restaurantLocationAndContact-street",
    postalCode:     "profile-restaurantLocationAndContact-postalCode",
    googleMapsLink: "profile-restaurantLocationAndContact-googleMapsLink",
    kitchenCategory:"profile-restaurantDetails-kitchenCategory",
    services:       "profile-restaurantServices",
  };

  Object.entries(fields).forEach(([profileField, bodyKey]) => {
    if (req.body[bodyKey] !== undefined) {
      const value = req.body[bodyKey];
      if (profileField === "kitchenCategory") {
        profile[profileField] = Array.isArray(value) ? value : [value];
        profile.changed("kitchenCategory", true);
      } else if (profileField === "services") {
        profile[profileField] = typeof value === "string" ? JSON.parse(value) : value;
        profile.changed("services", true);
      } else {
        profile[profileField] = value;
      }
    }
  });

  // workingDays من الـ flat fields
  const days  = req.body["profile-restaurantDetails-workingDays-day"];
  const froms = req.body["profile-restaurantDetails-workingDays-from"];
  const tos   = req.body["profile-restaurantDetails-workingDays-to"];

  if (days !== undefined) {
    const daysArr  = Array.isArray(days)  ? days  : [days];
    const fromsArr = Array.isArray(froms) ? froms : [froms];
    const tosArr   = Array.isArray(tos)   ? tos   : [tos];

    profile.workingDays = daysArr.map((day, i) => ({
      day,
      from: fromsArr[i],
      to:   tosArr[i],
    }));
    profile.changed("workingDays", true);
  }

  await profile.save();

  const newUser = await User.findByPk(userId, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });
  res.status(200).json({ status: "SUCCESS", message: "Restaurant profile updated successfully", data: { user: newUser }, errors: null });
});

exports.editAccount = asyncHandler(async (req, res, next) => {
    const { userName, currentPassword, newPassword, newPasswordConfirm, email } = req.body;

    if (newPassword && !currentPassword) return next(new ApiError("Current password required", 400));
    if (newPassword && newPassword.length < 8) return next(new ApiError("New password must be at least 8 characters", 400));
    if (newPassword && newPassword !== newPasswordConfirm) return next(new ApiError("Passwords do not match", 400));

    const user = await User.findByPk(req.authenticatedUser.id);
    if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

    if (userName !== undefined) user.userName = userName;
    if (email !== undefined) user.email = email;

    if (currentPassword && newPassword) {
        const correct = await bcrypt.compare(currentPassword, user.password);
        if (!correct) return next(new ApiError("Current password is incorrect", 401));
        user.password = newPassword;
        user.passwordChangedAt = Date.now();
    }

    await user.save();

    const jwtToken = await GENERATE_TOKEN({ email: user.email, id: user.id, userName: user.userName });
    const newUser = await User.findByPk(user.id, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });

    res.status(200).json({ status: "SUCCESS", message: "Account updated successfully", data: { user: newUser, jwtToken }, errors: null });
});

// ── Delete Account ────────────────────────────────────────────────

exports.deleteAccount = asyncHandler(async (req, res, next) => {
    const deleted = await User.destroy({ where: { id: req.authenticatedUser.id } });
    if (!deleted) return next(new ApiError("User not found", 404));
    res.status(200).json({ status: "SUCCESS", message: "Account deleted successfully", data: null, errors: null });
});