import nodemailer from '../configs/nodemailer.js'
import templateForgotPassword from "../template/templateForgotPassword.js";

const forgotPassword = (toEmail, token, name) => {
  nodemailer
    .sendMail({
      from: `zWallet <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Password Reset",
      // html: email(process.envFRONT_END_ACTIVATION_URL + token, name)
      html: templateForgotPassword(
        `http://localhost:4000/users/forgotPassword/${token}`,
        name
      ),
      attachments: [
        {
          filename: "forgotpassword.png",
          path: "./src/assets/img/forgotpassword.png",
          cid: "forgotpw",
        },
      ],
    })
    .then((result) => {
      console.log("Nodemailer success");
      console.log(result);
    })
    .catch((err) => {
      console.log("Nodemailer Error" + err);
    });
};

export default forgotPassword;
