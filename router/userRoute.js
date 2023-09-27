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
} = require("../controller/userController");
const {verifySessionAuth}=require('../middleware/verifySession')
require("../auth/passportAuth");
require("../auth/LoginwithGoogle");
router.get("/", userHome);
router.get("/setSession", sessionsetWhileSignupWithGoogle);
router.get("/signup", singupGet);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/setSession",
    failureRedirect: "/failedmail",
  })
);

// Routes for Google login
// Update the route names to use "google" as the strategy name
// Routes for Google login
router.get(
  "/login/google",
  passport.authenticate("google-login", { scope: ["email", "profile"] })
);
router.get(
  "/login/google/callback",
  passport.authenticate("google-login", {
    successRedirect: "/setSession",
    failureRedirect: "/failedlogin",
  })
);

router.get("/successmail", AfterMailSuccessfull);
router.get("/failedmail", MailVerificationFail);
router.get("/failedlogin", FailedLogin);
router.post("/signup", singupPost);
router.get("/mail/confirm", confirm);
router.post("/mail/confirm", confirmPost);
router.get("/errorMessage/close", closeErr);
router.get("/otp/close", otpClose);
router.get("/user/account", userAccount);
router.get("/user/account/logout", userLogout);
router.get("/user/login", userLoginGet);
router.post("/user/login", userLoginPost);
module.exports = { router };
