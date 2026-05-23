const { 
    User, 
    UserProfile,
    RestaurantProfile,
    Question,
    CommentQuestion,
    LikeQuestion,
    SavedQuestion
} = require('../models');

const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { Op } = require("sequelize");

// ── HELPERS ───────────────────────────────────────────────────────

// Returns author include based on known role
const getAuthorInclude = (role) => ({
    model: User,
    attributes: ['id', 'userName', 'role'],
    include: role === 'RESTAURANT'
        ? [{ model: RestaurantProfile, required: false, attributes: ['restaurantName', 'restaurantLogoUrl', 'city'] }]
        : [{ model: UserProfile, required: false, attributes: ['fullName', 'profilePicture'] }]
});

// Returns author include for both roles (when role is unknown)
const allAuthorsInclude = {
    model: User,
    attributes: ['userName'],
    include: [
        { model: UserProfile, required: false, attributes: ['fullName', 'profilePicture'] },
        { model: RestaurantProfile, required: false, attributes: ['restaurantName', 'restaurantLogoUrl', 'city'] }
    ]
};

// ── 1. QUESTIONS CRUD ─────────────────────────────────────────────

// 1.1 Create a new question
const createQuestion = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const question = await Question.create({
        userId: req.authenticatedUser.id,
        title,
        content,
    });

    res.status(201).json({ status: 'SUCCESS', message: 'Question created successfully', data: { question } });
});

// 1.2 Get all questions with cursor-based pagination ordered by pin then date
const getAllQuestions = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;

    let whereClause = {};
    if (cursor) {
        const [cursorPinned, cursorDate] = cursor.split('_');
        const isPinned = cursorPinned === 'true';
        const lastDate = new Date(cursorDate);
        whereClause = {
            [Op.or]: [
                { isPinned, createdAt: { [Op.lt]: lastDate } },
                { isPinned: { [Op.lt]: isPinned } }
            ]
        };
    }

    const questions = await Question.findAll({
        where: whereClause,
        limit,
        order: [["isPinned", "DESC"], ["createdAt", "DESC"]],
        include: [allAuthorsInclude],
    });

    let nextCursor = null;
    if (questions.length > 0) {
        const lastItem = questions[questions.length - 1];
        nextCursor = `${lastItem.isPinned}_${lastItem.createdAt.toISOString()}`;
    }

    res.status(200).json({ status: "SUCCESS", data: { results: questions.length, nextCursor, questions } });
});

// 1.3 Get current user's questions
const getMyQuestions = asyncHandler(async (req, res) => {
    const { id, role } = req.authenticatedUser;

    const questions = await Question.findAll({
        where: { userId: id },
        order: [["createdAt", "DESC"]],
        include: [getAuthorInclude(role)]
    });

    res.status(200).json({ status: "SUCCESS", data: { results: questions.length, questions } });
});

// 1.4 Get a single question by id
const getOneQuestion = asyncHandler(async (req, res, next) => {
    const question = await Question.findByPk(req.params.id, {
        include: [allAuthorsInclude]
    });
    if (!question) return next(new ApiError('Question not found', 404));

    res.status(200).json({ status: 'SUCCESS', data: { question } });
});

// 1.5 Update a question (owner only)
const updateQuestion = asyncHandler(async (req, res, next) => {
    const question = await Question.findByPk(req.params.id);
    if (!question) return next(new ApiError("Question not found", 404));
    if (question.userId !== req.authenticatedUser.id) return next(new ApiError("Not authorized", 403));

    await question.update({
        title: req.body.title ?? question.title,
        content: req.body.content ?? question.content,
    });

    res.status(200).json({ status: "SUCCESS", message: "Question updated", data: { question } });
});

// 1.6 Delete a question (owner only)
const deleteQuestion = asyncHandler(async (req, res, next) => {
    const question = await Question.findByPk(req.params.id);
    if (!question) return next(new ApiError("Question not found", 404));
    if (question.userId !== req.authenticatedUser.id) return next(new ApiError("Not authorized", 403));

    await question.destroy();
    res.status(200).json({ status: "SUCCESS", message: "Question deleted successfully" });
});

// 1.7 Toggle pin status of a question
const togglePin = asyncHandler(async (req, res, next) => {
    const question = await Question.findOne({
        where: { id: req.params.id, userId: req.authenticatedUser.id }
    });
    if (!question) return next(new ApiError('Question not found or not yours', 404));

    question.isPinned = !question.isPinned;
    await question.save();

    res.status(200).json({ status: 'SUCCESS', message: question.isPinned ? 'Pinned' : 'Unpinned', data: { question } });
});

// ── 2. COMMENTS SECTION ───────────────────────────────────────────

