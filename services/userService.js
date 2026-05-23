const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");
const { sendVerificationEmail } = require("./authService");
const { GENERATE_TOKEN } = require('../utils/createToken');
const { User, UserProfile, RestaurantProfile } = require("../models/index");

//-------1------
//des       create a user
//route      post /api/users/
//access     ADMIN
exports.createUser = asyncHandler(async (req, res) => {
  const { userName, email, password, role } = req.body;
  const user = await User.create({
    userName,
    email,
    password,
    role: role || "user",
  });
   const jwtToken = await GENERATE_TOKEN({ 
        id: user.id, 
        email: user.email, 
        userName: user.userName 
    });
user.password = undefined;
res.status(201).json({ 
    status: 'SUCCESS', 
    message: "User created successfully. Verification email sent.",
    data: { 
      user,
      jwtToken
     },
    errors: null 
  });
});
 
//-----------2----------
//des       GET ALL USERS
//route      GET /api/users/
//access     ADMIN

exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;      
  const limit = parseInt(req.query.limit) || 10 ;      
  const offset = (page - 1) * limit;                
  const { count, rows: users } = await User.findAndCountAll({
  include: [UserProfile, RestaurantProfile],
  attributes: { exclude: ['password'] },

    limit: limit,
    offset: offset,
    distinct: true, 
  });
  const totalPages = Math.ceil(count / limit);
  const remainingPages = totalPages - page;
    User.password = undefined;

  res.status(200).json({
    status: "SUCCESS",
    message: "list of users",
    data:{
    results: users.length,       
      users,
           
    // pagination: {
    //   currentPage: page,
    //   limit: limit,
    //   totalPages: totalPages,
    //   remainingPages: Math.max(0, remainingPages),
    //   hasNextPage: page < totalPages,
    //   hasPrevPage: page > 1,
          
    // },
    } ,
    errors:null
  });
});

//------------3-----------
//des       get single user by id
//route      get /api/users/:id
//access     ADMIN
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    include: [UserProfile, RestaurantProfile],
  });
  if (!user)
    return next(new ApiError(`No user found for  this id :${req.params.id}`, 404));
    user.password = undefined;
res.status(200).json({ 
    status: "success", 
    message: "  find User  successfully",
    data:{user}, 
    errors:null 
  });});

//------------4-----------
//des       GET USER BY IDENTIFIER (email or userName)//req.query (params)
//route      get /api/users/get-by-identifier
//access     ADMIN
exports.getUserByIdentifier = asyncHandler(async (req, res, next) => {
  const { identifier } = req.query;
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { userName: identifier }],
    },
    include: [UserProfile, RestaurantProfile],  });
  if (!user) return next(new ApiError(`No user found for: ${identifier}`, 404));
      user.password = undefined;
res.status(200).json({ 
    status: "SUCCESS", 
    message: "find User successfully",
    data:{user}, 
    errors:null 
  })});

//------------5--------
//des        UPDATE USER 
//route      patch/api/users/:id
//access     ADMIN
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id,{
  });
  if (!user)
    return next(new ApiError(`No user found for this  id ${req.params.id}`, 404));
  const { userName, email } = req.body;
  if (userName) user.userName = userName;
  if (email) user.email = email;
  await user.save();
    user.password = undefined;
res.status(200).json({ 
   status: "SUCCESS", 
   message: "update User successful",
   data: {user}, 
   error:null,
  })
});

//---------6-------------
  //des     DELETE USER BY id 
//route      delete /api/users/:id
//access     ADMIN
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const deleted = await User.destroy({
    where: { id: req.params.id },
  });
if (!deleted)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));
res.status(200)
    .json({ status: "SUCCESS", message: "User deleted successfully",data:null,errors:null });
});


//-------------------7-----------------
  //des    CHANGE PASSWORD USER BY id 
//route      put /api/users/:id
//access     ADMIN

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id,{
    attributes: userAttributes,
  
  });
  if (!user)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));
  const isCorrect = await bcrypt.compare(
    req.body.currentPassword,
    user.password,
  );
  if (!isCorrect) return next(new ApiError("Current password is wrong", 401));
  user.password = req.body.password;
  user.passwordChangedAt = Date.now();
  await user.save();
      user.password = undefined;
  res.status(200).json({ 
    status: "SUCCESS", 
    message: "change password successfully",
    data: {user}, 
    errors: null,
  })
});

