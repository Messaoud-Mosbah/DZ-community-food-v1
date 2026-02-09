const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

// 1. create a user
exports.createUser = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ data: doc });
  });

// get all users
exports.getallUsers = (Model) =>
  asyncHandler(async (req, res) => {
    const docs = await Model.find();
    res.status(200).json({ data: docs });
  });

// 3. get one user
exports.getSingleUser = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(
        new ApiError(`No user found for this id ${req.params.id}`, 404),
      );
    }
    res.status(200).json({ data: doc });
  });

// @desc    Get specific user by email or userName
exports.getUserByIdentifier = asyncHandler(async (req, res, next) => {
  const { identifier } = req.query;

  const user = await User.findOne({
    $or: [{ email: identifier }, { userName: identifier }],
  });

  if (!user) {
    return next(new ApiError(`No user found for: ${identifier}`, 404));
  }

  res.status(200).json({ status: "success", data: user });
});

//update user
// Update User
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(
      new ApiError(`No user found for this id ${req.params.id}`, 404),
    );

  // Update top-level fields
  if (req.body.userName) user.userName = req.body.userName;
  if (req.body.email) user.email = req.body.email;

  // Helper to safely update nested objects
  const updateNested = (target, source) => {
    if (!source) return;
    Object.keys(source).forEach((key) => {
      if (Array.isArray(source[key])) {
        // Replace arrays completely
        target[key] = source[key];
      } else if (source[key] !== null && typeof source[key] === "object") {
        // Recursive merge for nested objects
        target[key] = target[key] || {};
        updateNested(target[key], source[key]);
      } else if (source[key] !== undefined) {
        target[key] = source[key];
      }
    });
  };

  // Update nested objects safely
  updateNested(user.profile, req.body.profile);
  updateNested(user.foodPreferences, req.body.foodPreferences);
  updateNested(user.usagePreferences, req.body.usagePreferences);
  updateNested(user.restaurant, req.body.restaurant);

  // Save changes
  await user.save();

  res.status(200).json({ status: "success", data: user });
});

// 5. change the password
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    return next(
      new ApiError(`No user found for this id ${req.params.id}`, 404),
    );
  }

  const isCorrectPassword = await bcrypt.compare(
    req.body.currentPassword,
    user.password,
  );

  if (!isCorrectPassword) {
    return next(new ApiError("Current password is wrong", 401));
  }

  user.password = req.body.password;
  user.passwordChangedAt = Date.now();

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

// 6. حذف مستخدم
exports.deleteUser = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new ApiError(`No user found for this id ${req.params.id}`, 404),
      );
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  });
