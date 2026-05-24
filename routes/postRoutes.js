const express = require("express");
const router = express.Router();
const postService = require("../services/postService");
const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");
const upload = require("../middlewares/uploadMiddleware");
const {
  validateCreatePost,
  validateUpdatePost,
  validateGetPosts,
  validateidpost,
} = require("../utils/validators/postValidation");

const uploadFields = upload.fields([{ name: "images", maxCount: 10 }, { name: "video", maxCount: 1 }]);

// ── 1. ALL POSTS ──────────────────────────────────────────────────
router.get("/",  protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateGetPosts, postService.getAllPosts);
router.post("/", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), uploadFields, validateCreatePost, postService.createPost);

// ── 2. MY POSTS ───────────────────────────────────────────────────
router.get("/my-posts", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.getMyPosts);

// ── 3. PIN ────────────────────────────────────────────────────────
router.get("/pin/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.togglePin);

// ── 4. LIKES ──────────────────────────────────────────────────────
router.post("/:postId/toggle-like", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.toggleLike);
router.get("/liked",                protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.getMyLikedPosts);

// ── 5. SAVED POSTS ────────────────────────────────────────────────
router.post("/save/:postId",   protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.savePost);
router.delete("/save/:postId", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.unsavePost);
router.get("/saved",           protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.getMySavedPosts);

// ── 6. COMMENTS ───────────────────────────────────────────────────
router.get("/:postId/comments",  protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.getPostComments);
router.post("/:postId/comments", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.createComment);
router.delete("/comments/:id",   protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.deleteComment);

// ── 7. SINGLE POST (CRUD) ─────────────────────────────────────────
router.get("/:id",    protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateidpost, postService.getOnePost);
router.patch("/:id",  protect, allwodTo("USER", "RESTAURANT", "ADMIN"), uploadFields, validateUpdatePost, postService.updatePost);
router.delete("/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateidpost, postService.deletePost);

module.exports = router;