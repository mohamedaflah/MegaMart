const admin = require("firebase-admin");
const { firebaseConfig } = require("../auth/firebaseConfig");
const speakeasy = require("speakeasy");
const transporter = require("../auth/nodmaile");
const EmailCheck = require("../auth/isValidEmail");
const MobileCheck = require("../auth/isValidMobile");
const UserCollection = require("../model/collections/UserDb");
const bcrypt = require("bcrypt");
const productsCollection = require("../model/collections/products");
const cartCollection = require("../model/collections/cart");
const orderCollection = require("../model/collections/orders");
const addressCollection = require("../model/collections/address");
const { ObjectId } = require("bson");
const { getCartCount, getUserCartData } = require("../helper/cart-helper");

async function userHome(req, res) {
  // let userStatus=await UserCollection.find({email:req.session.userEmail})
  // console.log(typeof req.session.userEmail+'email ');
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });
  let productData = await productsCollection.find();
  if (req.session.userAuth && userStatus[0].status) {
    const userData = await UserCollection.findOne({
      email: req.session.userEmail,
    });
    const userId = userData._id;
    var cartCount = await getCartCount(userId)
    console.log("data of a cart " + cartCount);
    res.render("users/index", {
      profile: true,
      productData,
      cartCount,
      id: userStatus[0]._id,
      err: false,
    });
    // return;
  } else {
    res.render("users/index", {
      profile: false,
      productData,
      id: false,
      err: false,
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
          profile: false,
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
  res.render("users/Account", { profile: true, cartCount, id: userId });
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

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      // Passwords don't match
      return res.render("users/login", {
        profile: false,
        err: "Incorrect password",
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
  res.render("users/failedlogin", {
    profile: false,
    err: "Login Failed",
    cartCount: 0,
    id: false,
  });
}
async function detailProductGet(req, res) {
  let proId = req.params.id;
  let mainImageas = req.params.image;
  console.log(proId);
  const userData = await UserCollection.findOne({
    email: req.session.userEmail,
  });
  const userId = userData._id;
  const cartData = await cartCollection.findOne({
    userId: new ObjectId(userId),
  });
  var cartCount = 0;
  if (cartData) {
    cartCount = cartData.products.length;
  } else {
    cartCount = 0;
  }
  // let productData = await productsCollection.aggregate([
  //   {
  //     $lookup: {
  //       from: "categories",
  //       localField: "category",
  //       foreignField: "_id",
  //       as: "categoryInfo",
  //     },
  //   },
  //   {
  //     $unwind: "$categoryInfo",
  //   },
  //   {
  //     $project: {
  //       productName: 1,
  //       category: "$categoryInfo.categoryname",
  //       price: 1,
  //       discount: 1,
  //       image: 1,
  //       brand: 1,
  //       specification: 1,
  //       currentStatus: 1,
  //       deletionStatus: 1,
  //     },
  //   },
  // ]);
  let productData = await productsCollection.aggregate([
    {
      $match: { _id: new ObjectId(proId) },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $project: {
        productName: 1,
        category: "$categoryInfo.categoryname",
        categoryId: "$categoryInfo._id",
        _id: true,
        price: true,
        discount: true,
        brand: true,
        description: true,
        image: {
          $map: {
            input: "$image",
            as: "img",
            in: {
              mainimage: "$$img.mainimage",
              image1: "$$img.image1",
              image2: "$$img.image2",
              image3: "$$img.image3",
              image4: "$$img.image4",
            },
          },
        },
        specification: {
          $map: {
            input: "$specification",
            as: "spec",
            in: {
              spec1: "$$spec.spec1",
              spec2: "$$spec.spec2",
              spec3: "$$spec.spec3",
              spec4: "$$spec.spec4",
            },
          },
        },
        currentStatus: true,
        deletionStatus: true,
      },
    },
  ]);
  console.log(JSON.stringify(productData));
  res.render("users/productDetail", {
    profile: true,
    productData,
    mainImageas,
    cartCount,
    id: userId,
  });
}
async function addTocart(req, res) {
  try {
    let productId = req.params.id;
    let userId = await UserCollection.findOne({ email: req.session.userEmail });
    let userCartExistStatus = await cartCollection.findOne({
      userId: new ObjectId(userId._id),
    });
    console.log(userCartExistStatus + " exits skjkl");
    if (!userCartExistStatus) {
      await new cartCollection({
        userId: new ObjectId(userId._id),
        products: [
          {
            productId: new ObjectId(productId),
            qty: 1,
          },
        ],
      }).save();
    } else {
      // const userCart = await cartCollection.findOne({
      //   userId: new ObjectId(userId),
      // });
      // const productAlreadyExist = userCart.products.findIndex(
      //   (product) => productId == new ObjectId(productId)
      // );
      // if (productAlreadyExist !== -1) {
      //   userCart.products[productAlreadyExist].qty++;
      // } else {
      const productExist = await cartCollection.aggregate([
        {
          $match: { userId: new ObjectId(userId) },
        },
        {
          $unwind: "$products",
        },
        {
          $match: { "products.productId": new ObjectId(productId) },
        },
      ]);

      console.log(
        JSON.stringify(productExist) + "+++++++++++exist status_____________-"
      );
      if (productExist.length <= 0) {
        await cartCollection.updateOne(
          {
            userId: new ObjectId(userId),
          },
          {
            $push: {
              products: {
                productId: new ObjectId(productId),
                qty: 1,
              },
            },
          }
        );
      } else {
        // await cartCollection.updateOne(
        //   {
        //     userId: new ObjectId(userId),
        //     "products.productId": new ObjectId(productId),
        //   },
        //   {
        //     $set: { "products.$.qty": updateQty },
        //   }
        // );
        let data = await cartCollection.updateOne(
          {
            userId: new ObjectId(userId),
            "products.productId": new ObjectId(productId),
          },
          { $inc: { "products.$.qty": 1 } }
        );

        console.log("finded data " + data);
      }
    }
    res.redirect("/");
  } catch (err) {
    console.log("error in add to cart" + err);
  }
}
async function getCartPage(req, res) {
  try {
    const userData = await UserCollection.findOne({
      email: req.session.userEmail,
    });
    const userId = userData._id;
    const cartCount=await getCartCount(userId)
    let userCartdata = await getUserCartData(userId);
    let totalAmount = 0;
    userCartdata.forEach((cardata) => {
      totalAmount += cardata.cartData.discount * cardata.products.qty;
    });
    if (userCartdata.length <= 0) {
      // console.log(JSON.stringify(userCartdata) + "data");
      res.render("users/cart", {
        profile: true,
        id: req.params.id,
        cartCount,
        userCartdata,
        totalAmount,
        empty: false,
      });
    } else {
      res.render("users/cart", {
        profile: true,
        id: req.params.id,
        cartCount,
        userCartdata,
        totalAmount,
        empty: true,
      });
    }
  } catch (err) {
    console.log("Error found in User cart " + err);
  }
}
async function increaseQuantity(req, res) {
  const userId = req.params.userId;
  const productId = req.params.productId;
  await cartCollection.updateOne(
    {
      userId: new ObjectId(userId),
      "products.productId": new ObjectId(productId),
    },
    {
      $inc: { "products.$.qty": 1 },
    }
  );

  res.redirect(`/users/product/cart/showcart/${userId}`);
}
async function decreaseQuantity(req, res) {
  const userId = req.params.userId;
  const productId = req.params.productId;
  await cartCollection.updateOne(
    {
      userId: new ObjectId(userId),
      "products.productId": new ObjectId(productId),
    },
    {
      $inc: { "products.$.qty": -1 },
    }
  );

  res.redirect(`/users/product/cart/showcart/${userId}`);
}
async function deleteItemFromCart(req, res) {
  const userId = req.params.userId;
  const productId = req.params.productId;
  await cartCollection.updateOne(
    {
      userId: new ObjectId(userId),
      "products.productId": new ObjectId(productId),
    },
    {
      $pull: {
        products: {
          productId: new ObjectId(productId),
        },
      },
    }
  );
  res.redirect(`/users/product/cart/showcart/${userId}`);
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
async function checkOut(req, res) {
  const userId = req.params.userId;
  let useraddressIsExist = await addressCollection.findOne({userId:new ObjectId(userId)});
  console.log(useraddressIsExist+'        ext')
  if (!useraddressIsExist) {
    res.redirect(`/users/product/checkout/address/${userId}`);
  }else{
    res.redirect(`/users/product/cart/checkout/place-order/${userId}`)
  }
}
async function placeOrder(req,res){
  const userId=req.params.userId
  const cartCount=await getCartCount(userId)
  res.render('users/place-order',{profile:true,cartCount,id:userId})
}
async function enterAddress(req, res) {
  const userId = req.params.userId;
  let userCartdata = await getUserCartData(userId)
  console.log(JSON.stringify(userCartdata));
  // const cartData = await cartCollection.findOne({
  //   userId: new ObjectId(userId),
  // });
  // var cartCount = 0;
  // if (cartData) {
  //   cartCount = cartData.products.length;
  // }
  let cartCount=await getCartCount(userId)
  let totalAmount = 0;
  userCartdata.forEach((cardata) => {
    totalAmount += cardata.cartData.discount * cardata.products.qty;
  });
  res.render("users/address", {
    profile: true,
    id: userId,
    cartCount,
    userCartdata,
    totalAmount,
  });
}
async function postUserAddress(req, res) {
  const userId = req.params.userId;
  const {
    name,
    email,
    state,
    district,
    pincode,
    street,
    phone,
    apartment,
    payment_method,
  } = req.body;
  console.log("Name  " + name);
  console.log("Eamil  " + email);
  console.log("state  " + state);
  console.log("district  " + district);
  console.log("place  " + pincode);
  console.log("street  " + street);
  console.log("phone  " + phone);
  console.log("apartment  " + apartment);
  console.log("payment  " + payment_method);
  const userCartdata = await getUserCartData(userId);
  // const productIds = userCartdata.map(
  //   (cartItem) => cartItem.products.productId
  // );
  // const quantities = userCartdata.map((cartItem) => cartItem.products.qty);
  const products = userCartdata.map((cartItem) => ({
    productId: cartItem.products.productId,
    qty: cartItem.products.qty,
  }));
  // console.log(userCartdata+' orders data')
  // console.log('            sadf'+JSON.stringify(products)+'this is the products')
  let totalAmount = 0;
  userCartdata.forEach((cardata) => {
    totalAmount += cardata.cartData.discount * cardata.products.qty;
  });
  await new addressCollection({
    userId: new ObjectId(userId),
    addresses:[
      {
        name: name,
        state: state,
        district: district,
        pincode: pincode,
        street: street,
        phone: phone,
        apartmentOrBuilding: apartment,
        email: email,
        addedDate: Date.now(),
      }
    ]
  }).save();
  await new orderCollection({
    userId: new ObjectId(userId),
    paymentmode: payment_method,
    delverydate: Date.now(),
    status: "Placed",
    // totalAmount:totalAmount,
    products: products,
    //  productIds.map((productId) => {
    //   const cartItem = userCartdata.find(
    //     (item) => item.cartData._id.toString() === productId.toString()
    //   );
    //   const qty = cartItem ? cartItem.products.qty : 0; // Get the quantity from the cart data
    //   return {

    //     productId: new ObjectId(productId),
    //     qty: qty,
    //   };
    // }),
  }).save();
  await cartCollection.deleteOne({ userId: new ObjectId(userId) }).then(() => {
    console.log("deleted");
  });
  if (payment_method == "COD") {
    res.redirect("/");
  }
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
  addTocart,
  getCartPage,
  increaseQuantity,
  decreaseQuantity,
  deleteItemFromCart,
  forgotPassword,
  forgotPassPost,
  forgotPassConfirm,
  forgotPassConfirmPost,
  forgotPasswordPasswordEnter,
  forgotPasswordPasswordEnterPost,
  enterAddress,
  checkOut,
  postUserAddress,
  placeOrder,
};
