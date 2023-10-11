const router = require("express").Router();
const multer = require("multer");
const crypto = require("crypto");
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
  addProduct,
  editCategoryGet,
  editCategoryPost,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  recoverProduct,
  listAllOrders,
  getOrderDetails,
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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/product-images/");
  },
  filename: function (req, file, cb) {
    const randomeString = crypto.randomBytes(3).toString("hex");
    const timestamp = Date.now();
    const uniqueFile = `${timestamp}-${randomeString}`;
    cb(null, uniqueFile + ".png");
  },
});
const upload = multer({ storage: storage });
const uploadFields = [
  { name: "main", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
];

router.post("/products/add-products", upload.fields(uploadFields), addProduct);
// router.post("/products/add-products", addProduct);

router.get("/category", admiLoginVerify, ManageCategory);
router.post("/category/add-category", addCategory);
router.get("/category/edit-category/:id", admiLoginVerify, editCategoryGet);
router.post("/category/edit-category/:id", editCategoryPost);
router.get("/products/edit-product/:id", getEditProduct);

router.post(
  "/products/edit-products/:id",
  upload.fields(uploadFields),
  postEditProduct
);
router.get("/products/delete-product/:id", deleteProduct);
router.get("/products/recover-product/:id", recoverProduct);
router.get("/products/orders/list-orders/", admiLoginVerify, listAllOrders);
router.get(
  "/products/orders/list-orders/orders-detail/:orderId/:userId",
  admiLoginVerify,
  getOrderDetails
);
module.exports = { router };
