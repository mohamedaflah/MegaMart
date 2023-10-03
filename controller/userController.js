const admin = require("firebase-admin");
const { firebaseConfig } = require("../auth/firebaseConfig");
const speakeasy = require("speakeasy");
const transporter = require("../auth/nodmaile");
const EmailCheck = require("../auth/isValidEmail");
const MobileCheck = require("../auth/isValidMobile");
const UserCollection = require("../model/collections/UserDb");
const bcrypt = require("bcrypt");
const productsCollection = require("../model/collections/products");

async function userHome(req, res) {
  // let userStatus=await UserCollection.find({email:req.session.userEmail})
  // console.log(typeof req.session.userEmail+'email ');
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });
  let productData = await productsCollection.find();
  if (req.session.userAuth && userStatus[0].status) {
    res.render("users/index", { profile: true, productData });
    // return;
  } else {
    res.render("users/index", { profile: false, productData });
  }
  console.log(req.session.userAuth + " __user auth");
  console.log(req.session.userEmail + " __user email");
}
function singupGet(req, res) {
  // if (req.session.userAuth) {
  // res.redirect("/");
  // } else {
  res.render("users/sigup", { err: false, profile: false });
  // }
}
function AfterMailSuccessfull(req, res) {
  console.log(req.isAuthenticated() + "authentication__________________");
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
        // console.log(req.body);
        const mailOptions = {
          from: "mohamedaflah186@gmail.com",
          to: req.body.email_or_Phone,
          subject: "Megamart Confirmation Registration",
          html:
            "<p style='color:green;'>Thank you for Signing up! Please click the link below to confirm your registration : </p>" +
            `<div style='width:90%;margin:auto;padding:5px;border-radius:5px;background:#2ff75e'>
                  <h1 style='color:white'>Your Verification code is :${code}</h1>
            </div>`,
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
  if (!req.session.userAuth) {
    res.render("users/otp", { err: false, profile: false });
  } else {
    res.redirect("/");
  }
}
async function confirmPost(req, res) {
  if (req.body.verifyNum == codEmai) {
    req.session.userAuth = true;
    console.log("in post confirm " + userInformation);
    req.session.userEmail = userInformation.email_or_Phone;
    userInformation.password = bcrypt.hashSync(userInformation.password, 10);
    await new UserCollection({
      name: userInformation.name,
      email: userInformation.email_or_Phone,
      password: userInformation.password,
      joinDate: Date.now(),
    })
      .save()
      .then(() => {
        console.log("inserted");
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
function sessionsetWhileSignupWithGoogle(req, res) {
  req.session.userAuth = true;
  res.redirect("/");
}
function userAccount(req, res) {
  res.render("users/Account", { profile: true });
}
function userLogout(req, res) {
  req.session.userAuth = false;
  res.redirect("/");
}

function userLoginGet(req, res) {
  res.render("users/login", { profile: false, err: false });
}
async function userLoginPost(req, res) {
  try {
    const { email_or_Phone, password } = req.body;

    // Check if the user exists based on email
    const userData = await UserCollection.findOne({ email: email_or_Phone });

    if (!userData) {
      // User not found
      return res.render("users/login", {
        profile: false,
        err: "User not found",
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      // Passwords don't match
      return res.render("users/login", {
        profile: false,
        err: "Incorrect password",
      });
    }

    // Login successful
    req.session.userAuth = true;
    req.session.userEmail = req.body.email_or_Phone;
    return res.redirect("/");
  } catch (err) {
    console.error("Error during login:", err);
    res.render("users/login", {
      profile: false,
      err: "Login failed. Please try again later.",
    });
  }
}
function FailedLogin(req, res) {
  res.render("users/failedlogin", { profile: false, err: "Login Failed" });
}
function detailProductGet(req, res) {

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
  sessionsetWhileSignupWithGoogle,
  userAccount,
  userLogout,
  userLoginGet,
  userLoginPost,
  FailedLogin,
  detailProductGet,
};
