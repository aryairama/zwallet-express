import nodemailer from "nodemailer";
import { responseError } from "./helpers.js";
import email from '../template/email.js'

const sendEmail = (toEmail, token, name) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PW_EMAIL,
    },
  });

  transporter
    .sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "verifikasi email",
        // html: email(process.envFRONT_END_ACTIVATION_URL + token, name)
        html: email(`http://localhost:4000/users/activation/${token}`, name)
    })
    .then((result) => {
        console.log("Nodemailer success");
        console.log(result);
    })
    .catch((err) => {
      console.log("Nodemailer Error"+err);
    });
};

export default sendEmail;
