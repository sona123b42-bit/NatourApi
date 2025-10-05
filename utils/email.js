const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
  console.log('Loaded ENV:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.EMAIL_PORT) || 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Va Sona <hello@sona.io>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Email send error:', err);
  }
};
module.exports = sendEmail;
