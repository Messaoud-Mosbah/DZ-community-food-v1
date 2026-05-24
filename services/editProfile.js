const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const { User, UserProfile, RestaurantProfile } = require("../models");
const { GENERATE_TOKEN } = require("../utils/createToken");

const userAttributes = [
    "id", "userName", "email", "role", "status",
    "isVerified", "isLoggedOut", "isOnboardingCompleted",
    "pendingEmail", "slug", "followersCount", "followingCount",
    "createdAt", "updatedAt"
];

const updateFields = (target, source, fields) => {
    fields.forEach(field => { if (source[field] !== undefined) target[field] = source[field]; });
};

// ── Permissions ───────────────────────────────────────────────────

exports.allwodTo = (...roles) =>
    asyncHandler(async (req, res, next) => {
        if (!req.authenticatedUser) return next(new ApiError("You are not logged in", 401));
        if (!roles.includes(req.authenticatedUser.role)) return next(new ApiError("You are not allowed to access this route", 403));
        next();
    });

// ── Edit User Profile ─────────────────────────────────────────────

exports.editUserProfile = asyncHandler(async (req, res, next) => {
    const userId = req.authenticatedUser.id;
    const user = await User.findByPk(userId);
    if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

    let profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) profile = await UserProfile.create({ userId });

    const { userBasicInformation, userUsagePreferences } = req.body.profile || {};
    if (userBasicInformation) updateFields(profile, userBasicInformation, ["fullName", "city", "phoneNumber", "bio", "profilePicture"]);
    if (userUsagePreferences) updateFields(profile, userUsagePreferences, ["usageGoal", "kitchenCategory"]);

    await profile.save();

    const newUser = await User.findByPk(userId, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });
    res.status(200).json({ status: "SUCCESS", message: "User profile updated successfully", data: { user: newUser }, errors: null });
});

// ── Edit Restaurant Profile ───────────────────────────────────────

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
            kitchenCategory: []
        });
    }

    const { restaurantBasicInformation, restaurantLocationAndContact, restaurantDetails, restaurantServices } = req.body.profile || {};

    if (restaurantBasicInformation) updateFields(profile, restaurantBasicInformation, ["restaurantName", "businessEmail", "phoneNumber", "restaurantLogoUrl", "bio"]);
    if (restaurantLocationAndContact) updateFields(profile, restaurantLocationAndContact, ["city", "street", "postalCode", "googleMapsLink"]);
    if (restaurantDetails) {
        if (restaurantDetails.kitchenCategory !== undefined) profile.kitchenCategory = restaurantDetails.kitchenCategory;
        if (restaurantDetails.workingDays !== undefined) profile.workingDays = restaurantDetails.workingDays;
    }
    if (restaurantServices !== undefined) profile.services = restaurantServices;

    await profile.save();

    const newUser = await User.findByPk(userId, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });
    res.status(200).json({ status: "SUCCESS", message: "Restaurant profile updated successfully", data: { user: newUser }, errors: null });
});

// ── Edit Account ──────────────────────────────────────────────────

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