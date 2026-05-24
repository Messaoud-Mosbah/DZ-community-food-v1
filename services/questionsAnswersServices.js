const express = require("express");
const router = express.Router();
const q = require("../services/questionService");
const { protect, allwodTo } = require("../services/authService");

const auth = [protect, allwodTo("USER", "RESTAURANT", "ADMIN")];

// ── QUESTIONS ─────────────────────────────────────────────────────
router.get("/",           ...auth, q.getAllQuestions);
router.post("/",          ...auth, q.createQuestion);
router.get("/my",         ...auth, q.getMyQuestions);
router.get("/pin/:id",    ...auth, q.togglePin);
router.get("/:id",        ...auth, q.getOneQuestion);
router.patch("/:id",      ...auth, q.updateQuestion);
router.delete("/:id",     ...auth, q.deleteQuestion);

// ── LIKES ─────────────────────────────────────────────────────────
router.post("/:questionId/toggle-like", ...auth, q.toggleQuestionLike);

// ── SAVED ─────────────────────────────────────────────────────────
router.post("/save/:questionId",   ...auth, q.saveQuestion);
router.delete("/save/:questionId", ...auth, q.unsaveQuestion);
router.get("/saved",               ...auth, q.getMySavedQuestions);

// ── COMMENTS ──────────────────────────────────────────────────────
router.get("/:questionId/comments",  ...auth, q.getQuestionComments);
router.post("/:questionId/comments", ...auth, q.createQuestionComment);
router.delete("/comments/:id",       ...auth, q.deleteQuestionComment);
router.get("/my/comments",           ...auth, q.getMyQuestionComments);

module.exports = router;