const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");
const { Order, OrderItem, CartItem, Product, RestaurantProfile, User, UserProfile } = require("../models");

// ── HELPERS ───────────────────────────────────────────────────────

const getRestaurantProfile = async (userId, next) => {
    const profile = await RestaurantProfile.findOne({ where: { userId } });
    if (!profile) { next(new ApiError("Restaurant profile not found", 404)); return null; }
    return profile;
};

const orderInclude = [
    {
        model: OrderItem, as: "items",
        include: [{ model: Product, as: "product", attributes: ["id", "name", "description", "image", "price"] }]
    },
    {
        model: User, attributes: ["id", "userName"],
        include: [{ model: UserProfile, attributes: ["profilePicture", "fullName"] }]
    }
];

const formatItems = (orders) =>
    orders.flatMap(order =>
        order.items.map(item => ({
            orderId: order.id,
            orderItemId: item.id,
            status: order.status,
            createdAt: order.createdAt,
            product: item.product,
            quantity: item.quantity,
            description: item.description,
            user: {
                id: order.User?.id,
                userName: order.User?.userName,
                fullName: order.User?.UserProfile?.fullName || null,
                avatar: order.User?.UserProfile?.profilePicture || null,
            }
        }))
    );

// ── 1. Place Order ────────────────────────────────────────────────

exports.placeOrder = asyncHandler(async (req, res, next) => {
    const userId = req.authenticatedUser.id;
    const { restaurantProfileId } = req.body;

    const cartItems = await CartItem.findAll({ where: { userId, restaurantProfileId } });
    if (!cartItems.length) return next(new ApiError("No cart items found for this restaurant", 404));

    const orders = [];
    for (const item of cartItems) {
        const order = await Order.create({ userId, restaurantProfileId });
        await OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity });
        orders.push(order);
    }

    await CartItem.destroy({ where: { userId, restaurantProfileId } });
    res.status(201).json({ status: "SUCCESS", message: "Orders placed successfully", data: { orders }, errors: null });
});

// ── 2. Get Incoming Orders ────────────────────────────────────────

exports.getIncomingOrders = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const orders = await Order.findAll({
        where: { restaurantProfileId: profile.id, status: "PENDING" },
        include: orderInclude,
        order: [["createdAt", "ASC"]]
    });

    const items = formatItems(orders);
    res.status(200).json({ status: "SUCCESS", data: { results: items.length, items }, errors: null });
});

// ── 3. Get Accepted Orders ────────────────────────────────────────

exports.getAcceptedOrders = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const orders = await Order.findAll({
        where: { restaurantProfileId: profile.id, status: "ACCEPTED", updatedAt: { [Op.gte]: oneHourAgo } },
        include: orderInclude,
        order: [["updatedAt", "DESC"]]
    });

    const items = formatItems(orders);
    res.status(200).json({ status: "SUCCESS", data: { results: items.length, items }, errors: null });
});

// ── 4. Update Order Status ────────────────────────────────────────

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const order = await Order.findOne({ where: { id: req.params.id, restaurantProfileId: profile.id } });
    if (!order) return next(new ApiError("Order not found", 404));
    if (order.status !== "PENDING") return next(new ApiError("Only PENDING orders can be accepted", 400));

    order.status = "ACCEPTED";
    await order.save();
    res.status(200).json({ status: "SUCCESS", message: "Order accepted", data: { order }, errors: null });
});

// ── 5. Reject Order ───────────────────────────────────────────────

exports.rejectOrder = asyncHandler(async (req, res, next) => {
    const profile = await getRestaurantProfile(req.authenticatedUser.id, next);
    if (!profile) return;

    const order = await Order.findOne({ where: { id: req.params.id, restaurantProfileId: profile.id } });
    if (!order) return next(new ApiError("Order not found", 404));
    if (order.status !== "PENDING") return next(new ApiError("Only PENDING orders can be rejected", 400));

    await order.destroy();
    res.status(200).json({ status: "SUCCESS", message: "Order rejected successfully", data: null, errors: null });
});