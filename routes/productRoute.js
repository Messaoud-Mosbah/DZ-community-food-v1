const express = require("express");
const router = express.Router();
const { protect, allwodTo } = require("../services/authService");
const upload = require("../middlewares/uploadMiddleware");
const { createProductValidator, updateProductValidator, productIdValidator } = require("../utils/validators/productValidator");
const { getAllProducts, getOneProduct, createProduct, updateProduct, deleteProduct } = require("../services/productService");

const uploadImage = upload.fields([{ name: "image", maxCount: 1 }]);

router.use(protect, allwodTo("RESTAURANT"));

router.get("/",    getAllProducts);
router.get("/:id", productIdValidator, getOneProduct);
router.post("/",   uploadImage, createProductValidator, createProduct);
router.patch("/:id", uploadImage, updateProductValidator, updateProduct);
router.delete("/:id", productIdValidator, deleteProduct);

module.exports = router;