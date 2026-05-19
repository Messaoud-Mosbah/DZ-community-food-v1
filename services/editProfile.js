const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const crypto = require("crypto");
const { Op } = require("sequelize");

const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const { GENERATE_TOKEN } = require("../utils/createToken");

const { User, UserProfile, RestaurantProfile } = require("../models");
const userAttributes = [
  "id",
  "userName",
  "email",
  "role",
  "status",
  "isVerified",
  "createdAt",
  "isLoggedOut",
  "isOnboardingCompleted",
    "pendingEmail",

  "updatedAt",
  "slug",
];
// check if the user has the right role before doing anything

exports.allwodTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.authenticatedUser)
      return next(new ApiError("You are not logged in", 401));
    if (!roles.includes(req.authenticatedUser.role))
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    next();
  });

//edit user profile
exports.editUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);
  if (user.isLoggedOut) {
    return next(new ApiError("you logged out ,please sign in again", 403));
  }
  let profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) profile = await UserProfile.create({ userId });
  const { userBasicInformation, userUsagePreferences } = req.body.profile || {};
  if (userBasicInformation) {
    const basicFields = [
      "fullName",
      "city",
      "phoneNumber",
      "bio",
      "profilePicture",
    ];
    basicFields.forEach((field) => {
      if (userBasicInformation[field] !== undefined) {
        profile[field] = userBasicInformation[field];
      }
    });
  }
  if (userUsagePreferences) {
    const prefFields = ["usageGoal", "kitchenCategory"];
    prefFields.forEach((field) => {
      if (userUsagePreferences[field] !== undefined) {
        profile[field] = userUsagePreferences[field];
      }
    });
  }

  await profile.save();
  await user.save();

  const newUser = await User.findByPk(userId, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });
  res.status(200).json({
    status: "SUCCESS",
    message: "User profile updated successfully",
    data: {
      user: newUser,
    },
    errors: null,
  });
});

exports.editRestaurantProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);
  if (user.isLoggedOut) {
    return next(new ApiError("you logged out ,please sign in again", 403));
  }

  let profile = await RestaurantProfile.findOne({ where: { userId } });

  if (!profile) {
    profile = await RestaurantProfile.create({
      userId,
      services: {
        dineIn: "NO",
        takeAway: "NO",
        delivery: "NO",
        reservation: "NO",
        parkAvailability: "NO",
      },
      workingDays: [],
      kitchenCategory: [],
    });
  }
  const {
    restaurantBasicInformation,
    restaurantLocationAndContact,
    restaurantDetails,
    restaurantServices,
  } = req.body.profile || {};

  if (restaurantBasicInformation) {
    const basicFields = [
      "restaurantName",
      "businessEmail",
      "phoneNumber",
      "restaurantLogoUrl",
      "bio"
    ];
    basicFields.forEach((field) => {
      if (restaurantBasicInformation[field] !== undefined)
        profile[field] = restaurantBasicInformation[field];
    });
  }

  if (restaurantLocationAndContact) {
    const locationFields = ["city", "street", "postalCode", "googleMapsLink"];
    locationFields.forEach((field) => {
      if (restaurantLocationAndContact[field] !== undefined)
        profile[field] = restaurantLocationAndContact[field];
    });
  }

  if (restaurantDetails) {
    if (restaurantDetails.kitchenCategory !== undefined)
      profile.kitchenCategory = restaurantDetails.kitchenCategory;
    if (restaurantDetails.workingDays !== undefined)
      profile.workingDays = restaurantDetails.workingDays;}
    if (restaurantServices !== undefined) {
      profile.services = restaurantServices;

    }


  await profile.save();
  await user.save();
  
  const newUser = await User.findByPk(userId, {
    attributes: userAttributes,
    include: [UserProfile, RestaurantProfile],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Restaurant profile updated successfully",
    data: { user: newUser },
    errors: null,
  });
});

exports.editAccount = asyncHandler(async (req, res, next) => {
  const { userName, currentPassword, newPassword, email } = req.body;

  const user = await User.findByPk(req.authenticatedUser.id);
  
  if (user.isLoggedOut) {
    return next(new ApiError("you logged out, please sign in again", 403));
  }

  if (userName !== undefined) {
    user.userName = userName;
  }
  if (currentPassword || newPassword) {
    const correct = await bcrypt.compare(currentPassword, user.password);
    if (!correct) {
      return next(new ApiError("Current password is incorrect", 401));
    }
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
  }

  if (email) {
    const existing = await User.findOne({ where: { email } });
    if (existing && existing.id !== user.id) {
      return next(new ApiError("Email already in use", 400));
    }

    if (user.email === email) {
      return next(new ApiError("This is already your current email", 400));
    }

    user.email = email;
  } 

  await user.save();

  const jwtToken = await GENERATE_TOKEN({
    email: user.email,
    id: user.id,
    userName: user.userName,
  });

  const newUser = await User.findByPk(req.authenticatedUser.id, {
    attributes: userAttributes, // تأكد من تعريف userAttributes مسبقاً
    include: [UserProfile, RestaurantProfile],
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Account changed successfully",
    data: {
      user: newUser,
      jwtToken,
    },
    errors: null,
  });
}); 