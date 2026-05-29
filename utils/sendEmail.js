const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, subject, message, html }) => {
  try {
    // 💡 حيلة ذكية للتطوير المحلي: إذا كنت في بيئة التطوير، أرسل دائماً لإيميلك الشخصي لتجنب أخطاء الـ Sandbox
    // يمكنك إزالة هذا السطر أو استبداله لاحقاً
    const recipientEmail = process.env.NODE_ENV === 'production' ? email : 'm.mosbah@esi-sba.dz';

    const { data, error } = await resend.emails.send({
      from: 'Feed Me <onboarding@feedme.com>', // الإيميل الافتراضي المجاني من ريسند
      to: recipientEmail,                     // تم التعديل هنا ليرسل لك دائماً في مرحلة التجربة
      subject: subject,
      text: message,
      html: html
    });

    if (error) throw error;

    console.log('Email sent successfully', data.id);
    return data;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };