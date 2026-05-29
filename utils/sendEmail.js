const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const port = Number(process.env.EMAIL_PORT) || 587;

    const transporter = nodemailer.createTransport({
      // 🔥 الحل القاطع: تمرير الـ IP المباشر لـ Gmail IPv4 لمنع الـ DNS من التوجه لـ IPv6
      host: "74.125.134.108", 
      port,
      secure: false, // بما أننا نستخدم 587
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 15000, 
      greetingTimeout: 15000,
      tls: {
        // ضروري جداً هنا لأن اسم المضيف (Host) في الشهادة سيكون smtp.gmail.com وليس الـ IP
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com' 
      }
    });

    console.log("محاولة الاتصال بالـ IP المباشر لـ Gmail:");

    // اختبار الاتصال بالخادم
    await transporter.verify();
    console.log("SMTP Connected Successfully via Direct IPv4!");

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