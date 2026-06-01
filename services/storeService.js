const asyncHandler = require("express-async-handler");
const { Product, RestaurantProfile, User } = require("../models");
const { Op } = require("sequelize");

const productAttributes = ["id", "name", "price", "description", "image", "preparationTime", "category"];

const restaurantInclude = {
    model: RestaurantProfile,
    as: "restaurant",
    attributes: ["id", "restaurantName", "restaurantLogoUrl"],
    include: [{
        model: User,
        attributes: ["userName"]
    }]
};

// GET /api/store/products
exports.allProducts = asyncHandler(async (req, res) => {
    const limit  = parseInt(req.query.limit) || 50;
    const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

    const where = cursor ? { createdAt: { [Op.lt]: cursor } } : {};

    const products = await Product.findAll({
        where,
        limit,
        order:      [["createdAt", "DESC"]],
        attributes: productAttributes,
        include:    [restaurantInclude]
    });

    const nextCursor = products.length ? products[products.length - 1].createdAt : null;

    res.status(200).json({
        status: "SUCCESS",
        data:   { results: products.length, nextCursor, products },
        errors: null
    });
});