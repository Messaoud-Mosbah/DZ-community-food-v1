const Joi = require("joi")
const ApiError = require("../apiError")
const asyncHandler = require('express-async-handler')

// ── CREATE POST VALIDATOR ─────────────────
const validateCreatePost = asyncHandler(async (req, res, next) => {
  const images = req.files?.images || []
  const video  = req.files?.video?.[0]

  if (images.length > 0 && video) {
    throw new ApiError('Cannot upload images and video together', 400)
  }

  const schema = Joi.object({
    title: Joi.string().max(255).required(),
    description: Joi.string().required(),
    contentType: Joi.string().valid('RECIPE', 'DISH').optional(),
    mediaType: Joi.string().valid('IMAGE', 'VIDEO', 'NONE'),
    keptMediaIds: Joi.any().optional() // ✅ زيد هذا
  })

  const { error } = schema.validate(req.body)
  if (error) throw new ApiError(error.details[0].message, 400)

  next()
})

// ── GET ALL POSTS VALIDATOR ─────────────────
const validateGetPosts = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    cursor: Joi.date().iso().optional(),
    limit: Joi.number().integer().min(1).max(50).optional(),
  });

  // const { error } = schema.validate(req.query);
  // if (error) throw new ApiError(error.details[0].message, 400);

  next();
});

// ── GET ONE POST VALIDATOR ─────────────────
const validateidpost = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().uuid().required()
  });

  const { error } = schema.validate(req.params);
  if (error) throw new ApiError(error.details[0].message, 400);

  next();
});


// ── UPDATE POST VALIDATOR ─────────────────
const validateUpdatePost = asyncHandler(async (req, res, next) => {
  const images = req.files?.images || [];
  const video = req.files?.video?.[0];

  if (images.length > 0 && video) {
    throw new ApiError('Cannot upload images and video together', 400);
  }

  let keptMediaIds = [];
  try {
    if (req.body.keptMediaIds) {
      keptMediaIds = JSON.parse(req.body.keptMediaIds);
    }
  } catch (e) {
    throw new ApiError('Invalid format for keptMediaIds', 400);
  }

  const schema = Joi.object({
    title: Joi.string().max(255).required(),
    description: Joi.string().max(255).required(),
    contentType: Joi.string().valid('RECIPE', 'DISH', 'POST', 'REEL').optional(),
    mediaType: Joi.string().valid('IMAGE', 'VIDEO', 'NONE').optional(), // ✅ optional
    keptMediaIds: Joi.array().optional()
  });

  const { error } = schema.validate({
    ...req.body,
    keptMediaIds
  });

  if (error) {
    throw new ApiError(error.details[0].message, 400);
  }

  next();
});


module.exports = { 
  validateCreatePost,
  validateUpdatePost,
  validateGetPosts,
  validateidpost  
}