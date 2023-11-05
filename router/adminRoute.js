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
  adminLogout,
  overView,
  filterUser,
  serchUser,
} = require("../controller/adminController");
const {
  ManageCategory,
  addCategory,
  editCategoryGet,
  editCategoryPost,
  unListCategory,
  recoverCategory,
  serchCategory,
  filteringandSortingcategory,
} = require("../controller/categoryController");
const {
  manageProducts,
  addProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  recoverProduct,
  filtereProduct,
  searchProductForAdmin,
} = require("../controller/productController");

const {
  listAllOrders,
  getOrderDetails,
  changeOrderStatus,
  filterOrders,
  filterSpecificOrder,
} = require("../controller/ordersController");
const { ManageBrands, addBrand } = require("../controller/brandController");
const {
  showAllCouponInAdmin,
  addCouponPost,
  checkCouponisExist,
  getEditCouponData,
  editCouponPost,
} = require("../controller/cuponController");
const {
  showAllReferalOffer,
  addreferalOffer,
  editOfferGet,
  editOfferPost,
} = require("../controller/referalController");
const {
  showCategoryOffers,
  addOfferforCategory,
  getupdateCategoryOffer,
  updateCategoryOfferPost,
} = require("../controller/categoryOfferController");
const { showProductOffer, addProductOffer } = require("../controller/productOfferController");
const { showAllreturns } = require("../controller/returnsController").admin;
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

const brandStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./public/brand-logos");
  },
  filename: (req, file, callback) => {
    const randomeString = crypto.randomBytes(3).toString("hex");
    const timestamp = Date.now();
    const uniqueFile = `${timestamp}-${randomeString}`;
    cb(null, uniqueFile + ".png");
  },
});
const brandUpload = multer({ storage: brandStorage });
const uploadFieldForBrand = [{ name: "logo" }];

router.post(
  "/products/add-brand",
  brandUpload.fields(uploadFieldForBrand),
  addBrand
);
router.get("/category", admiLoginVerify, ManageCategory);
router.post("/category/add-category", addCategory);
router.get("/category/edit-category/:id", admiLoginVerify, editCategoryGet);
router.post("/category/edit-category/:id", editCategoryPost);
router.get("/category/unlist-category/:id", unListCategory);
router.get("/category/recover-category/:id", recoverCategory);
router.get("/products/edit-product/:id", getEditProduct);

router.get("/brand", admiLoginVerify, ManageBrands);

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
router.post(
  "/products/orders/list-orders/orders/changin-status/:orderId/:userId",
  changeOrderStatus
);
router.get("/user/filter/:filterorder/", filterUser);
router.get("/products/filter-product/:filtereorder/", filtereProduct);
router.post("/user/search/searchuser", serchUser);
router.post("/products/serach/searchproduct/", searchProductForAdmin);
router.post("/category/serach/searchcategory/", serchCategory);
// router.get('*',(req,res)=>{
//   res.send('hel')
// })
router.get(
  "/category/filter-category/:filterOrder/",
  filteringandSortingcategory
);
router.get("/products/orders/orders/:filterorder/", filterOrders);
// router.post('/products/orders/filterorder',filterSpecificOrder)
router.get("/products/cupons/allcupons", admiLoginVerify, showAllCouponInAdmin);
router.get("/products/cupons/getEditdata/:couponId", getEditCouponData);
router.post("/products/coupons/editCoupon/:couponId", editCouponPost);
router.post("/products/coupons/add-coupon", addCouponPost);
router.post("/product/coupon/existstatus", checkCouponisExist);
router.get("/product/returns/showallreturns", admiLoginVerify, showAllreturns);
router.get("/product/offers/seeOffers", admiLoginVerify, showAllReferalOffer);
router.post("/product/offers/referaloffer/addoffer", addreferalOffer);
router.get("/product/offers/referaloffer/getEditofferData/", editOfferGet);
router.post("/product/offers/referaloffer/updateofferamt", editOfferPost);
router.get(
  "/product/offers/categoryoffer/",
  admiLoginVerify,
  showCategoryOffers
);
router.post(
  "/product/offers/categoryoffer/add-category-offer",
  addOfferforCategory
);
router.get("/product/offers/productoffer/", admiLoginVerify, showProductOffer);
router.post("/product/offers/productoffer/add-product-offer",addProductOffer);

router.get("/product/offers/categoryoffer/getupdatecategoryoffer/",getupdateCategoryOffer)
router.post("/product/offers/categoryoffer/updatecategoryoffer/",updateCategoryOfferPost)
module.exports = { router };
