const asyncHandler        = require("express-async-handler");
const User                = require("../models/user-info/userModel");
const UserProfile         = require("../models/user-info/userProfileModel");
const RestaurantProfile   = require("../models/user-info/restaurantProfileModel");
const { Follow }          = require("../models");
const { GENERATE_TOKEN }  = require("../utils/createToken");
const { sendEmail }       = require("../utils/sendEmail");
const ApiError            = require("../utils/apiError");
const bcrypt              = require("bcryptjs");
const jwt                 = require("jsonwebtoken");
const crypto              = require("crypto");
const { Op }              = require("sequelize");
const { parseFormDataToProfile } = require("../utils/parse");


// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────


const userAttributes = ["id", "userName", "email", "role", "isVerified", "isOnboardingCompleted"];

const sendVerificationEmail = async (user) => {
  const originalToken = crypto.randomBytes(32).toString("hex");
  const hashedToken   = crypto.createHash("sha256").update(originalToken).digest("hex");

  user.verificationTokenHash    = hashedToken;
  user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ fields: ["verificationTokenHash", "verificationTokenExpires"] });

  // const verificationURL = `https://feedme-algeria.vercel.app/verify-email?token=${originalToken}&identifier=${user.userName}`;
  const verificationURL = `http://localhost:3000/verify-email?token=${originalToken}&identifier=${user.userName}`;
  const htmlContent = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;color:#333">
      <div style="background:#1a1a1a;padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">Feed Me</h1>
      </div>
      <div style="padding:40px 30px">
        <h2 style="color:#2d3436;margin-top:0">Welcome, ${user.userName}!</h2>
        <p style="font-size:16px;line-height:1.6;color:#636e72">
          Thank you for joining our community. Please verify your email address.
        </p>
        <div style="background:#fff5f5;border-left:4px solid #ff7675;padding:15px;margin:25px 0">
          <p style="margin:0;color:#d63031;font-weight:bold;font-size:14px">⚠️ This link expires in 10 minutes.</p>
        </div>
        <div style="text-align:center;margin:35px 0">
          <a href="${verificationURL}" style="background:#2ecc71;color:#fff;padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:18px;display:inline-block">
            Verify Email Address
          </a>
        </div>
        <hr style="border:0;border-top:1px solid #eee;margin:30px 0">
        <p style="font-size:13px;color:#b2bec3">If the button doesn't work, copy this link:</p>
        <p style="font-size:12px;color:#0984e3;word-break:break-all;background:#f9f9f9;padding:10px;border-radius:5px">${verificationURL}</p>
      </div>
      <div style="background:#f1f2f6;padding:20px;text-align:center;font-size:12px;color:#95a5a6">
        <p style="margin:0">&copy; 2026 DZ Community Food. All rights reserved.</p>
        <p style="margin:5px 0 0">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    </div>`;

  await sendEmail({ email: user.email, subject: "Email Verification (10 min expiration)", html: htmlContent });
};

const validateOnboardingEligibility = async (userId, next) => {
  const userRecord = await User.findByPk(userId);

  if (!userRecord)               return next(new ApiError("User synchronization failed: Account not found.", 404));
  if (userRecord.isLoggedOut)    return next(new ApiError("You are logged out, please sign in again.", 403));
  if (userRecord.isOnboardingCompleted)
    return next(new ApiError("Profile Already Active: Your onboarding process is already completed.", 400));

  return userRecord;
};

// ─────────────────────────────────────────────
//  AUTH CONTROLLERS
// ─────────────────────────────────────────────

// 1 ── Sign Up
const signup = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  const user = await User.create({ userName, email, password });
  await sendVerificationEmail(user);


  user.password = undefined;
  res.status(201).json({
    status:  "SUCCESS",
    message: "Sign up successful. We sent you a verification email.",
    data:null,
    errors:  null,
  });
});

// 2 ── Verify Email
const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    where: {
      verificationTokenHash:    hashedToken,
      verificationTokenExpires: { [Op.gt]: new Date() },
    },
  });
  if (!user) return next(new ApiError("Token is invalid or has expired. Please sign up again.", 400));

  user.isVerified               = true;
  user.verificationTokenHash    = null;
  user.verificationTokenExpires = null;
  await user.save();

  const jwtToken = await GENERATE_TOKEN({ email: user.email, id: user.id, userName: user.userName });
  user.password  = undefined;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status:  "SUCCESS",
    message: "Email verified successfully. Welcome aboard!",
    data:    { user, jwtToken },
    errors:  null,
  });
});

// 3 ── Resend Verification Email
const resend_verification_email = asyncHandler(async (req, res, next) => {
  const { identifier } = req.body;
  if (!identifier) return next(new ApiError("Email/Username is required", 400));

  const user = await User.findOne({
    where: { [Op.or]: [{ email: identifier }, { userName: identifier }] },
  });
  if (!user)          return next(new ApiError("This email is not registered with us", 404));
  if (user.isVerified) return res.status(400).json({ status: "FAIL", message: "This account is already verified" });

  await sendVerificationEmail(user);
  res.status(200).json({ status: "SUCCESS", message: "Verification email sent successfully", data: null, errors: null });
});

// 4 ── Sign In
const signin = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return next(new ApiError("Email/Username and password are required", 400));

  const userRecord = await User.findOne({
    where: { [Op.or]: [{ email: identifier }, { userName: identifier }] },
  });
  if (!userRecord || !(await bcrypt.compare(password, userRecord.password)))
    return next(new ApiError("Invalid email/username or password", 401));

  const user = await User.findByPk(userRecord.id, { include: [UserProfile, RestaurantProfile] });

  if (!user.isVerified)
    return res.status(200).json({ status: "SUCCESS", message: "Please verify your account first.", data:{user}, errors: null });

  if (user.status === "SUSPENDED")
    return next(new ApiError("Your account has been suspended by the admin.", 403));

  user.isLoggedOut = false;
  await user.save({ fields: ["isLoggedOut"] });

  const token   = GENERATE_TOKEN({ id: user.id, email: user.email, userName: user.userName });
  user.password = undefined;

  res.status(200).json({
    status:  "SUCCESS",
    message: "Signed in successfully. Welcome!",
    data:    { user, jwtToken: token },
    errors:  null,
  });
});

// 5 ── Logout
const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.authenticatedUser.id);
  if (!user) return next(new ApiError("User not found", 404));

  user.isLoggedOut = true;
  await user.save({ fields: ["isLoggedOut"] });

  res.status(200).json({ status: "SUCCESS", message: "Logged out successfully. See you soon!", data: null, errors: null });
});

// 6 ── Forget Password
const forgetPassword = asyncHandler(async (req, res, next) => {
  const { identifier } = req.body;
  if (!identifier)
    return next(new ApiError("Email or Username is required", 400));

  const userRecord = await User.findOne({
    where: { [Op.or]: [{ email: identifier }, { userName: identifier }] },
  });
  if (!userRecord)
    return next(new ApiError("No account found with this email/username", 404));

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  userRecord.passwordResetTokenHash = hashedToken;
  userRecord.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await userRecord.save({
    fields: ["passwordResetTokenHash", "passwordResetExpires"],
  });

  const resetURL = `http://localhost:3000/reset-password?token=${resetToken}&identifier=${userRecord.userName}`;
  // const resetURL    = `https://feedme-algeria.vercel.app/reset-password?token=${resetToken}&identifier=${userRecord.userName}`;
  const htmlContent = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;color:#333">
      <div style="background:#1a1a1a;padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">Feed Me</h1>
      </div>
      <div style="padding:40px 30px">
        <h2 style="color:#2d3436;margin-top:0">Password Reset Request</h2>
        <p style="font-size:16px;line-height:1.6;color:#636e72">
          Hi ${userRecord.userName},<br>We received a request to reset your password.
        </p>
        <div style="background:#fff5f5;border-left:4px solid #ff7675;padding:15px;margin:25px 0">
          <p style="margin:0;color:#d63031;font-weight:bold;font-size:14px">⚠️ This link is valid for 10 minutes only.</p>
        </div>
        <div style="text-align:center;margin:35px 0">
          <a href="${resetURL}" style="background:#0984e3;color:#fff;padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:18px;display:inline-block">
            Reset Password
          </a>
        </div>
        <hr style="border:0;border-top:1px solid #eee;margin:30px 0">
        <p style="font-size:13px;color:#b2bec3">If the button doesn't work, copy this link:</p>
        <p style="font-size:12px;color:#0984e3;word-break:break-all;background:#f9f9f9;padding:10px;border-radius:5px">${resetURL}</p>
      </div>
      <div style="background:#f1f2f6;padding:20px;text-align:center;font-size:12px;color:#95a5a6">
        <p style="margin:0">&copy; 2026 DZ Community Food. All rights reserved.</p>
      </div>
    </div>`;

  try {
    await sendEmail({
      email: userRecord.email,
      subject: "Password Reset Request (10 min expiration)",
      html: htmlContent,
    });
    userRecord.password = undefined;
    res
      .status(200)
      .json({
        status: "SUCCESS",
        message: "Password reset link sent to your email.",
        data: null,
        errors: null,
      });
  } catch {
    userRecord.passwordResetTokenHash = null;
    userRecord.passwordResetExpires = null;
    await userRecord.save({
      fields: ["passwordResetTokenHash", "passwordResetExpires"],
    });
    return next(
      new ApiError("Failed to send email. Please try again later.", 500),
    );
  }
});

// 7 ── Verify Reset Token
const verifyResetToken = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    where: { passwordResetTokenHash: hashedToken, passwordResetExpires: { [Op.gt]: new Date() } },
  });
  if (!user) return next(new ApiError("Token is invalid or has expired", 400));

  res.status(200).json({ status: "SUCCESS", message: "Token is valid. You can now reset your password.", data: {user}, errors: null });
});

// 8 ── Reset Password
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, passwordConfirm, identifier } = req.body;

  if (!password || !passwordConfirm) return next(new ApiError("Password and confirmation are required", 400));
  if (!identifier)                   return next(new ApiError("Email is required", 400));
  if (password !== passwordConfirm)  return next(new ApiError("Passwords do not match", 400));

  const userRecord = await User.findOne({
    where: { [Op.or]: [{ email: identifier }, { userName: identifier }] },
  });
  if (!userRecord) return next(new ApiError("No account found with this email", 404));

  userRecord.password               = password;
  userRecord.passwordResetTokenHash = null;
  userRecord.passwordResetExpires   = null;
  if (!userRecord.isVerified) userRecord.isVerified = true;
  await userRecord.save();

  const jwtToken    = await GENERATE_TOKEN({ id: userRecord.id, email: userRecord.email, userName: userRecord.userName });
  userRecord.password = undefined;

  const user = await User.findByPk(userRecord.id);
  res.status(200).json({
    status:  "SUCCESS",
    message: "Password has been reset successfully.",
    data:null,
    errors:  null,
  });
});

// ─────────────────────────────────────────────
//  ONBOARDING CONTROLLERS
// ─────────────────────────────────────────────

// 9 ── User Onboarding
// @route  PATCH /api/authentication/user/onboarding
const userProfile = asyncHandler(async (req, res, next) => {
  const userId   = req.authenticatedUser.id;
  const userRole = req.body.role;

  if (!userRole)
    return next(new ApiError("Please specify your account type (USER or RESTAURANT).", 400));

  const {profile} = parseFormDataToProfile(req.body);
  const { userBasicInformation, userUsagePreferences } = profile ?? {};

  const userRecord = await validateOnboardingEligibility(userId, next);
  if (!userRecord) return;

  const updateData = {
    ...(userBasicInformation && {
      fullName:       userBasicInformation.fullName,
      city:           userBasicInformation.city,
      phoneNumber:    userBasicInformation.phoneNumber,
      bio:            userBasicInformation.bio,
      profilePicture: userBasicInformation.profilePicture,
    }),
    ...(userUsagePreferences && {
      usageGoal:       userUsagePreferences.usageGoal,
      kitchenCategory: userUsagePreferences.kitchenCategory,
    }),
  };

  const existingProfile = await UserProfile.findOne({ where: { userId } });
  if (existingProfile)
    return next(new ApiError("Profile Already Active: Your onboarding process is already completed.", 400));

  await UserProfile.create({ userId, ...updateData });
  userRecord.isOnboardingCompleted = true;
  userRecord.role = userRole;
  await userRecord.save();

  const user = await User.findByPk(userId, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });
  res.status(200).json({
    status:  "SUCCESS",
    message: "Onboarding completed successfully. Welcome to DZ Food Community!",
    data:    { user },
    errors:  null,
  });
});

// 10 ── Restaurant Onboarding
// @route  PATCH /api/authentication/restaurant/onboarding
const restaurantProfile = asyncHandler(async (req, res, next) => {
  const userId   = req.authenticatedUser.id;
  const userRole = req.body.role;

  if (!userRole)
    return next(new ApiError("Please specify your account type (USER or RESTAURANT).", 400));

  const {profile} = parseFormDataToProfile(req.body);
  const {
    restaurantBasicInformation,
    restaurantLocationAndContact,
    restaurantDetails,
    restaurantServices,
  } = profile ?? {};

  const userRecord = await validateOnboardingEligibility(userId, next);
  if (!userRecord) return;

  const updateData = {
    ...(restaurantBasicInformation && {
      bio:               restaurantBasicInformation.bio,
      restaurantName:    restaurantBasicInformation.restaurantName,
      restaurantLogoUrl: restaurantBasicInformation.restaurantLogoUrl,
      businessEmail:     restaurantBasicInformation.businessEmail,
      phoneNumber:       restaurantBasicInformation.phoneNumber,
    }),
    ...(restaurantLocationAndContact && {
      city:           restaurantLocationAndContact.city,
      street:         restaurantLocationAndContact.street,
      postalCode:     restaurantLocationAndContact.postalCode,
      googleMapsLink: restaurantLocationAndContact.googleMapsLink,
    }),
    ...(restaurantDetails && {
      kitchenCategory: restaurantDetails.kitchenCategory,
      ...(Array.isArray(restaurantDetails.workingDays) && {
        workingDays: restaurantDetails.workingDays,
      }),
    }),
    ...(restaurantServices && { services: restaurantServices }),
  };

  const existingProfile = await RestaurantProfile.findOne({ where: { userId } });
  if (existingProfile)
    return next(new ApiError("Profile Already Active: Your onboarding process is already completed.", 400));

  await RestaurantProfile.create({ userId, ...updateData });
  userRecord.isOnboardingCompleted = true;
  userRecord.role = userRole;
  await userRecord.save();

  const user = await User.findByPk(userId, { attributes: userAttributes, include: [UserProfile, RestaurantProfile] });
  res.status(200).json({
    status:  "SUCCESS",
    message: "Onboarding completed successfully. Welcome to DZ Food Community!",
    data:    { user },
    errors:  null,
  });
});

// ─────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token      = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) return next(new ApiError("You are not logged in, please login", 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return next(new ApiError(`${message}, please login again`, 401));
  }

  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser)
    return next(new ApiError("The user belonging to this token no longer exists", 401));

  if (currentUser.passwordChangedAt) {
    const changedAt = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
    if (changedAt > decoded.iat)
      return next(new ApiError("User recently changed their password. Please login again.", 401));
  }

  req.authenticatedUser = { id: currentUser.id, role: currentUser.role, passwordChangedAt: currentUser.passwordChangedAt };
  next();
});

const allwodTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.authenticatedUser.role))
      return next(new ApiError("You are not allowed to access this route.", 403));
    next();
  });

// ─────────────────────────────────────────────
//  FOLLOW SYSTEM
// ─────────────────────────────────────────────

const toggleFollow = asyncHandler(async (req, res) => {
  const followerId  = req.authenticatedUser.id;
  const followingId = req.params.userId;

  if (followerId === followingId)
    return res.status(400).json({ status: "FAIL", message: "لا تقدر تتابع نفسك" });

  const existing = await Follow.findOne({ where: { followerId, followingId } });

  if (existing) {
    await existing.destroy();
    await User.decrement("followersCount", { where: { id: followingId } });
    await User.decrement("followingCount",  { where: { id: followerId } });
    return res.status(200).json({ status: "SUCCESS", message: "تم إلغاء المتابعة", isFollowing: false });
  }

  await Follow.create({ followerId, followingId });
  await User.increment("followersCount", { where: { id: followingId } });
  await User.increment("followingCount",  { where: { id: followerId } });
  res.status(200).json({ status: "SUCCESS", message: "تمت المتابعة", isFollowing: true });
});

// ─────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  signup,
  verifyEmail,
  sendVerificationEmail,
  resend_verification_email,
  signin,
  logout,
  forgetPassword,
  verifyResetToken,
  resetPassword,
  userProfile,
  restaurantProfile,
  protect,
  allwodTo,
  toggleFollow,
};