// 2.1 Add a comment to a question
const createQuestionComment = asyncHandler(async (req, res, next) => {
    const { text } = req.body;
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId);
    if (!question) return next(new ApiError('Question not found', 404));

    const comment = await CommentQuestion.create({ text, questionId, userId: req.authenticatedUser.id });

    res.status(201).json({ status: 'SUCCESS', message: 'Comment added', data: { comment } });
});

// 2.2 Get all comments for a specific question
const getQuestionComments = asyncHandler(async (req, res) => {
    const comments = await CommentQuestion.findAll({
        where: { questionId: req.params.questionId },
        order: [['createdAt', 'DESC']],
        include: [getAuthorInclude('USER')]
    });

    res.status(200).json({ status: 'SUCCESS', data: { results: comments.length, comments } });
});

// 2.3 Delete a comment (comment owner or question owner)
const deleteQuestionComment = asyncHandler(async (req, res, next) => {
    const comment = await CommentQuestion.findByPk(req.params.id);
    if (!comment) return next(new ApiError('Comment not found', 404));

    const question = await Question.findByPk(comment.questionId);
    const { id: authId } = req.authenticatedUser;

    if (comment.userId !== authId && question.userId !== authId) {
        return next(new ApiError('Not authorized to delete this comment', 403));
    }

    await comment.destroy();
    res.status(200).json({ status: 'SUCCESS', message: 'Comment deleted' });
});

// 2.4 Get all comments made by the current user
const getMyQuestionComments = asyncHandler(async (req, res) => {
    const { id, role } = req.authenticatedUser;

    const comments = await CommentQuestion.findAll({
        where: { userId: id },
        order: [['createdAt', 'DESC']],
        include: [
            getAuthorInclude(role),
            { model: Question, attributes: ['id', 'title', 'content'] }
        ]
    });

    res.status(200).json({ status: 'SUCCESS', data: { results: comments.length, comments } });
});

// ── 3. LIKES SECTION ──────────────────────────────────────────────

// 3.1 Toggle like on a question
const toggleQuestionLike = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const userId = req.authenticatedUser.id;

    const question = await Question.findByPk(questionId);
    if (!question) return next(new ApiError('Question not found', 404));

    const existingLike = await LikeQuestion.findOne({ where: { userId, questionId } });

    if (existingLike) {
        await existingLike.destroy();
        res.status(200).json({ status: 'SUCCESS', message: 'Like removed', data: { isLiked: false } });
    } else {
        await LikeQuestion.create({ userId, questionId });
        res.status(201).json({ status: 'SUCCESS', message: 'Question liked', data: { isLiked: true } });
    }
});

// 3.2 Check if current user liked a specific question
const checkIfLiked = asyncHandler(async (req, res) => {
    const like = await LikeQuestion.findOne({
        where: { userId: req.authenticatedUser.id, questionId: req.params.questionId }
    });
    res.status(200).json({ status: 'SUCCESS', data: { isLiked: !!like } });
});

// ── 4. SAVED QUESTIONS SECTION ────────────────────────────────────

// 4.1 Save a question to saved list
const saveQuestion = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const userId = req.authenticatedUser.id;

    const question = await Question.findByPk(questionId);
    if (!question) return next(new ApiError('Question not found', 404));

    const alreadySaved = await SavedQuestion.findOne({ where: { userId, questionId } });
    if (alreadySaved) return next(new ApiError('Question already saved', 400));

    await SavedQuestion.create({ userId, questionId });
    res.status(201).json({ status: 'SUCCESS', message: 'Question saved to saved questions' });
});

// 4.2 Remove a question from saved list
const unsaveQuestion = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const userId = req.authenticatedUser.id;

    const savedItem = await SavedQuestion.findOne({ where: { userId, questionId } });
    if (!savedItem) return next(new ApiError('Question not found in saved list', 404));

    await savedItem.destroy();
    res.status(200).json({ status: 'SUCCESS', message: 'Question removed from saved questions' });
});

// 4.3 Get all saved questions for the current user
const getMySavedQuestions = asyncHandler(async (req, res) => {
    const savedQuestions = await SavedQuestion.findAll({
        where: { userId: req.authenticatedUser.id },
        include: [{ model: Question, include: [allAuthorsInclude] }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ status: 'SUCCESS', results: savedQuestions.length, data: { savedQuestions } });
});

// ── EXPORTS ───────────────────────────────────────────────────────
module.exports = {
    // Questions CRUD
    createQuestion, getAllQuestions, getMyQuestions, getOneQuestion,
    updateQuestion, deleteQuestion, togglePin,
    // Comments
    createQuestionComment, getQuestionComments, deleteQuestionComment, getMyQuestionComments,
    // Likes
    toggleQuestionLike, checkIfLiked,
    // Saved
    saveQuestion, unsaveQuestion, getMySavedQuestions
};