const express = require("express");
const router = express.Router();
const q = require("../services/questionsAnswersServices");
const { protect, allwodTo } = require("../services/authService");

const auth = [protect, allwodTo("USER", "RESTAURANT", "ADMIN")];

router.get("/",            ...auth, q.getAllQuestions);
router.post("/",           ...auth, q.createQuestion);

router.get("/my",          ...auth, q.getMyQuestions); 
router.get("/my/answered", ...auth, q.getMyAnsweredQuestions);   
router.get("/saved",       ...auth, q.getMySavedQuestions); 

router.post("/save/:questionId",   ...auth, q.saveQuestion);
router.post("/:questionId/toggle-like", ...auth, q.toggleQuestionLike);


router.get("/:questionId/comments",   ...auth, q.getQuestionComments);
//1
router.post("/:questionId/comments",  ...auth, q.createQuestionComment);

router.delete("/comments/:id",        ...auth, q.deleteQuestionComment);

router.patch("/pin/:id",     ...auth, q.togglePin); 
router.get("/:id",         ...auth, q.getOneQuestion); 
router.patch("/:id",       ...auth, q.updateQuestion);
router.delete("/:id",      ...auth, q.deleteQuestion);
router.patch("/:id/solve", ...auth, q.markAsSolved);
router.patch("/:id/close", ...auth, q.closeQuestion);

module.exports = router;