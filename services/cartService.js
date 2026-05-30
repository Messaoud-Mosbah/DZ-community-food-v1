const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { CartItem, Product, User, RestaurantProfile } = require("../models");

const SERVER_BASE_URL= process.env.SERVER_BASE;

const formatImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${SERVER_BASE_URL}/${path.startsWith("/") ? path.substring(1) : path}`;
};

const cartInclude = [{
    model: Product,
    include: [{
        model: RestaurantProfile, as: "restaurant",
        attributes: ["id", "restaurantName", "restaurantLogoUrl"],
        include: [{ model: User, attributes: ["userName"] }]
    }]
}];

// 1. Get Cart
exports.getCart = asyncHandler(async (req, res) => {
    const userId = req.authenticatedUser.id;
    const cartItems = await CartItem.findAll({ where: { userId }, include: cartInclude });

    const grouped = {};
    cartItems.forEach(item => {
        const product = item.Product;
        if (!product) return;

        const restaurantId = product.restaurantProfileId;
        const restaurant = product.restaurant;

        if (!grouped[restaurantId]) {
            grouped[restaurantId] = {
                accountId: restaurantId,
                accountName: restaurant?.restaurantName || "Unknown Restaurant",
                userName: restaurant?.User?.userName || "unknown_user",
                accountAvatar: formatImageUrl(restaurant?.restaurantLogoUrl) || "/default-avatar.png",
                items: [],
                restaurantTotal: 0
            };
        }

        const price = parseFloat(product.price) || 0;
        const quantity = parseInt(item.quantity) || 0;

        grouped[restaurantId].items.push({
            id: product.id,
            productName: product.name,
            price,
            description: product.description,
            image: formatImageUrl(product.image),
            qty: quantity,
            accountId: restaurantId,
            userId
        });

        grouped[restaurantId].restaurantTotal = (
            parseFloat(grouped[restaurantId].restaurantTotal) + price * quantity
        ).toFixed(2);
    });

    res.status(200).json({ status: "SUCCESS", data: { allCartGroups: Object.values(grouped) }, errors: null });
});

// 2. Add To Cart
exports.addToCart = asyncHandler(async (req, res, next) => {
    const userId = req.authenticatedUser.id;
    const { productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return next(new ApiError("Product not found", 404));

    const existing = await CartItem.findOne({ where: { userId, productId } });
    if (existing) {
        existing.quantity += 1;
        await existing.save();
        return res.status(200).json({ status: "SUCCESS", message: "Quantity updated", data: { cartItem: existing }, errors: null });
    }

    const cartItem = await CartItem.create({ userId, productId, restaurantProfileId: product.restaurantProfileId, quantity: 1 });
    res.status(201).json({ status: "SUCCESS", message: "Product added to cart", data: { cartItem }, errors: null });
});

// 3. Update Cart Item
exports.updateCartItem = asyncHandler(async (req, res, next) => {
    const userId = req.authenticatedUser.id;
    const { quantity } = req.body;

    const cartItem = await CartItem.findOne({ where: { productId: req.params.itemId, userId } });
    if (!cartItem) return next(new ApiError("Cart item not found", 404));

    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ status: "SUCCESS", message: "Cart item updated", data: { cartItem }, errors: null });
});

// 4. Remove Cart Item
exports.removeCartItem = asyncHandler(async (req, res, next) => {
    const userId = req.authenticatedUser.id;

    const cartItem = await CartItem.findOne({ where: { productId: req.params.itemId, userId } });
    if (!cartItem) return next(new ApiError("Cart item not found", 404));

    await cartItem.destroy();
    res.status(200).json({ status: "SUCCESS", message: "Cart item removed", data: null, errors: null });
});

// 5. Clear Cart
exports.clearCart = asyncHandler(async (req, res) => {
    await CartItem.destroy({ where: { userId: req.authenticatedUser.id } });
    res.status(200).json({ status: "SUCCESS", message: "Cart cleared", data: null, errors: null });
});