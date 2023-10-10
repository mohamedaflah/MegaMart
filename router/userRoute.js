const router = require("express").Router();
const passport = require("passport");
const {
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
  placeOrderPost,
  addingAddressGet,
  addinAddressPost,
  updateAddresGet,
  updateAddressPost,
  deleteUserAddress,
  userOrders,
} = require("../controller/userController");
const { verifySessionAuth } = require("../middleware/verifySession");
const { checkingUserStatus } = require("../middleware/statusVerify");
const { sesionVerification } = require("../middleware/functionalityVerify");
require("../auth/passportAuth");
require("../auth/LoginwithGoogle");
router.get("/", userHome);
router.get("/setSession", sessionsetWhileSignupWithGoogle);
router.get("/signup", singupGet);
router.get(
  "/auth/google",
  passport.authenticate("google-signup", { scope: ["email", "profile"] })
);

router.get(
  "/products/product-detail/:id/:image",
  sesionVerification,
  detailProductGet
);

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "/setSession",
//     failureRedirect: "/failedmail",
//   })
// );

router.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google-signup", (err, user, info) => {
    if (err) {
      // Handle error
      console.error("Error during Google authentication:", err);
      return res.redirect("/failedmail"); // Redirect to an error page
    }

    if (!user) {
      // Handle authentication failure
      console.error("Authentication failed:", info.message);
      return res.redirect("/failedmail"); // Redirect to a failure page
    }

    // Manually set a session variable with user data
    req.session.userEmail = user.email;

    // Redirect to the desired page (e.g., /setSession)
    return res.redirect("/setSession");
  })(req, res, next); // Invoke the Passport middleware
});

// Routes for Google login
// Update the route names to use "google" as the strategy name
// Routes for Google login
router.get(
  "/auth/login",
  passport.authenticate("google-login", { scope: ["email", "profile"] })
);
router.get("/auth/login/callback", (req, res) => {
  passport.authenticate(
    "google-login",
    (err, user, info) => {
      req.session.userEmail = user.email;
    },
    {
      successRedirect: "/setSession",
      failureRedirect: "/failedlogin",
    }
  );
});

router.get("/successmail", AfterMailSuccessfull);
router.get("/failedmail", MailVerificationFail);
router.get("/failedlogin", FailedLogin);
router.post("/signup", singupPost);
router.get("/mail/confirm", confirm);
router.post("/mail/confirm", confirmPost);
router.get("/errorMessage/close", closeErr);
router.get("/otp/close", otpClose);
router.get("/user/account/:id", userAccount);
router.get("/user/accounts/logout", userLogout);
router.get("/user/login", userLoginGet);
router.post("/user/login", userLoginPost);
router.get("/users/product/add-to-cart/:id", addTocart);
router.get("/users/product/cart/showcart/:id", sesionVerification, getCartPage);
router.get(
  "/users/product/cart/increaseqty/:userId/:productId/",
  increaseQuantity
);
router.get(
  "/users/product/cart/decreaseqty/:userId/:productId/",
  decreaseQuantity
);
router.get(
  "/users/product/cart/deleteitemfromcart/:userId/:productId/",
  deleteItemFromCart
);
router.get("/users/accounts/forgotpassword/", forgotPassword);
router.post("/users/accounts/forgotpassword", forgotPassPost);
router.get("/users/accounts/forgotpassword/confirm", forgotPassConfirm);
router.post("/users/accounts/forgotpassword/confirm", forgotPassConfirmPost);
router
  .route("/users/account/forgotpassword/changepassword/")
  .get(forgotPasswordPasswordEnter)
  .post(forgotPasswordPasswordEnterPost);
router.get("/users/product/cart/checkout/:userId", verifySessionAuth, checkOut);
router
  .route("/users/product/checkout/address/:userId")
  .get(enterAddress)
  .post(postUserAddress);
router
  .route("/users/product/cart/checkout/place-order/:userId", verifySessionAuth)
  .get(placeOrder)
  .post(placeOrderPost);
router
  .route("/users/account/address/add-address/:userId", verifySessionAuth)
  .get(addingAddressGet)
  .post(addinAddressPost);
router
  .route(
    "/users/product/cart/checkout/place-order/edit-address/:userId/:addressId"
  )
  .get(updateAddresGet)
  .post(updateAddressPost);
router.get(
  "/users/product/cart/checkout/place-order/delete-address/:userId/:addressId",
  deleteUserAddress
);
router.get(
  "/users/product/orders/trackorders/:userId",
  verifySessionAuth,
  userOrders
);
module.exports = { router };
