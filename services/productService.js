const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { Product, RestaurantProfile } = require("../models");

const getRestaurantProfile = async (userId, next) => {
    const profile = await RestaurantProfile.findOne({ where: { userId } });
    if (!profile) { next(new ApiError("Restaurant profile not found", 404)); return null; }
    return profile;
};

const parseCategory = (category) =>
    category ? (typeof category === "string" ? JSON.parse(category) : category) : undefined;

// 1. Get All Products
exports.getAllProducts = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const products = await Product.findAll({
        where: { restaurantProfileId: profile.id },
        order: [["createdAt", "DESC"]]
    });

    res.status(200).json({ status: "SUCCESS", data: { results: products.length, products }, errors: null });
});

// 2. Get One Product
exports.getOneProduct = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const product = await Product.findOne({ where: { id: req.params.id, restaurantProfileId: profile.id } });
    if (!product) return next(new ApiError("Product not found", 404));

    res.status(200).json({ status: "SUCCESS", data: { product }, errors: null });
});

// 3. Create Product
exports.createProduct = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const { name, description, price, category, preparingTime } = req.body;
    const image = `/uploads/images/${req.files?.image?.[0].filename}`;

    const product = await Product.create({
        name, description, price, image, preparingTime,
        category: parseCategory(category),
        restaurantProfileId: profile.id
    });

    res.status(201).json({ status: "SUCCESS", data: { product }, errors: null });
});

// 4. Update Product
exports.updateProduct = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const product = await Product.findOne({ where: { id: req.params.id, restaurantProfileId: profile.id } });
    if (!product) return next(new ApiError("Product not found", 404));

    const { name, description, price, category, preparingTime } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (preparingTime !== undefined) product.preparingTime = preparingTime;
    if (category !== undefined) product.category = parseCategory(category);
    if (req.files?.image?.[0]) product.image = `/uploads/images/${req.files.image[0].filename}`;

    await product.save();
    res.status(200).json({ status: "SUCCESS", data: { product }, errors: null });
});

// 5. Delete Product
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const product = await Product.findOne({ where: { id: req.params.id, restaurantProfileId: profile.id } });
    if (!product) return next(new ApiError("Product not found", 404));

    await product.destroy();
    res.status(200).json({ status: "SUCCESS", message: "Product deleted successfully", data: null, errors: null });
});