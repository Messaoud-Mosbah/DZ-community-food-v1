const userFactory = require("./handlerFactory");
const User = require("../models/userModel");

// Create user
exports.createUser = userFactory.addDoc(User);

// Get all users
exports.getAllUsers = userFactory.getAllDocs(User);

// Get one user
exports.getUser = userFactory.getSingleDoc(User);

// Update user
exports.updateUser = userFactory.updateDoc(User);

// Delete user
exports.deleteUser = userFactory.deleteDoc(User);
