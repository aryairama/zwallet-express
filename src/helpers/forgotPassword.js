const nodemailer = require('../configs/nodemailer');
const templateForgotPassword = require('../template/templateForgotPassword');

const forgotPassword = (toEmail, token, name) => {
  nodemailer
    .sendMail({
      from: `zWallet <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Password Reset',
      // html: email(process.envFRONT_END_ACTIVATION_URL + token, name)
      html: templateForgotPassword(`${process.env.URL_FRONTEND}/resetpassword/${token}`, name),
      attachments: [
        {
          filename: 'forgotpassword.png',
          path: './src/assets/img/forgotpassword.png',
          cid: 'forgotpw',
        },
      ],
    })
    .then((result) => {
      console.log('Nodemailer success');
      console.log(result);
    })
    .catch((err) => {
      console.log(`Nodemailer Error${err}`);
    });
};

module.exports = forgotPassword;
