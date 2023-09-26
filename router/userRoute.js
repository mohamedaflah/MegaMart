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
} = require("../controller/userController");

require("../auth/passportAuth");
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
router.get("/successmail", AfterMailSuccessfull);
router.get("/failedmail", MailVerificationFail);
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
