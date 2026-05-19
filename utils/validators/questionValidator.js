const Joi = require("joi");
const ApiError = require('../../utils/apiError'); // المسار الذي عدلناه سابقاً

// ── 1. CREATE QUESTION VALIDATOR ─────────────────
const validateCreateQuestion = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(5).max(100).required().messages({
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title is too short (min 5 characters)',
            'string.max': 'Title is too long (max 100 characters)'
        }),
        content: Joi.string().min(5).max(1000).required().messages({
            'string.empty': 'Question content cannot be empty',
            'string.min': 'Question content is too short (min 5 characters)',
            'string.max': 'Question content is too long (max 1000 characters)'
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        // نمرر الخطأ إلى Global Error Handler عبر next()
        return next(new ApiError(error.details[0].message, 400));
    }

    next();
};

// ── 2. GET ALL QUESTIONS VALIDATOR ───────────────
const validateGetQuestions = (req, res, next) => {
    const schema = Joi.object({
        cursor: Joi.string().optional(), 
        limit: Joi.number().integer().min(1).max(50).optional(),
    });

    const { error } = schema.validate(req.query);
    if (error) return next(new ApiError(error.details[0].message, 400));

    next();
};

// ── 3. ID VALIDATOR (FOR GET ONE, DELETE, PIN) ───
const validateIdQuestion = (req, res, next) => {
    const schema = Joi.object({
        // بما أنك تستخدم UUID في الميجريشنز، نتحقق من صيغة UUID
        id: Joi.string().uuid().required() 
    });

    const { error } = schema.validate({ id: req.params.id || req.params.questionId });
    if (error) return next(new ApiError("Invalid question ID format", 400));

    next();
};

// ── 4. UPDATE QUESTION VALIDATOR ─────────────────
const validateUpdateQuestion = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(5).max(100).optional(),
        content: Joi.string().min(5).max(1000).optional(),
    }).min(1); // يضمن إرسال حقل واحد على الأقل للتحديث

    const { error } = schema.validate(req.body);
    if (error) return next(new ApiError(error.details[0].message, 400));

    next();
};

module.exports = { 
    validateCreateQuestion,
    validateUpdateQuestion,
    validateGetQuestions,
    validateIdQuestion  
};