const express = require("express");
const router = express.Router();

const questionService = require("../services/questionsAnswersServices");
const { protect } = require("../services/authService");
const { allwodTo } = require("../services/editProfile");

const {
    validateCreateQuestion,
    validateUpdateQuestion,
    validateIdQuestion,
    validateGetQuestions,
} = require("../utils/validators/questionValidator");

// ── 1. ALL QUESTIONS ──────────────────────────────────────────────
router.get("/",  protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateGetQuestions, questionService.getAllQuestions);
router.post("/", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateCreateQuestion, questionService.createQuestion);

// ── 2. MY QUESTIONS & MY COMMENTS ────────────────────────────────
router.get("/my-questions", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getMyQuestions);
router.get("/my-comments",  protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getMyQuestionComments);

// ── 3. SAVED QUESTIONS ────────────────────────────────────────────
router.get("/saved",              protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getMySavedQuestions);
router.post("/save/:questionId",  protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.saveQuestion);
router.delete("/save/:questionId", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.unsaveQuestion);

// ── 4. PIN TOGGLE ─────────────────────────────────────────────────
router.patch("/pin/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateIdQuestion, questionService.togglePin);

// ── 5. LIKES ──────────────────────────────────────────────────────
router.post("/:questionId/toggle-like", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.toggleQuestionLike);
router.get("/:questionId/check-like",   protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.checkIfLiked);

// ── 6. COMMENTS ───────────────────────────────────────────────────
router.get("/:questionId/comments",    protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getQuestionComments);
router.post("/:questionId/comments",   protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.createQuestionComment);
router.delete("/comments/:id",         protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.deleteQuestionComment);

// ── 7. SINGLE QUESTION (CRUD) ─────────────────────────────────────
router.get("/:id",    protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateIdQuestion, questionService.getOneQuestion);
router.patch("/:id",  protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateUpdateQuestion, questionService.updateQuestion);
router.delete("/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateIdQuestion, questionService.deleteQuestion);

module.exports = router;