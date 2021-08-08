import nodemailer from "../configs/nodemailer.js";
import email from "../template/email.js";

const sendEmail = (toEmail, token, name) => {
  nodemailer
    .sendMail({
      from: `zWallet <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Email Verification",
      // html: email(process.envFRONT_END_ACTIVATION_URL + token, name)
      attachments: [
        {
          filename: "emailSucess.png",
          path: "./src/assets/img/emailSucess.png",
          cid: "email",
        },
      ],
      html: email(`${process.env.FRONT_END_ACTIVATION_URL}/verified-accounts/${token}`, name),
    })
    .then((result) => {
      console.log("Nodemailer success");
      console.log(result);
    })
    .catch((err) => {
      console.log("Nodemailer Error" + err);
    });
};
// D:\My file\Document\Bootcamp Arkademy\TeamProject\zwallet-express\src\assets\img\emailSucess.png
export default sendEmail;
