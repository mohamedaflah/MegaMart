const speakeasy = require("speakeasy");
const transporter = require("../auth/nodmaile");
const EmailCheck = require("../auth/isValidEmail");
const MobileCheck = require("../auth/isValidMobile");
const UserCollection = require("../model/collections/UserDb");
const cartCollection = require("../model/collections/cart");
const addressCollection = require("../model/collections/address");
const bcrypt = require("bcryptjs");
const productsCollection = require("../model/collections/products");
const OtpCollection = require("../model/collections/otp");
const changeStream = require("../model/otpStream");
require("dotenv").config();
const { ObjectId } = require("bson");
const { getCartCount } = require("../helper/cart-helper");
const CategoryDb = require("../model/collections/CategoryDb");
const isValidMail = require("../auth/isValidEmail");
const { generateUniqueUsername } = require("../helper/generteUniquename");
const { generateOTP } = require("../auth/otpgen");
const walletCollection = require("../model/collections/wallet");
const { getWhishLIstCount } = require("../helper/whish-helper");
const couponCollection = require("../model/collections/cupon");
const adminCollection = require("../model/collections/adminDb");
const referalDb = require("../model/collections/referalDb");
const { sendOtp } = require("../helper/sendmail");
const whish = require("../model/collections/whish");
const ProductHelper =require("../helper/product-helper");
changeStream.on("otpDeleted", (documentId) => {
  console.log(`OTP document deleted with ID: ${documentId}`);
});
async function userHome(req, res) {
  if (req.session.adminAuth) {
    return res.redirect("/admin/");
  }
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });
  if (userStatus.length > 0 && !userStatus[0].status) {
    return res.render("users/login", {
      profile: false,
      err: "Your Permission Denied by Admin",
      cartCount: false,
      whishCount: false,
      id: false,
    });
  }

  let productData = await productsCollection.find({stock:{$gte:1}}).sort({ addedDate: -1 }).limit(6)
  const categories = await CategoryDb.find();
  const brands = await productsCollection.distinct("brand");
  if (req.session.userAuth && userStatus[0].status) {
    const userData = await UserCollection.findOne({
      email: req.session.userEmail,
    });
    const userId = userData._id;
    var cartCount = await getCartCount(userId);
    var whishListCount = await getWhishLIstCount(userId);
    // console.log("data of a cart " + cartCount);

    res.render("users/index", {
      profile: true,
      productData,
      cartCount,
      whishCount: whishListCount,
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
      brands,
    });
  }
}

