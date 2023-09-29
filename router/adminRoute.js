const router = require("express").Router();
const { admiLoginVerify } = require("../middleware/adminVerify");
const {
  adminHomeShowuser,
  adminLoginGet,
  adminLoginPost,
  adminErrClose,
  blockUser,
  unBlockUser,
  manageProducts,
  adminLogout,
  overView,
  ManageCategory,
  addCategory,
} = require("../controller/adminController");
router.get("/", admiLoginVerify, adminHomeShowuser);
router.get("/login", adminLoginGet);
router.post("/login", adminLoginPost);
router.get("/errorMessage/close/", adminErrClose);
router.get("/userblock/:id", blockUser);
router.get("/userunblock/:id", unBlockUser);
router.get("/logout", adminLogout);
router.get("/overview", admiLoginVerify, overView);
router.get("/products", admiLoginVerify, manageProducts);
router.get("/category", admiLoginVerify, ManageCategory);
router.get("/category/add-category", addCategory);
module.exports = { router };
