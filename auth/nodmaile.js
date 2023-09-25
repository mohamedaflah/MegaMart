const nodemailer = require("nodemailer");
try {
  // Create a Trasnported object

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mohamedaflah186@gmail.com",
      pass: "frih rrud anvu ldpa",
    },
  });
  module.exports = transporter;
} catch (err) {
  console.log(err + "nodemiler");
}
