
const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err, res) => {
  // إذا كان الخطأ من صنعنا (Operational Error) نرسل الرسالة للمستخدم
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // إذا كان خطأ برمجي غير متوقع، نرسل رسالة عامة لحماية تفاصيل السيرفر
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;