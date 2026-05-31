const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const port = Number(process.env.EMAIL_PORT) || 587;

    const transporter = nodemailer.createTransport({
      host: "74.125.134.108", 
      port,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 15000, 
      greetingTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com' 
      }
    });


    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"FeedMe" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject,
      text: message,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
