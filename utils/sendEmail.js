const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const isRender = process.env.NODE_ENV === 'production';

    const port = isRender ? 465 : (Number(process.env.EMAIL_PORT) || 587);
    const secure = isRender ? true : (port === 465);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port, 
      secure: secure, 
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      // لضمان استقرار الاتصال على سيرفر Render وتفادي رفض شهادات الأمان
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: `"DZ Community Food" <${process.env.EMAIL_USERNAME}>`, 
      to: email,
      subject: subject,
      text: message, 
      html: html     
    });

    console.log('Email sent successfully', info.messageId);
    return info; 
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; 
  }
};

module.exports = { sendEmail };