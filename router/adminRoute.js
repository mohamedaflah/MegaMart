const router = require("express").Router();
const { admiLoginVerify } = require("../middleware/adminVerify");
const {
  adminHomeShowuser,
  adminLoginGet,
  adminLoginPost,
  adminErrClose,
} = require("../controller/adminController");
router.get("/", admiLoginVerify, adminHomeShowuser);
router.get("/login", adminLoginGet);
router.post("/login", adminLoginPost);
router.get("/errorMessage/close/", adminErrClose);
module.exports = { router };
