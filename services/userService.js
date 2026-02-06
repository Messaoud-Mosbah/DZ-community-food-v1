const userFactory = require("./handlerFactory");
const User = require("../models/userModel");


// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createUser = userFactory.createUser(User);


// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = userFactory.getallUsers(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = userFactory.getSingleUser(User);


// @desc    Get specific user by name or e mail
// @route   GET /api/v1/users/user
// @access  Private/Admin
exports.getUserByIdentifier = userFactory.getUserByIdentifier;


// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = userFactory.updateUser;





// @desc    Update passowrd
// @route   PUT /api/v1/users/changeUserPassword/:id
// @access  Private/Admin
exports.changeUserPassword = userFactory.changeUserPassword;


// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = userFactory.deleteUser(User);
