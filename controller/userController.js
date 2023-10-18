const speakeasy = require("speakeasy");
const transporter = require("../auth/nodmaile");
const EmailCheck = require("../auth/isValidEmail");
const MobileCheck = require("../auth/isValidMobile");
const UserCollection = require("../model/collections/UserDb");
const cartCollection=require('../model/collections/cart')
const addressCollection=require('../model/collections/address')
const bcrypt = require("bcrypt");
const productsCollection = require("../model/collections/products");
const { ObjectId } = require("bson");
const {
  getCartCount,
} = require("../helper/cart-helper");
const CategoryDb = require("../model/collections/CategoryDb");
const isValidMail = require("../auth/isValidEmail");

async function userHome(req, res) {
  // let userStatus=await UserCollection.find({email:req.session.userEmail})
  // console.log(typeof req.session.userEmail+'email ');
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });
  if (userStatus.length > 0 && !userStatus[0].status) {
    return res.render("users/login", {
      profile: false,
      err: "Your Permission Denied by Admin",
      cartCount: false,
      id: false,
    });
  }

  let productData = await productsCollection.find().sort({ addedDate: -1 });
  const categories = await CategoryDb.find();
  const brands=await productsCollection.distinct('brand')
  console.log(categories);
  if (req.session.userAuth && userStatus[0].status) {
    const userData = await UserCollection.findOne({
      email: req.session.userEmail,
    });
    const userId = userData._id;
    var cartCount = await getCartCount(userId);
    // console.log("data of a cart " + cartCount);
    
    res.render("users/index", {
      profile: true,
      productData,
      cartCount,
      id: userStatus[0]._id,
      err: false,
      categories,
      brands,
    });
    // return;
  } else {
    // req.session.qty=[]
    res.render("users/index", {
      profile: false,
      productData,
      id: false,
      err: false,
      categories,
      brands
      
    });
  }
}
function singupGet(req, res) {
  // if (req.session.userAuth) {
  // res.redirect("/");
  // } else {
  res.render("users/sigup", {
    err: false,
    profile: false,
    cartCount: 0,
    id: false,
  });
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
// var userInformation;
async function singupPost(req, res) {
  if (!req.body.email_or_Phone || !req.body.password || !req.body.name) {
    return res.render("users/sigup", {
      err: "Must be Enter Values in All Field",
      profile: false,
    });
  }
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
          profile: false,
        });
      } else {
        const password = req.body.password;
        const passwordCondition = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!password.match(passwordCondition)) {
          return res.render("users/sigup", {
            err: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one special character, and one number.",
            profile: false,
          });
        }
        req.session.userFullDetail=req.body;
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
  } else {
    res.render("users/sigup", {
      err: "Must be Enter Only Email Incuding '@'",
      profile: false,
    });
  }
  // else if (MobileCheck(req.body.email_or_Phone)) {
  //   try {
  //     console.log("reached______________");
  //     console.log("number is " + req.body.email_or_Phone);
  //     // firebase.auth()
  //     const serviceAccount = require("../auth/megamart-bb04d-firebase-adminsdk-8hi61-3eb4004ba6.json");
  //     admin.initializeApp(
  //       {
  //         credential: admin.credential.cert(serviceAccount),
  //       },
  //       "MegaMart"
  //     );
  //     const otp = require("../auth/otpgen").generateOTP();
  //     // await admin.auth().createUser({
  //     //   phoneNumber: `+91${req.body.email_or_Phone}`,
  //     // });
  //     const phone = `+91${req.body.email_or_Phone}`;
  //     const user = await admin.auth().getUserByPhoneNumber(phone);

  //     // If the user already exists, you can send the OTP to the existing user
  //     const verificationResult = await admin.auth().createSessionCookie(phone);

  //     console.log("Otp sended Success" + verificationResult);
  //   } catch (err) {
  //     console.log("error in otp" + err);
  //   }
  // }
}
function confirm(req, res) {
  if (!req.session.userAuth) {
    res.render("users/otp", {
      err: false,
      profile: false,
      cartCount: 0,
      id: false,
    });
  } else {
    res.redirect("/");
  }
}
async function confirmPost(req, res) {
  if (req.body.verifyNum == codEmai) {
    req.session.userAuth = true;
    let userInformation=req.session.userFullDetail;
    console.log("in post confirm " + JSON.stringify(req.session.userFullDetail));
    req.session.userEmail = userInformation.email_or_Phone;
    userInformation.password = bcrypt.hashSync(userInformation.password, 10);
    await new UserCollection({
      name: userInformation.name,
      email: userInformation.email_or_Phone,
      password: userInformation.password,
      joinDate: Date.now(),
    })
      .save()
      .then((dat, err) => {
        console.log("inserted");
        req.session.userId = dat._id;
      });
    res.redirect("/");
  } else {
    res.render("users/otp", {
      err: "Verification Failed and Pleas Try Agin!!...",
      profile: false,
      cartCount: 0,
      id: false,
    });
  }
}
// function resendOTP(req,res){

