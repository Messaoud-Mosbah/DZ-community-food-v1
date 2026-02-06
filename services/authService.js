
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const {GENERATE_TOKEN} = require('../utils/createToken')
const bcrypt = require('bcryptjs')
const ApiError=require("../utils/apiError")





//signup a user
const signup = asyncHandler(async (req, res) => {
const {userName, email, password} = req.body;

const newUser = await User.create({
    userName,
    email,
    password
});

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


module.exports = { signup ,login,updateUserRole,protect};