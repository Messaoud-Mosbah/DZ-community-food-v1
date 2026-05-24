const express = require("express");
const router = express.Router();
const q = require("../services/questionsAnswersServices");
const { protect, allwodTo } = require("../services/authService");
const {
    validateCreateQuestion,
    validateUpdateQuestion,
    validateIdQuestion,
    validateGetQuestions,
} = require("../utils/validators/questionValidator");

const auth = [protect, allwodTo("USER", "RESTAURANT", "ADMIN")];

// ── QUESTIONS ─────────────────────────────────────────────────────
router.get("/",    ...auth, validateGetQuestions, q.getAllQuestions);
router.post("/",   ...auth, validateCreateQuestion, q.createQuestion);
router.get("/my-questions", ...auth, q.getMyQuestions);
router.get("/my-comments",  ...auth, q.getMyQuestionComments);

// ── SAVED ─────────────────────────────────────────────────────────
router.get("/saved",               ...auth, q.getMySavedQuestions);
router.post("/save/:questionId",   ...auth, q.saveQuestion);
router.delete("/save/:questionId", ...auth, q.unsaveQuestion);

// ── PIN & LIKES ───────────────────────────────────────────────────
router.patch("/pin/:id",                ...auth, validateIdQuestion, q.togglePin);
router.post("/:questionId/toggle-like", ...auth, q.toggleQuestionLike);

// ── COMMENTS ──────────────────────────────────────────────────────
router.get("/:questionId/comments",  ...auth, q.getQuestionComments);
router.post("/:questionId/comments", ...auth, q.createQuestionComment);
router.delete("/comments/:id",       ...auth, q.deleteQuestionComment);

// ── SINGLE QUESTION ───────────────────────────────────────────────
router.get("/:id",    ...auth, validateIdQuestion, q.getOneQuestion);
router.patch("/:id",  ...auth, validateUpdateQuestion, q.updateQuestion);
router.delete("/:id", ...auth, validateIdQuestion, q.deleteQuestion);

module.exports = router;