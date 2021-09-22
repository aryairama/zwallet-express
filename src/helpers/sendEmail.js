const nodemailer = require('../configs/nodemailer');
const email = require('../template/email');

const sendEmail = (toEmail, token, name) => {
  console.log(process.env.FRONT_END_ACTIVATION_URL);
  nodemailer
    .sendMail({
      from: `zWallet <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Email Verification',
      // html: email(process.envFRONT_END_ACTIVATION_URL + token, name)
      attachments: [
        {
          filename: 'emailSucess.png',
          path: './src/assets/img/emailSucess.png',
          cid: 'email',
        },
      ],
      html: email(`${process.env.FRONT_END_ACTIVATION_URL}/verified-accounts/${token}`, name),
    })
    .then((result) => {
      console.log('Nodemailer success');
      console.log(result);
    })
    .catch((err) => {
      console.log(`Nodemailer Error${err}`);
    });
};
// D:\My file\Document\Bootcamp Arkademy\TeamProject\zwallet-express\src\assets\img\emailSucess.png
module.exports = sendEmail;
