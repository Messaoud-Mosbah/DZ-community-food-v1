const express = require("express");
const router = express.Router();
const { protect, allwodTo } = require("../services/authService");
const { addToCartValidator, updateCartItemValidator, cartItemIdValidator } = require("../utils/validators/cartValidator");
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../services/cartService");

router.use(protect, allwodTo("USER"));

router.get("/",          getCart);
router.post("/",         addToCartValidator,        addToCart);
router.patch("/:itemId", updateCartItemValidator,   updateCartItem);
router.delete("/:itemId",cartItemIdValidator,       removeCartItem);
router.delete("/",       clearCart);

module.exports = router;