const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { User, UserProfile, RestaurantProfile, Post,SavedPost,PostMedia } = require("../models");

const userAttributes = [
    'id', 'userName', 'email', 'role', 'status',
    'isVerified', 'isLoggedOut', 'isOnboardingCompleted',
    'pendingEmail', 'slug', 'followersCount', 'followingCount',
    'createdAt', 'updatedAt'
];

// GET own profile
exports.getOwnProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.authenticatedUser.id, {
       attributes: userAttributes,
        include: [
            UserProfile, 
            RestaurantProfile, 
            SavedPost,
            {
                model: Post,
               include: "media"
            }
        ]
    });

    if (!user) return next(new ApiError("User not found", 404));
    if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

    res.status(200).json({ status: "SUCCESS", data: { user }, errors: null });
});

// GET other user's profile
exports.getUserProfileById = asyncHandler(async (req, res, next) => {
    const routeType = req.body.profileType;

    const user = await User.findByPk(req.params.id, {
        attributes: ["id", "userName", "slug", "role", "followersCount", "followingCount", "createdAt"],
        include: [
            {
                model: routeType === "RESTAURANT" ? RestaurantProfile : UserProfile,
                attributes: { exclude: ["userId", "id", "createdAt", "updatedAt"] }
            },
              {
                model: Post,
                include: "media"
            },SavedPost
        ]
    });

    if (!user) return next(new ApiError("User not found", 404));
    console.log(routeType

    )
    if (user.role !== routeType) return next(new ApiError("Profile not found", 404));

    const profile = user.toJSON();
    delete profile.role;

    res.status(200).json({ status: "SUCCESS", data: { user: profile }, errors: null });
});