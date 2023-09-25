const admin = require("firebase-admin");
const { firebaseConfig } = require("../auth/firebaseConfig");
const speakeasy = require("speakeasy");
const transporter = require("../auth/nodmaile");
const EmailCheck = require("../auth/isValidEmail");
const MobileCheck = require("../auth/isValidMobile");
const UserCollection = require("../model/UserDb");
const bcrypt = require("bcrypt");
function userHome(req, res) {
  res.render("users/index", { profile: false });
}
function singupGet(req, res) {
  res.render("users/sigup", { err: false, profile: false });
}
function AfterMailSuccessfull(req, res) {
  console.log(req.isAuthenticated() + "authentication__________________");
  console.log(req.body);
  res.redirect("/");
}
function MailVerificationFail(req, res) {
  res.send("Failed Login");
}
var codEmai;
var userInformation;
async function singupPost(req, res) {
  if (EmailCheck(req.body.email_or_Phone)) {
    try {
      let dupEmail = await UserCollection.find({
        email: req.body.email_or_Phone,
      });
      let dupUsername = await UserCollection.find({ name: req.body.name });
      console.log(dupEmail + ">> THis is the email");
      console.log(dupUsername + "<><><>< THis is the userkjsadklfj");
      if (dupEmail.length > 0) {
        res.render("users/sigup", {
          err: "Email is Already Exist",
          profile: false,
        });
      } else if (dupUsername.length > 0) {
        res.render("users/sigup", {
          err: "Username is Already Exist Enter Unique",
        });
      } else {
        const secret = speakeasy.generateSecret({ length: 6 });
        const code = speakeasy.totp({
          secret: secret.base32,
          encoding: "base32",
        });
        console.log("Secret ", secret.base32);
        codEmai = code;
        console.log("Code ", code);
        console.log(req.body);
        const mailOptions = {
          from: "mohamedaflah186@gmail.com",
          to: req.body.email_or_Phone,
          subject: "Megamart Confirmation Registration",
          html:
            "<P>Thank you for Signing up! Please click the link below to confirm your registration : </p>" +
            `<h1>Your Verification code is :${code}</h1>`,
        };

        // await transporter.sendMail(mailOptions)
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({
              error: "An error occurred while sending the confirmation email.",
            });
          } else {
            console.log("Email sent:", info.response);
            console.log("code in 201_________" + codEmai);
            userInformation = req.body;
            res.status(201).redirect("/mail/confirm");
          }
        });
      }

      // res.json({message:"Success"}).status(201)
    } catch (err) {
      console.log("error is :" + err);
      res.json({ error: "failed" }).status(500);
    }
  } else if (MobileCheck(req.body.email_or_Phone)) {
    try {
      console.log("reached______________");
      console.log("number is " + req.body.email_or_Phone);
      // firebase.auth()
      const serviceAccount = require("../auth/megamart-bb04d-firebase-adminsdk-8hi61-3eb4004ba6.json");
      admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
        },
        "MegaMart"
      );
      const otp = require("../auth/otpgen").generateOTP();
      // await admin.auth().createUser({
      //   phoneNumber: `+91${req.body.email_or_Phone}`,
      // });
      const phone = `+91${req.body.email_or_Phone}`;
      const user = await admin.auth().getUserByPhoneNumber(phone);

      // If the user already exists, you can send the OTP to the existing user
      const verificationResult = await admin.auth().createSessionCookie(phone);

      console.log("Otp sended Success" + verificationResult);
    } catch (err) {
      console.log("error in otp" + err);
    }
  }
}
function confirm(req, res) {
  res.render("users/otp", { err: false, profile: false });
}
function confirmPost(req, res) {
  if (req.body.verifyNum == codEmai) {
    userInformation.password = bcrypt.hashSync(userInformation.password, 10);
    new UserCollection({
      name: userInformation.name,
      email: userInformation.email_or_Phone,
      password: userInformation.password,
    })
      .save()
      .then(() => {
        console.log("data inserted into SIgnup");
      });
    res.redirect("/");
  } else {
    res.render("users/otp", {
      err: "Verification Failed and Pleas Try Agin!!...",
      profile: false,
    });
  }
}
function closeErr(req, res) {
  res.redirect("/signup");
}
function otpClose(req, res) {
  res.redirect("/mail/confirm");
}
module.exports = {
  userHome,
  singupGet,
  AfterMailSuccessfull,
  MailVerificationFail,
  singupPost,
  confirm,
  confirmPost,
  closeErr,
  otpClose,
};
