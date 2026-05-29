const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, html }) => {
  try {
    // التأكد من تحويل المنفذ إلى رقم، والافتراضي هو 587
    const port = Number(process.env.EMAIL_PORT) || 587;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465, // ستكون true فقط إذا كان المنفذ 465
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // إضافة مهلة اتصال لتفادي تعليق السيرفر (تtimeout بعد 10 ثوانٍ بدلاً من دقيقتين)
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      // إعدادات TLS لتفادي مشاكل الحظر أو رفض الشهادات على السيرفرات السحابية
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("حالة الإعدادات الحالية:", {
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465,
    });

    // اختبار الاتصال بالخادم
    await transporter.verify();
    console.log("SMTP Connected Successfully");

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