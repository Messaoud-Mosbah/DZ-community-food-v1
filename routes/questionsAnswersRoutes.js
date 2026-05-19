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

// ── 1. ALL QUESTIONS ─────────────────────────────────────────────
router.route("/")
    .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateGetQuestions, questionService.getAllQuestions)
    .post(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateCreateQuestion, questionService.createQuestion);

// ── 2. MY QUESTIONS & MY COMMENTS ────────────────────────────────
router.get("/my-questions", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getMyQuestions);
router.get("/my-comments", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getMyQuestionComments);

// ── 3. SAVED QUESTIONS ───────────────────────────────────────────
router.get("/saved", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getMySavedQuestions);

// ── 4. SINGLE QUESTION (CRUD) ────────────────────────────────────
router.route("/:id")
    .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateIdQuestion, questionService.getOneQuestion)
    .patch(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateUpdateQuestion, questionService.updateQuestion)
    .delete(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateIdQuestion, questionService.deleteQuestion);

// ── 5. SAVE & UNSAVE OPERATIONS ──────────────────────────────────
router.post("/save/:questionId", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.saveQuestion);
router.delete("/save/:questionId", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.unsaveQuestion);

// ── 6. PIN TOGGLE ────────────────────────────────────────────────
router.patch("/pin/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), validateIdQuestion, questionService.togglePin);

// ── 7. COMMENTS ON QUESTIONS ─────────────────────────────────────
router.route("/:questionId/comments")
    .get(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.getQuestionComments)
    .post(protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.createQuestionComment);

router.delete("/comments/:id", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.deleteQuestionComment);

// ── 8. LIKES ON QUESTIONS ────────────────────────────────────────
router.post("/:questionId/toggle-like", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.toggleQuestionLike);
router.get("/:questionId/check-like", protect, allwodTo("USER", "RESTAURANT", "ADMIN"), questionService.checkIfLiked);

module.exports = router;