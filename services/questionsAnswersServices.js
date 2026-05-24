const { 
    User, 
    UserProfile,
    RestaurantProfile,
    Question,
    CommentQuestion,
    LikeQuestion,
    SavedQuestion,
    Follow
} = require('../models');

const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { Op } = require("sequelize");

// ── HELPERS ───────────────────────────────────────────────────────

const getAuthorInclude = (role) => ({
    model: User,
    attributes: ['id', 'userName', 'role'],
    include: role === 'RESTAURANT'
        ? [{ model: RestaurantProfile, required: false, attributes: ['restaurantName', 'restaurantLogoUrl', 'city'] }]
        : [{ model: UserProfile, required: false, attributes: ['fullName', 'profilePicture'] }]
});

const allAuthorsInclude = {
    model: User,
    attributes: ['id', 'userName', 'role'],
    include: [
        { model: UserProfile, required: false, attributes: ['fullName', 'profilePicture'] },
        { model: RestaurantProfile, required: false, attributes: ['restaurantName', 'restaurantLogoUrl', 'city'] }
    ]
};

// ✅ Helper يضيف isLiked و isFollowing لكل question
const attachMetaToQuestions = async (questions, currentUserId) => {
    if (!currentUserId) return questions.map(q => ({ ...q.toJSON(), isLiked: false, isFollowing: false }));

    const questionIds = questions.map(q => q.id);
    const authorIds = questions.map(q => q.userId);

    const [likedQuestions, followedUsers] = await Promise.all([
        LikeQuestion.findAll({
            where: { userId: currentUserId, questionId: questionIds },
            attributes: ['questionId']
        }),
        Follow.findAll({
            where: { followerId: currentUserId, followingId: authorIds },
            attributes: ['followingId']
        })
    ]);

    const likedSet = new Set(likedQuestions.map(l => l.questionId));
    const followedSet = new Set(followedUsers.map(f => f.followingId));

    return questions.map(q => ({
        ...q.toJSON(),
        isLiked: likedSet.has(q.id),
        isFollowing: followedSet.has(q.userId)
    }));
};

// ── 1. QUESTIONS CRUD ─────────────────────────────────────────────

const createQuestion = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const question = await Question.create({
        userId: req.authenticatedUser.id,
        title,
        content,
    });

    res.status(201).json({ status: 'SUCCESS', message: 'Question created successfully', data: { question } });
});

const getAllQuestions = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;
    const currentUserId = req.authenticatedUser?.id;

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

    const questionsWithMeta = await attachMetaToQuestions(questions, currentUserId);

    let nextCursor = null;
    if (questions.length > 0) {
        const lastItem = questions[questions.length - 1];
        nextCursor = `${lastItem.isPinned}_${lastItem.createdAt.toISOString()}`;
    }

    res.status(200).json({ status: "SUCCESS", data: { results: questions.length, nextCursor, questions: questionsWithMeta } });
});

const getMyQuestions = asyncHandler(async (req, res) => {
    const { id, role } = req.authenticatedUser;

    const questions = await Question.findAll({
        where: { userId: id },
        order: [["createdAt", "DESC"]],
        include: [getAuthorInclude(role)]
    });

    const questionsWithMeta = await attachMetaToQuestions(questions, id);

    res.status(200).json({ status: "SUCCESS", data: { results: questions.length, questions: questionsWithMeta } });
});

const getOneQuestion = asyncHandler(async (req, res, next) => {
    const currentUserId = req.authenticatedUser?.id;

    const question = await Question.findByPk(req.params.id, {
        include: [allAuthorsInclude]
    });
    if (!question) return next(new ApiError('Question not found', 404));

    const [questionWithMeta] = await attachMetaToQuestions([question], currentUserId);

    res.status(200).json({ status: 'SUCCESS', data: { question: questionWithMeta } });
});

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

const deleteQuestion = asyncHandler(async (req, res, next) => {
    const question = await Question.findByPk(req.params.id);
    if (!question) return next(new ApiError("Question not found", 404));
    if (question.userId !== req.authenticatedUser.id) return next(new ApiError("Not authorized", 403));

    await question.destroy();
    res.status(200).json({ status: "SUCCESS", message: "Question deleted successfully" });
});

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

const createQuestionComment = asyncHandler(async (req, res, next) => {
    const { text } = req.body;
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId);
    if (!question) return next(new ApiError('Question not found', 404));

    const comment = await CommentQuestion.create({ text, questionId, userId: req.authenticatedUser.id });

    res.status(201).json({ status: 'SUCCESS', message: 'Comment added', data: { comment } });
});

const getQuestionComments = asyncHandler(async (req, res) => {
    const comments = await CommentQuestion.findAll({
        where: { questionId: req.params.questionId },
        order: [['createdAt', 'DESC']],
        include: [getAuthorInclude('USER')]
    });

    res.status(200).json({ status: 'SUCCESS', data: { results: comments.length, comments } });
});

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

// ── 4. SAVED QUESTIONS SECTION ────────────────────────────────────

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

const unsaveQuestion = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const userId = req.authenticatedUser.id;

    const savedItem = await SavedQuestion.findOne({ where: { userId, questionId } });
    if (!savedItem) return next(new ApiError('Question not found in saved list', 404));

    await savedItem.destroy();
    res.status(200).json({ status: 'SUCCESS', message: 'Question removed from saved questions' });
});

const getMySavedQuestions = asyncHandler(async (req, res) => {
    const currentUserId = req.authenticatedUser.id;

    const savedQuestions = await SavedQuestion.findAll({
        where: { userId: currentUserId },
        include: [{ model: Question, include: [allAuthorsInclude] }],
        order: [['createdAt', 'DESC']]
    });

    const questions = savedQuestions.map(s => s.Question);
    const questionsWithMeta = await attachMetaToQuestions(questions, currentUserId);

    res.status(200).json({ status: 'SUCCESS', results: savedQuestions.length, data: { savedQuestions: questionsWithMeta } });
});

// ── EXPORTS ───────────────────────────────────────────────────────
module.exports = {
    createQuestion, getAllQuestions, getMyQuestions, getOneQuestion,
    updateQuestion, deleteQuestion, togglePin,
    createQuestionComment, getQuestionComments, deleteQuestionComment, getMyQuestionComments,
    toggleQuestionLike,
    saveQuestion, unsaveQuestion, getMySavedQuestions
};