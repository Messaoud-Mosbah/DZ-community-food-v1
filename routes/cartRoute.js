const express = require("express");
const router = express.Router();

const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const {
  addToCartValidator,
  updateCartItemValidator,
  cartItemIdValidator,
} = require("../utils/validators/cartValidator");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../services/cartService");

router.use(protect, allwodTo("USER"));

//work 100%
router.get("/", getCart);
router.post("/", addToCartValidator, addToCart);
router.patch("/:itemId", updateCartItemValidator, updateCartItem);
router.delete("/:itemId", cartItemIdValidator, removeCartItem);
router.delete("/", clearCart);

module.exports = router;
