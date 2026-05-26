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
           
        ]
    });

    if (!user) return next(new ApiError("User not found", 404));
    if (user.isLoggedOut) return next(new ApiError("You are logged out, please sign in again", 403));

    res.status(200).json({ status: "SUCCESS", data: { user }, errors: null });
});

// GET other user's profile
exports.getUserProfileById = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      { model: UserProfile, required: false, },
      { model: RestaurantProfile, required: false,  },
    ],
  });

  if (!user) return next(new ApiError("User not found", 404));

  const profile = user.toJSON();

  if (user.role === "RESTAURANT") {
    delete profile.UserProfile;
  } else {
    delete profile.RestaurantProfile;
  }


  res.status(200).json({ status: "SUCCESS", data: { user: profile }, errors: null });
});