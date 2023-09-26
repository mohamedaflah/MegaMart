const nodemailer = require("nodemailer");
try {
  require("dotenv").config();
  // Create a Trasnported object

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_SECRETPASS,
    },
  });
  module.exports = transporter;
} catch (err) {
  console.log(err + "nodemiler");
}
