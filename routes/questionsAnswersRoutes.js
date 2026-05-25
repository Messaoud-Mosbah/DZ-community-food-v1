const express = require("express");
const router = express.Router();
const q = require("../services/questionsAnswersServices");
const { protect, allwodTo } = require("../services/authService");

const auth = [protect, allwodTo("USER", "RESTAURANT", "ADMIN")];

router.get("/",            ...auth, q.getAllQuestions);
router.post("/",           ...auth, q.createQuestion);

router.get("/my",          ...auth, q.getMyQuestions);    
router.get("/saved",       ...auth, q.getMySavedQuestions); 
router.get("/my/comments", ...auth, q.getMyQuestionComments);

router.post("/save/:questionId",   ...auth, q.saveQuestion);
router.delete("/save/:questionId", ...auth, q.unsaveQuestion);
router.post("/:questionId/toggle-like", ...auth, q.toggleQuestionLike);

router.get("/:questionId/comments",   ...auth, q.getQuestionComments);
router.post("/:questionId/comments",  ...auth, q.createQuestionComment);
router.delete("/comments/:id",        ...auth, q.deleteQuestionComment);

router.get("/pin/:id",     ...auth, q.togglePin); 
router.get("/:id",         ...auth, q.getOneQuestion); 
router.patch("/:id",       ...auth, q.updateQuestion);
router.delete("/:id",      ...auth, q.deleteQuestion);

module.exports = router;