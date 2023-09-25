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
} = require("../controller/userController");

require("../auth/passportAuth");
router.get("/", userHome);
router.get("/signup", singupGet);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
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
module.exports = { router };
