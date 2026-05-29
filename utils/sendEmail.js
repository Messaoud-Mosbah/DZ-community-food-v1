const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message, html }) => { // أضفنا html هنا
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"DZ Community Food" <${process.env.EMAIL_USERNAME}>`, 
      to: email,
      subject: subject,
      text: message, // النسخة الاحتياطية (نص عادي)
      html: html     // النسخة الأساسية (روابط قابلة للضغط وتنسيق)
    });

    console.log('Email sent successfully', info.messageId);
    return info; 
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; 
  }
};

module.exports = { sendEmail };