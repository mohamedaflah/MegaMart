const router = require("express").Router();
const { admiLoginVerify } = require("../middleware/adminVerify");
const {
  adminHomeShowuser,
  adminLoginGet,
  adminLoginPost,
  adminErrClose,
  blockUser,
  unBlockUser,
  manageProducts
} = require("../controller/adminController");
router.get("/", admiLoginVerify, adminHomeShowuser);
router.get("/login", adminLoginGet);
router.post("/login", adminLoginPost);
router.get("/errorMessage/close/", adminErrClose);
router.get("/userblock/:id", blockUser);
router.get("/userunblock/:id",unBlockUser)
router.get('/products',manageProducts)
module.exports = { router };
