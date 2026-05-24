const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");
const { sendVerificationEmail } = require("./authService");
const { GENERATE_TOKEN } = require('../utils/createToken');
const { User, UserProfile, RestaurantProfile } = require("../models/index");

const userInclude = [
    { model: UserProfile, required: false },
    { model: RestaurantProfile, required: false }
];

// 1. Create User
exports.createUser = asyncHandler(async (req, res) => {
    const { userName, email, password, role } = req.body;
    const user = await User.create({ userName, email, password, role: role || "USER" });
    const jwtToken = await GENERATE_TOKEN({ id: user.id, email: user.email, userName: user.userName });
    user.password = undefined;
    res.status(201).json({ status: 'SUCCESS', message: "User created successfully.", data: { user, jwtToken }, errors: null });
});

// 2. Get All Users
exports.getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
        include: userInclude,
        attributes: { exclude: ['password'] },
        limit,
        offset,
        distinct: true,
    });

    res.status(200).json({
        status: "SUCCESS",
        data: { results: count, totalPages: Math.ceil(count / limit), users },
        errors: null
    });
});

// 3. Get Single User
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.params.id, { include: userInclude, attributes: { exclude: ['password'] } });
    if (!user) return next(new ApiError(`No user found for id: ${req.params.id}`, 404));
    res.status(200).json({ status: "SUCCESS", data: { user }, errors: null });
});

// 4. Get User By Identifier
exports.getUserByIdentifier = asyncHandler(async (req, res, next) => {
    const { identifier } = req.query;
    const user = await User.findOne({
        where: { [Op.or]: [{ email: identifier }, { userName: identifier }] },
        include: userInclude,
        attributes: { exclude: ['password'] }
    });
    if (!user) return next(new ApiError(`No user found for: ${identifier}`, 404));
    res.status(200).json({ status: "SUCCESS", data: { user }, errors: null });
});

// 5. Update User
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(new ApiError(`No user found for id: ${req.params.id}`, 404));

    const { userName, email } = req.body;
    if (userName) user.userName = userName;
    if (email) user.email = email;
    await user.save();

    user.password = undefined;
    res.status(200).json({ status: "SUCCESS", message: "User updated successfully", data: { user }, errors: null });
});

// 6. Delete User
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return next(new ApiError(`No user found for id: ${req.params.id}`, 404));
    res.status(200).json({ status: "SUCCESS", message: "User deleted successfully", data: null, errors: null });
});

// 7. Change Password
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return next(new ApiError(`No user found for id: ${req.params.id}`, 404));

    const isCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isCorrect) return next(new ApiError("Current password is wrong", 401));

    user.password = req.body.password;
    user.passwordChangedAt = Date.now();
    await user.save();

    user.password = undefined;
    res.status(200).json({ status: "SUCCESS", message: "Password changed successfully", data: { user }, errors: null });
});