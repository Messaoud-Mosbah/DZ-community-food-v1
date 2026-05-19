const { Post, PostMedia, User, UserProfile, RestaurantProfile, CommentPosts, LikePosts } = require('../models');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

// ── دالة تجيب include حسب الـ role ──────────────────
const getAuthorInclude = (role) => ({
    model: User,
    // as: 'user',
    attributes: ['id', 'userName', 'role'],
    include: role === 'RESTAURANT'
        ? [{ model: RestaurantProfile, required: false, attributes: ['restaurantName', 'restaurantLogoUrl', 'city'] }]
        : [{ model: UserProfile, required: false, attributes: ['fullName', 'profilePicture'] }]
});

// في getAllPosts و getOnePost ما نعرف الـ role — نجيب الاثنين
const allAuthorsInclude = {
    model: User,
    // as: 'user',
    attributes: ['id', 'userName', 'role'],
    include: [
        { model: UserProfile, required: false, attributes: ['fullName', 'profilePicture'] },
        { model: RestaurantProfile, required: false, attributes: ['restaurantName', 'restaurantLogoUrl', 'city'] }
    ]
};

// ── 1. POSTS CRUD ────────────────────────────────────

const createPost = asyncHandler(async (req, res) => {
    const images = req.files?.images || [];
    const video = req.files?.video?.[0];
    const { title, description, contentType } = req.body;
    const { id, role } = req.authenticatedUser;

    let mediaTypeValue = 'NONE';
    if (images.length > 0) mediaTypeValue = 'IMAGE';
    else if (video) mediaTypeValue = 'VIDEO';

    const post = await Post.create({
        userId: id,
        title,
        description,
        contentType: contentType || 'DISH',
        mediaType: mediaTypeValue,
    });

    const mediaData = [];
    images.forEach((img, index) => {
        mediaData.push({ postId: post.id, type: "IMAGE", url: `/uploads/images/${img.filename}`, order: index });
    });
    if (video) {
        mediaData.push({ postId: post.id, type: "VIDEO", url: `/uploads/videos/${video.filename}`, order: 0 });
    }
    if (mediaData.length > 0) await PostMedia.bulkCreate(mediaData);

    const fullPost = await Post.findByPk(post.id, {
        include: [{ model: PostMedia, as: 'media' }, getAuthorInclude(role)]
    });

    res.status(201).json({ status: 'SUCCESS', data: { post: fullPost } });
});

const getAllPosts = asyncHandler(async (req, res) => {
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

    const posts = await Post.findAll({
        where: whereClause,
        limit,
        order: [["isPinned", "DESC"], ["createdAt", "DESC"]],
        include: [{ model: PostMedia, as: "media" }, allAuthorsInclude],
    });

    let nextCursor = null;
    if (posts.length > 0) {
        const lastItem = posts[posts.length - 1];
        nextCursor = `${lastItem.isPinned}_${lastItem.createdAt.toISOString()}`;
    }

    res.status(200).json({ status: "SUCCESS", data: { results: posts.length, nextCursor, posts } });
});

const getMyPosts = asyncHandler(async (req, res) => {
    const { id, role } = req.authenticatedUser;
    const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
    const limit = parseInt(req.query.limit) || 10;

    const whereCondition = { userId: id };
    if (cursor) whereCondition.createdAt = { [Op.lt]: cursor };

    const posts = await Post.findAll({
        where: whereCondition,
        limit,
        order: [["createdAt", "DESC"]],
        include: [{ model: PostMedia, as: "media" }, getAuthorInclude(role)]
    });

    const nextCursor = posts.length ? posts[posts.length - 1].createdAt : null;

    res.status(200).json({ status: "SUCCESS", data: { results: posts.length, nextCursor, posts } });
});

const getOnePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findByPk(req.params.id, {
        include: [{ model: PostMedia, as: 'media' }, allAuthorsInclude]
    });
    if (!post) return next(new ApiError('Post not found', 404));

    res.status(200).json({ status: 'SUCCESS', data: { post } });
});

const updatePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, contentType, keptMediaIds } = req.body;
    const images = req.files?.images || [];
    const video = req.files?.video?.[0];
    const { id: authId, role } = req.authenticatedUser;

    const post = await Post.findByPk(id);
    if (!post) return next(new ApiError("Post not found", 404));
    if (post.userId !== authId) return next(new ApiError("Not authorized", 403));

    const transaction = await sequelize.transaction();
    try {
        await post.update({
            title: title ?? post.title,
            description: description ?? post.description,
            contentType: contentType ?? post.contentType,
        }, { transaction });

        const keptIds = keptMediaIds ? JSON.parse(keptMediaIds) : [];
        await PostMedia.destroy({
            where: { postId: post.id, id: { [Op.notIn]: keptIds.length > 0 ? keptIds : ['NULL'] } },
            transaction
        });

        const mediaData = [];
        images.forEach((img, index) => {
            mediaData.push({ postId: post.id, type: "IMAGE", url: `/uploads/images/${img.filename}`, order: keptIds.length + index });
        });
        if (video) mediaData.push({ postId: post.id, type: "VIDEO", url: `/uploads/videos/${video.filename}`, order: 0 });
        if (mediaData.length > 0) await PostMedia.bulkCreate(mediaData, { transaction });

        const counts = await PostMedia.findAll({
            attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: { postId: post.id },
            group: ['type'],
            transaction
        });

        let newMediaType = "NONE";
        if (counts.some(c => c.type === 'IMAGE')) newMediaType = "IMAGE";
        else if (counts.some(c => c.type === 'VIDEO')) newMediaType = "VIDEO";

        await post.update({ mediaType: newMediaType }, { transaction });
        await transaction.commit();

        const updatedPost = await Post.findByPk(id, {
            include: [{ model: PostMedia, as: 'media' }, getAuthorInclude(role)]
        });
        res.status(200).json({ status: "SUCCESS", data: { post: updatedPost } });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

const deletePost = asyncHandler(async (req, res, next) => {
    const { id: authId } = req.authenticatedUser;

    const post = await Post.findByPk(req.params.id);
    if (!post) return next(new ApiError("Post not found", 404));
    if (post.userId !== authId) return next(new ApiError("Not authorized", 403));

    await post.destroy();
    res.status(200).json({ status: "SUCCESS", message: "Post deleted successfully" });
});

const togglePin = asyncHandler(async (req, res, next) => {
    const { id: authId } = req.authenticatedUser;

    const post = await Post.findOne({ where: { id: req.params.id, userId: authId } });
    if (!post) return next(new ApiError('Post not found or not yours', 404));

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({ status: 'SUCCESS', message: post.isPinned ? 'Post pinned' : 'Post unpinned', data: { post } });
});

// ── 2. COMMENTS SECTION ──────────────────────────────

const createComment = asyncHandler(async (req, res, next) => {
    const { text } = req.body;
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) return next(new ApiError('Post not found', 404));

    const comment = await CommentPosts.create({ text, postId, userId: req.authenticatedUser.id });

    res.status(201).json({ status: 'SUCCESS', message: 'Comment added', data: { comment } });
});

const getPostComments = asyncHandler(async (req, res) => {
    const comments = await CommentPosts.findAll({
        where: { postId: req.params.postId },
        order: [['createdAt', 'DESC']],
        include: [getAuthorInclude('USER')]
    });

    res.status(200).json({ status: 'SUCCESS', data: { results: comments.length, comments } });
});

const deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await CommentPosts.findByPk(req.params.id);
    if (!comment) return next(new ApiError('Comment not found', 404));

    const post = await Post.findByPk(comment.postId);
    const { id: authId } = req.authenticatedUser;

    if (comment.userId !== authId && post.userId !== authId) {
        return next(new ApiError('Not authorized', 403));
    }

    await comment.destroy();
    res.status(200).json({ status: 'SUCCESS', message: 'Comment deleted' });
});

// ── 3. LIKES SECTION ─────────────────────────────────

const toggleLike = asyncHandler(async (req, res, next) => {
    const { postId } = req.params;
    const userId = req.authenticatedUser.id;

    const post = await Post.findByPk(postId);
    if (!post) return next(new ApiError('Post not found', 404));

    const existingLike = await LikePosts.findOne({ where: { userId, postId } });

    if (existingLike) {
        await existingLike.destroy();
        res.status(200).json({ status: 'SUCCESS', message: 'Like removed', data: { isLiked: false } });
    } else {
        await LikePosts.create({ userId, postId });
        res.status(201).json({ status: 'SUCCESS', message: 'Post liked', data: { isLiked: true } });
    }
});

const checkIfLiked = asyncHandler(async (req, res) => {
    const like = await LikePosts.findOne({
        where: { userId: req.authenticatedUser.id, postId: req.params.postId }
    });
    res.status(200).json({ status: 'SUCCESS', data: { isLiked: !!like } });
});

module.exports = {
    createPost,
    getAllPosts,
    getMyPosts,
    getOnePost,
    updatePost,
    deletePost,
    togglePin,
    createComment,
    getPostComments,
    deleteComment,
    toggleLike,
    checkIfLiked
};