// }
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
async function userAccount(req, res) {
  const userId = req.params.id;
  const cartData = await cartCollection.findOne({
    userId: new ObjectId(userId),
  });
  var cartCount = 0;
  if (cartData) {
    cartCount = cartData.products.length;
  } else {
    cartCount = 0;
  }
  const userData = await UserCollection.findOne({ _id: new ObjectId(userId) });
  const addressData = await addressCollection.findOne({
    userId: new ObjectId(userId),
  });
  res.render("users/Account", {
    profile: true,
    cartCount,
    id: userId,
    userData,
    addressData,
  });
}
function userLogout(req, res) {
  req.session.userAuth = false;
  res.redirect("/");
}

function userLoginGet(req, res) {
  res.render("users/login", {
    profile: false,
    err: false,
    cartCount: 0,
    id: false,
  });
}
async function userLoginPost(req, res) {
  try {
    const { email_or_Phone, password } = req.body;
    if (!email_or_Phone || !password) {
      return res.render("users/login", {
        profile: false,
        err: "Please Fillout All Field",
        cartCount: false,
        id: false,
      });
    }
    // if(EmailCheck(req.body.email_or_Phone)){
    //   return res.render("users/login", {
    //     profile: false,
    //     err: "Enter Valid Email Including '@'",
    //     cartCount: false,
    //     id: false,
    //   });
    // }
    // Check if the user exists based on email
    const userData = await UserCollection.findOne({ email: email_or_Phone });

    if (!userData) {
      // User not found
      return res.render("users/login", {
        profile: false,
        err: "User not found",
        cartCount: false,
        id: false,
      });
    }
    // else if (!userData.status) {
    //   return res.render("users/login", {
    //     profile: false,
    //     err: "Your Permission Denied by Admin",
    //     cartCount: false,
    //     id: false,
    //   });
    // }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      // Passwords don't match
      return res.render("users/login", {
        profile: false,
        err: "Incorrect Email or Password",
        id: false,
      });
    }

    // Login successful
    req.session.userAuth = true;
    req.session.userEmail = req.body.email_or_Phone;
    const userStatus = await UserCollection.find({
      email: req.session.userEmail,
    });
    if (userStatus[0].status) {
      return res.redirect("/");
    } else {
      res.render("users/login", {
        profile: false,
        err: "Your Access has been denied by admin",
        id: false,
      });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.render("users/login", {
      profile: false,
      err: "Login failed. Please try again later.",
    });
  }
}
function FailedLogin(req, res) {
  // res.render("users/failedlogin", {
  //   profile: false,
  //   err: "Login Failed",
  //   cartCount: 0,
  //   id: false,
  // });
  res.send("failed");
}