function showLanding(req, res) {
  res.render("users/landing", {
    profile: false,
    id: false,
    cartCount: 0,
    whishCount: 0,
  });
}
async function showProductPage(req, res) {
  const categories = await CategoryDb.find();
  const brands = await productsCollection.distinct("brand");
  const products = await productsCollection
    .find({ deletionStatus: false })
    .sort({ addedDate: -1 });
  const min = Math.min(...products.map((item) => item.price));
  const max = Math.max(...products.map((item) => item.price));
  const userStatus = await UserCollection.findOne({
    email: req.session.userEmail,
  });
  console.log(userStatus);
  console.log(req.session.userEmail);
  if (req.session.userAuth) {
    if(!userStatus.status){
      return res.render("users/login", {
        profile: false,
        err: "Your Permission Denied by Admin",
        cartCount: false,
        whishCount: false,
        id: false,
      });
    }

    let cartCount = await getCartCount(userStatus._id);
    let whishCount = await getWhishLIstCount(userStatus._id);

    let i=0;
    for (const product of products) {
      let existStatusinCart = await cartCollection.findOne({
        userId: new ObjectId(userStatus._id),
        "products.productId": new ObjectId(product._id)
      });
      let existStatusinWhish = await whish.findOne({
        userId: new ObjectId(userStatus._id),
        "products.productId": new ObjectId(product._id)
      });
      if (existStatusinCart) {
        products[i].cartExist = true;
        
      }
    
      if (existStatusinWhish) {
        products[i].whishExist = true;
      }
      i++
    }
    return res.render("users/products", {
      profile: true,
      id: userStatus._id,
      cartCount,
      whishCount,
      categories,
      brands,
      products,
      min,
      max,
    });
  } else {
    return res.render("users/products", {
      profile: false,
      id: false,
      cartCount: 0,
      whishCount: 0,
      categories,
      brands,
      products,
      min,
      max,
    });
  }
}
function singupGet(req, res) {
  if (req.session.userAuth) {
    return res.redirect("/");
  }
  if (req.session.adminAuth) {
    return res.redirect("/admin/");
  }
  if (req.query && req.query.id) {
    req.session.userSignupwithreferal = true;
    req.session.userreferalId = req.query.id;
  }
  if (req.query && req.query.err) {
    // return res.json({err:req.query.err})
    res.render("users/sigup", {
      err: req.query.err,
      profile: false,
      cartCount: 0,
      whishCount: 0,
      id: false,
    });
  } else {
    res.render("users/sigup", {
      err: false,
      profile: false,
      cartCount: 0,
      whishCount: 0,
      id: false,
    });
  }
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
  if (req.query && req.query.err) {
    return res.json({ err: req.query.err });
  }
  console.log("api called");
  if (EmailCheck(req.body.email_or_Phone)) {
    try {
      let dupEmail = await UserCollection.find({
        email: req.body.email_or_Phone,
      });
      let dupUsername = await UserCollection.find({ name: req.body.name });
      console.log(dupEmail + ">> THis is the email");
      console.log(dupUsername + "<><><>< THis is the userkjsadklfj");
      if (dupEmail.length > 0) {
        res.json({ err: "Email is Already Exist" });
      } else if (dupUsername.length > 0) {
        res.json({ err: "Username is Already Exist Enter Unique" });
      } else {
        const password = req.body.password;
        const passwordCondition = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!password.match(passwordCondition)) {
          return res.json({
            err: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number.",
          });
        }
        req.session.userFullDetail = req.body;
        const secret = speakeasy.generateSecret({ length: 6 });
        const code = speakeasy.totp({
          secret: secret.base32,
          encoding: "base32",
        });
        let existStatus = await OtpCollection.findOne({
          useremail: req.body.email_or_Phone,
        });
        if (existStatus) {
          await OtpCollection.updateOne(
            { useremail: req.body.email_or_Phone },
            {
              $set: {
                otpnum: code,
                userEmail: req.body.email_or_Phone,
              },
            },
            { upsert: true }
          );
        } else {
          await new OtpCollection({
            otpnum: code,
            useremail: req.body.email_or_Phone,
          })
            .save()
            .then(() => {
              console.log("otp inserted");
            });
        }
        console.log("Secret ", secret.base32);
        console.log("Secret ", secret.base32);
        codEmai = code;
        console.log("Code ", code);
        const mailOptions = {
          from: process.env.USER_EMAIL,
          to: req.body.email_or_Phone,
          subject: "Megamart Confirmation Registration",
          html: `    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
           <div style="margin:50px auto;width:70%;padding:20px 0">
             <div style="border-bottom:1px solid #eee">
               <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">MegaMart</a>
             </div>
             <p style="font-size:1.1em">Hi,</p>
             <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 1 minutes</p>
             <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${code}</h2>
             <p style="font-size:0.9em;">Regards,<br />MegaMart</p>
             <hr style="border:none;border-top:1px solid #eee" />
             <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
               <p>MegaMart Inc</p>
               <p>1600 Amphitheatre Parkway</p>
               <p>India</p>
             </div>
           </div>
         </div>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({
              err: "An error occurred while sending the confirmation email.",
            });
          } else {
            console.log("Email sent:", info.response);
            console.log("code in 201_________" + codEmai);
            userInformation = req.body;
            // res.status(201).redirect("/mail/confirm");
            res.status(200).json({ status: true });
          }
        });
      }

      // res.json({message:"Success"}).status(201)
    } catch (err) {
      console.log("error is :" + err);
      res.json({ err: "failed" }).status(500);
    }
  } else {
    // res.render("users/sigup", {
    //   err: "Must be Enter Only Email Incuding '@'",
    //   profile: false,
    // });
    res.json({ err: "Must be Enter Only Email Incuding '@'" });
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
    let milliSecond = 50000;
    res.render("users/otp", {
      err: false,
      profile: false,
      cartCount: 0,
      whishCount: 0,
      id: false,
    });
    // setTimeout(async()=>{
    //   await OtpCollection.deleteOne({useremail:req.session.userFullDetail.email_or_Phone})
    //   console.log('Otp Deleted');
    // },milliSecond)
  } else {
    res.redirect("/signup");
  }
}
async function confirmPost(req, res) {
  try {
    let useremail=req.body.email
    let otp = await OtpCollection.findOne({
      useremail: useremail,
    });
    console.log("Otp in " + otp);
    if (req.body.verifyNum == Number(otp.otpnum)) {
      req.session.userAuth = true;
      let userInformation = req.session.userFullDetail;
      console.log(
        "in post confirm " + JSON.stringify(req.session.userFullDetail)
      );
      req.session.userEmail = userInformation.email_or_Phone;
      userInformation.password = bcrypt.hashSync(userInformation.password, 10);
      await new UserCollection({
        name: userInformation.name,
        email:useremail,
        password: userInformation.password,
        joinDate: Date.now(),
      })
        .save()
        .then((dat, err) => {
          console.log("inserted",dat);
          req.session.userId = dat._id;
        });
      // req.session.userSignupwithreferal ;
      // req.session.userreferalId

      if (req.session && req.session.userSignupwithreferal) {
        let wallerExist = await walletCollection.findOne({
          userId: new ObjectId(req.session.userreferalId),
        });
        const offAmt = await referalDb.find();
        console.log(offAmt,'offer db');
        const referalId = offAmt[0]._id;
        console.log(referalId,'_id')
        if (wallerExist) {
          await walletCollection.updateOne(
            { userId: new ObjectId(req.session.userreferalId) },
            { $inc: { amount: offAmt[0].offeramount } }
          );
        } else {
          await new walletCollection({
            userId: new ObjectId(req.session.userreferalId),
            amount: offAmt[0].offeramount,
            creditAmount: offAmt[0].offeramount,
          }).save();
        }
        await referalDb.updateOne(
          { _id: new ObjectId(referalId) },
          {
            $push: {
              invitedUser: {
                userId: new ObjectId(req.query.userSignupwithreferal),
              },
            },
          }
        );
        await referalDb.updateOne(
          {
            _id: new ObjectId(referalId),
          },
          {
            $push: {
              joinedUser: {
                userId: new ObjectId(req.session.userId),
              },
            },
          }
        );
      }
      res.json({ status: true });
    } else {
      res.json({ err: "Verification Failed and Pleas Try Agin!!..." });
    }
  } catch (err) {
    res.json({ err: "Failed and Crashed" });
    console.log("Error Otp post " + err);
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
  const wallet = await walletCollection.find({ userId: new ObjectId(userId) });
  const coupons = await couponCollection.find().sort({ addedDate: -1 });
  let totalAmt = 0;
  wallet.map((value) => {
    totalAmt += Number(value.amount);
  });
  console.log(wallet + " this is the wallet");
  console.log("totalAmount of Wallet " + totalAmt);
  const cartData = await cartCollection.findOne({
    userId: new ObjectId(userId),
  });
  var cartCount = await getCartCount(userId);
  let whishCount = await getWhishLIstCount(userId);
  const userData = await UserCollection.findOne({ _id: new ObjectId(userId) });
  const addressData = await addressCollection
    .findOne({
      userId: new ObjectId(userId),
    })
    .catch((err) => {
      console.log(err + " err in address acc");
    });
  console.log(addressData + " this is in account");
  res.render("users/Account", {
    profile: true,
    cartCount,
    whishCount,
    id: userId,
    userData,
    addressData,
    totalAmt,
    coupons,
  });
}
function userLogout(req, res) {
  req.session.userAuth = false;
  res.redirect("/");
}

function userLoginGet(req, res) {
  if (req.session.adminAuth) {
    return res.redirect("/admin/");
  }
  if (req.session.userAuth) {
    return res.redirect("/");
  }
  res.render("users/login", {
    profile: false,
    err: false,
    cartCount: 0,
    whishCount: 0,
    id: false,
  });
}
async function userLoginPost(req, res) {
  try {
    console.log("api called login");
    const { email_or_Phone, password } = req.body.formData;
    console.log(JSON.stringify(req.body.formData));
    if (!email_or_Phone || !password) {
      return res.json({ err: "Please Fillout All Field" });
    }
    if (!EmailCheck(email_or_Phone)) {
      return res.json({ err: "Enter Valid Email Including '@'" });
    }
    // Check if the user exists based on email
    const userData = await UserCollection.findOne({ email: email_or_Phone });

    // admin login
    const adminData = await adminCollection.findOne({ email: email_or_Phone });
    if (adminData) {
      const adminPassCompare = await bcrypt.compare(
        password,
        adminData.password
      );
      if (adminPassCompare) {
        req.session.adminAuth = true;
        return res.json({ admin: true });
      }
    }
    // admin ⏏

    if (!userData) {
      // User not found
      return res.json({ err: "User not Found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.json({ err: "Incorrect Email or Password" });
    }

    // Login successful
    req.session.userAuth = true;
    req.session.userEmail = email_or_Phone;
    const userStatus = await UserCollection.find({
      email: req.session.userEmail,
    });
    if (userStatus[0].status) {
      return res.json({ status: true });
    } else {
      return res.json({ err: "Your Access has been Denied by admin" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    // res.render("users/login", {
    //   profile: false,
    //   err: "Login failed. Please try again later.",
    // });
    return res.json({ err: "Login Failed " });
  }
}
function FailedLogin(req, res) {
  // res.render("users/failedlogin", {
  //   profile: false,
  //   err: "Login Failed",
  //   cartCount: 0,
  //   whishCount: 0,
  //   id: false,
  // });
  res.send("User not Found You can Singup");
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
      html: `
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">MegaMart</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 1 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${code}</h2>
      <p style="font-size:0.9em;">Regards,<br />MegaMart</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>MegaMart Inc</p>
        <p>1600 Amphitheatre Parkway</p>
        <p>India</p>
      </div>
    </div>
  </div>
      `,
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
    whishCount: false,
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
      whishCount: false,
    });
  }
}
function forgotPasswordPasswordEnter(req, res) {
  res.render("users/forgotpassenter", {
    profile: false,
    id: false,
    cartCount: 0,
    whishCount: 0,
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
        whishCount: 0,
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
      whishCount: 0,
      err: "Password Not Same",
    });
  }
}

async function getPaymentSuccess(req, res) {
  try {
    const userId = req.params.userId;

    const cartCount = await getCartCount(userId);
    const whishCount = await getWhishLIstCount(userId);
    res.render("users/paymentsuccess", {
      profile: true,
      cartCount,
      whishCount,
      id: userId,
    });
  } catch (err) {
    console.log("Error in paysucces" + err);
  }
}

async function updateProfile(req, res) {
  const userId = req.params.userId;
  const cartCount = await getCartCount(userId);
  const whishCount = await getWhishLIstCount(userId);
  const userData = await UserCollection.findOne({ _id: new ObjectId(userId) });
  res.render("users/updateprofile", {
    err: false,
    profile: true,
    cartCount,
    id: userId,
    userData,
    whishCount,
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
    { $set: { name: req.body.name } }
  );
  res.redirect(`/user/account/${req.params.userId}`);
}
async function suggestUniqueUsername(req, res) {
  const name = req.body.name;
  const usernames = [];
  for (let i = 1; i <= 5; i++) {
    let suggestions = generateUniqueUsername(name);
    let exist = await UserCollection.findOne({ name: suggestions });
    if (!exist) {
      usernames.push(suggestions);
    }
  }
  res.json({ suggestions: usernames });
}
async function checkUniqueOrnot(req, res) {
  if (!req.body.name || req.body.name === "") {
    return res.json({ status: false });
  }
  if (req.body.name.length <= 2) {
    return res.json({ status: false });
  }
  let isExist = await UserCollection.findOne({ name: req.body.name });
  if (isExist) {
    res.json({ status: false });
  } else {
    res.json({ status: true });
  }
}
async function checkUniqueEmail(req, res) {
  if (!EmailCheck(req.body.email)) {
    return res.json({ status: false });
  }
  if (!req.body.email || req.body.email === "") {
    return res.json({ status: false });
  }
  const emailExist = await UserCollection.findOne({ email: req.body.email });
  const emailExistinAdmin = await adminCollection.findOne({
    email: req.body.email,
  });
  if (emailExist || emailExistinAdmin) {
    res.json({ status: false });
  } else {
    res.json({ status: true });
  }
}
function resendOTP(req, res) {
  const userEmail = req.query.email
  const from = process.env.USER_EMAIL;
  const otp = generateOTP();
  const subject = "MegaMart Confirmation Registration Resned OTP";
  sendOtp(otp, from, userEmail, subject)
    .then(async (response) => {
      // res.status(200).json({ status: true });
      console.log(response,'asdfsdaf')
      await OtpCollection.deleteOne({ useremail: userEmail });
      await new OtpCollection({
        otpnum: otp,
        useremail: userEmail,
      }).save();
      res.json({ status: true });
    })
    .catch((err) => {
      console.log("error in send resend Otp", err);
    });
}
module.exports = {
  userHome,
  showLanding,
  showProductPage,
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
  updateProfile,
  updateProfilePost,
  suggestUniqueUsername,
  checkUniqueOrnot,
  checkUniqueEmail,
  resendOTP,
};
