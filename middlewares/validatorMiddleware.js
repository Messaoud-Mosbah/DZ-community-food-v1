const { validationResult } = require('express-validator');

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path, 
      message: err.msg
    }));

    return res.status(400).json({
      status: 'FAIL',
      message: 'Validation Error', 
      data: null,
      errors:[...extractedErrors], 
    });
  }
  next();
};

module.exports = validatorMiddleware;