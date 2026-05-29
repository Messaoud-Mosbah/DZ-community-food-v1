const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const port = Number(process.env.EMAIL_PORT) || 587;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465, 
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // تذكر حل مشكلة المهلة والشهادات الأمنية
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
      // 🔥 الطريقة الصحيحة لإجبار IPv4 في Nodemailer دون كسر الـ Socket
      family: 4
    });

    console.log("إعدادات الاتصال الحالية:", {
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465,
    });

    // اختبار الاتصال بالخادم
    await transporter.verify();
    console.log("SMTP Connected Successfully via IPv4");

    const info = await transporter.sendMail({
      from: `"DZ Food Community" <${process.env.EMAIL_USERNAME}>`,
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