function forgotPassword(req, res) {
  res.render("users/forgotpass", {
    profile: false,
    cartCount: false,
    id: false,
    err: false,
  });
}
var forgotInfo;
var fogotCode;
async function forgotPassPost(req, res) {
  try {
    forgotInfo = req.body.forgotemail;
    const userExist = await UserCollection.findOne({ email: forgotInfo });
    if (!userExist) {
      return res.render("users/forgotpass", {
        profile: false,
        cartCount: false,
        id: false,
        err: "Email Not Found",
      });
    }

    const secret = speakeasy.generateSecret({ length: 6 });
    const code = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });
    console.log("forgot ", secret.base32);
    fogotCode = code;
    console.log("forgot ", code);
    // console.log(req.body);
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: req.body.forgotemail,
      subject: "Changing Password",
      html:
        "<p style='color:teal;'>Change Your Password : </p>" +
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
        res.status(201).redirect("/users/accounts/forgotpassword/confirm");
      }
    });
  } catch (err) {
    console.log(
      "Error Founded in Sending otp Mail for Changing Password" + err
    );
  }
}
async function forgotPassConfirm(req, res) {
  res.render("users/forgotconfirm", {
    err: false,
    profile: false,
    id: false,
    cartCount: false,
  });
}
function forgotPassConfirmPost(req, res) {
  const otpNum = req.body.verifyNum;
  const mail = forgotInfo;

  if (otpNum == fogotCode) {
    res.redirect("/users/account/forgotpassword/changepassword/");
  } else {
    res.render("users/forgotconfirm", {
      err: "Verificatoin Failed",
      profile: false,
      id: false,
      cartCount: false,
    });
  }
}
function forgotPasswordPasswordEnter(req, res) {
  res.render("users/forgotpassenter", {
    profile: false,
    id: false,
    cartCount: 0,
    err: false,
  });
}
async function forgotPasswordPasswordEnterPost(req, res) {
  if (req.body.firstpassword == req.body.secondpassword) {
    req.body.firstpassword = bcrypt.hashSync(req.body.firstpassword, 10);
    const passwordCondition = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    const pass = req.body.firstpassword;
    if (!pass.match(passwordCondition)) {
      return res.render("users/forgotpassenter", {
        profile: false,
        id: false,
        cartCount: 0,
        err: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter and one number.",
      });
    }
    await UserCollection.updateOne(
      { email: forgotInfo },
      {
        $set: {
          password: req.body.firstpassword,
        },
      }
    );
    res.redirect("/user/login");
  } else {
    res.render("users/forgotpassenter", {
      profile: false,
      id: false,
      cartCount: 0,
      err: "Password Not Same",
    });
  }
}

async function getPaymentSuccess(req, res) {
  try {
    const userId = req.params.userId;
    const cartCount = await getCartCount(userId);
    res.render("users/paymentsuccess", {
      profile: true,
      cartCount,
      id: userId,
    });
  } catch (err) {
    console.log("Error in paysucces" + err);
  }
}

async function updateProfile(req, res) {
  const userId = req.params.userId;
  const cartCount = await getCartCount(userId);
  const userData = await UserCollection.findOne({ _id: new ObjectId(userId) });
  res.render("users/updateprofile", {
    err: false,
    profile: true,
    cartCount,
    id: userId,
    userData,
  });
}
async function updateProfilePost(req, res) {
  if (req.files && req.files["profile"] && req.files["profile"][0]) {
    const filname = `/profile-images/${req.files["profile"][0].filename}`;
    await UserCollection.updateOne(
      { _id: new ObjectId(req.params.userId) },
      { $set: { profileImage: filname } }
    );
  }
  await UserCollection.updateOne(
    { _id: new ObjectId(req.params.userId) },
    { $set: { name: req.body.name, email: req.body.email_or_Phone } }
  );
  res.redirect(`http://localhost:5001/user/account/${req.params.userId}`);
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
  forgotPassword,
  forgotPassPost,
  forgotPassConfirm,
  forgotPassConfirmPost,
  forgotPasswordPasswordEnter,
  forgotPasswordPasswordEnterPost,
  getPaymentSuccess,
  // resendOTP,
  updateProfile,
  updateProfilePost,
};
