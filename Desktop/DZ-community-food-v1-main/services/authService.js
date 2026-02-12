
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const {GENERATE_TOKEN} = require('../utils/createToken')
const bcrypt = require('bcryptjs')
const ApiError=require("../utils/apiError")
const crypto = require('crypto');
const {sendEmail} = require('../utils/sendEmail'); // يجب إنشاءه





//signup a user
const signup = asyncHandler(async (req, res) => {
const {userName, email, password} = req.body;

const newUser = await User.create({
    userName,
    email,
    password
});

await sendVerificationEmail(newUser, req);

const token = await GENERATE_TOKEN({email : newUser.email , id: newUser._id ,  userName: newUser.userName  })
    res.status(201).json({status : 'success' ,data :{user :newUser , token : token}  })

})



// @desc    Login / Verify User
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { identity, password } = req.body;

  if (!identity || !password) {
    return next(new ApiError("Email/Username and password are required", 400));
  }

  const user = await User.findOne({
    $or: [
      { email: identity||null },
      { userName: identity||null }
    ],
  }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Invalid email/username or password", 401));
  }

  const token = GENERATE_TOKEN({ 
    id: user._id, 
    email: user.email, 
    userName: user.userName 
  });

  user.password = undefined;

  res.status(200).json({
    status: "success",
    message: "You are logged in successfully",
    token,
    data: { user }
  });
});


//choose the role of the user resturant user
const updateUserRole = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.user._id, 
    {
      role: req.body.role,
    },
    {
      new: true,
      runValidators: true, 
    }
  );

  if (!document) {
    return next(new ApiError(`User not found`, 404));
  }
  
  res.status(200).json({ status: "success", data: document });
});





// @desc    Check if user is authenticated (Check for Token)
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError('You are not logged in, please login', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new ApiError('The user belonging to this token no longer exists', 401));
  }
req.user = currentUser;
  next();
});

//verify if user found + create token + send it to email
const forgotPassword = asyncHandler(async (req, res, next) => {
  
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ApiError('No user with this email', 404));

  const resetToken = crypto.randomBytes(32).toString('hex'); //generate random token to send it on email
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //store copie of this token in DB but hashed 
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 دقائق
  await user.save({ validateBeforeSave: false });

 const resetURL = `${process.env.NGROK_URL}/api/v1/auth/resetPassword/${resetToken}`;//create URL using ngrok (have token original) to send it par eamil
  await sendEmail({ email: user.email, subject: 'Password Reset', message: resetURL });

  res.status(200).json({ status: 'success', message: 'Token sent to email!' });
});

// 2. verify token + reset pasword 
const resetPassword = asyncHandler(async (req, res, next) => {
  const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex'); //token.req -> hash
  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) return next(new ApiError('Token is invalid or expired', 400));
//sinon
  // user.password = req.body.password;
  // user.passwordResetToken = undefined;//delete token 
  // user.passwordResetExpires = undefined;
  // await user.save();//resave info in DB 

  // res.status(200).json({ status: 'success', message: 'Password reset successful' });



 user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.send("<h2>Password reset successfully ✅</h2>");






});

// 3.create token + send it to email //validate user by email
const sendVerificationEmail = asyncHandler(async (user , req ) => {
 // const user = req.body;
  const verificationToken = crypto.randomBytes(32).toString('hex');
 const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  user.verificationToken = hashedToken; //store the token in DB
  await user.save({ validateBeforeSave: false }); //not yet validated

const verificationURL = `${process.env.NGROK_URL}/api/v1/auth/verifyEmail/${verificationToken}`;
  await sendEmail({ email: user.email, subject: 'Verify your email', message: verificationURL });
});

// 4. verify email by verify token
const verifyEmail = asyncHandler(async (req, res, next) => {
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ verificationToken: hashedToken }); //find user by token
  if (!user) return next(new ApiError('Token is invalid', 400));

  user.isVerified = true;//valid 
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({ status: 'success', message: 'Email verified successfully' });
});

module.exports = { signup ,login,updateUserRole,protect ,forgotPassword,resetPassword,verifyEmail ,sendVerificationEmail};