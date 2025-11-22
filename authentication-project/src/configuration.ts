export default () => ({
  nodemailer: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT || 2525,
    from: process.env.MAIL_FROM,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    secure: process.env.MAIL_SECURE || '',
  },
});
