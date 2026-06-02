const express = require("express");
const router = express.Router();
const postService = require("../services/postService");
const { protect, allwodTo } = require("../services/authService");
const upload = require("../middlewares/uploadMiddleware");
const {
  validateCreatePost,
  validateUpdatePost,
  validateidpost,
} = require("../utils/validators/postValidation");

const auth = [protect, allwodTo("USER", "RESTAURANT", "ADMIN")];

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
]);

// ── POSTS ─────────────────────────────────────────────────────────
router.get("/",                    ...auth, postService.getAllPosts);
router.post("/",                   ...auth, uploadFields, validateCreatePost, postService.createPost);
router.get("/my-posts",            ...auth, postService.getMyPosts);
router.get("/other-posts/:id",     ...auth, postService.otherPosts);
router.get("/pin/:id",             ...auth, postService.togglePin);

// ── LIKES ─────────────────────────────────────────────────────────
router.post("/:postId/toggle-like", ...auth, postService.toggleLike);
router.get("/liked",                ...auth, postService.getMyLikedPosts);

// ── SAVED ─────────────────────────────────────────────────────────
router.post("/toggleSavePost/:postId", ...auth, postService.toggleSavePost);
router.get("/saved",                   ...auth, postService.getMySavedPosts);

// ── COMMENTS ──────────────────────────────────────────────────────
router.get("/:postId/comments",  ...auth, postService.getPostComments);
router.post("/:postId/comments", ...auth, postService.createComment);
router.delete("/comments/:id",   ...auth, postService.deleteComment);

// ── SINGLE POST ───────────────────────────────────────────────────
router.get("/:id",    ...auth, validateidpost, postService.getOnePost);
router.patch("/:id",  ...auth, uploadFields, validateUpdatePost, postService.updatePost);
router.delete("/:id", ...auth, validateidpost, postService.deletePost);

module.exports = router;