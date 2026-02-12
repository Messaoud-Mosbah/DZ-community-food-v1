const nodemailer = require('nodemailer');//without this biblio . node js cant send eamil

// const sendEmail = async ({ email, subject, message }) => {

// const transporter = nodemailer.createTransport({ //how to send . to who . with what 
//  service: 'Gmail', //service gmail , Outlook , ..
//     auth: {
//       user: process.env.EMAIL_USERNAME, //الإيميل لي راح يبعث
//       pass: process.env.EMAIL_PASSWORD, //كلمة السر (أو App Password
//     },
//   });

// const mailOptions = { //console content of emaail
//     from: process.env.EMAIL_USERNAME, 
//     to: email,
//     subject: subject,
//     text: message, //text maybe have url 
//   };

//   await transporter.sendMail(mailOptions); //send it now 


// }

// const sendEmail = async ({ email, subject, message }) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });

//   await transporter.sendMail({
//     from: 'DZ Community <no-reply@dz.com>',
//     to: email,
//     subject: subject,
//     text: message
//   });
// };


const sendEmail = async ({ email, subject, message }) => {
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
      from: `"DZ Community" <${process.env.EMAIL_USERNAME}>`, // استعملنا هنا username من .env
      to: email,
      subject: subject,
      text: message
    });

    console.log('Email sent successfully' ,info.messageId);
    return info; 
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; 
  }
};

module.exports = {sendEmail};