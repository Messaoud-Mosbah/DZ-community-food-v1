const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { User, UserProfile, RestaurantProfile ,Post} = require("../models");


const userAttributes = [
  'id', 'userName', 'email', 'role', 'status', 
  'isVerified', 'createdAt', 'isLoggedOut', 
  'isOnboardingCompleted',  "pendingEmail"
, 'updatedAt', "slug"
];
 
 
 

// view ur own profile
exports.getOwnProfile = asyncHandler(async (req, res, next) => {
   const user = await User.findByPk(req.authenticatedUser.id, {
    attributes: userAttributes, 
    include: [UserProfile, RestaurantProfile,Post],

  });
 

  if (!user) return next(new ApiError("User not found", 404));
 if (user.isLoggedOut) {
    return next(new ApiError("you logged out ,please sign in again", 403));
  }
  res.status(200).json({
    status: "SUCCESS",
    message: "Profile fetched successfully",
    data: { user },
    errors: null,
  });
});

//voew other's profile
exports.getUserProfileById = asyncHandler(async (req, res, next) => {
  const routeType = req.profileType;

  const profileInclude = {
    model: routeType === "RESTAURANT" ? RestaurantProfile : UserProfile,
    attributes: { exclude: ["userId","id", "createdAt", "updatedAt"] },
  };

  const user = await User.findByPk(req.params.id, {
    //  whitelist: only fetch what you need + role for the check
    attributes: ["id", "userName", "slug", "createdAt", "role"],
    include: [profileInclude,Post],
  });

  if (!user) return next(new ApiError("User not found", 404));

  if (user.role !== routeType)
    return next(new ApiError("Profile not found", 404));

  // remove role AFTER the check — one simple delete
  const profile = user.toJSON();
  delete profile.role;

  res.status(200).json({
    status: "SUCCESS",
    message: "Profile fetched successfully",
    data: { user },
    errors: null,
  });
});
