import nodemailer from "nodemailer";
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;

// Info : We can use mail trap for sending testing mail

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: EMAIL_ADDRESS,
    pass: EMAIL_APP_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendVerificationMail(senderTitle, subject, html, toUserEmail) {
  // console.log(EMAIL_ADDRESS, EMAIL_APP_PASSWORD);
  const info = await transporter.sendMail({
    from: `"${senderTitle}" ${EMAIL_ADDRESS}`, // sender address
    to: `${toUserEmail}`, // list of receivers
    subject: subject, // Subject line
    html: html, // html body
  });

  return info;
}

export default sendVerificationMail;
