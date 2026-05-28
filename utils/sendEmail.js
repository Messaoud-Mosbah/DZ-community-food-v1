const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message, html }) => { 
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"Feed Me" <${process.env.EMAIL_USERNAME}>`, 
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