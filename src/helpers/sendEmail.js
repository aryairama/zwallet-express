import nodemailer from "nodemailer";
import { responseError } from "./helpers.js";

const sendEmail = (toEmail, token) => {
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
      text: `Please activate your account with this link http://localhost:4000/users/activation/${token}`,
      //   html: ""
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
