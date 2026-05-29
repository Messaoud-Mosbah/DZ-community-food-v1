const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const recipientEmail = process.env.NODE_ENV === 'production' ? email : 'm.mosbah@esi-sba.dz';

    const { data, error } = await resend.emails.send({
      from: 'Feed Me <onboarding@resend.dev>', 
      
      to: recipientEmail,
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