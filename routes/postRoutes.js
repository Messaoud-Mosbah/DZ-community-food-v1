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


// ── 1. All Posts ──────────────────────────────────────────────────
router.route("/")
  .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateGetPosts, postService.getAllPosts)
  .post(
    protect,
    allwodTo("USER", "RESTAURANT", "ADMIN"),
    upload.fields([{ name: "images", maxCount: 10 }, { name: "video", maxCount: 1 }]),
    validateCreatePost,
    postService.createPost
  );

// ── 2. My Posts (Studio) ──────────────────────────────────────────
router.get("/my-posts", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.getMyPosts);

// ── 3. Pin Toggle ─────────────────────────────────────────────────
router.get("/pin/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.togglePin);


router.route("/:postId/comments")
  .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.getPostComments)
  .post(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.createComment);

router.delete("/comments/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.deleteComment);

// @desc      (Like/Unlike)
router.post("/:postId/toggle-like", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.toggleLike);

router.get("/:postId/check-like", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), postService.checkIfLiked);

// ── 6. Single Post (CRUD) ─────────────────────────────────────────
router.route("/:id")
  .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateidpost, postService.getOnePost)
  .patch(
    protect,
    allwodTo("USER", "RESTAURANT", "ADMIN"),
    upload.fields([{ name: "images", maxCount: 10 }, { name: "video", maxCount: 1 }]),
    validateUpdatePost,
    postService.updatePost
  )
  .delete(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateidpost, postService.deletePost);

module.exports = router;