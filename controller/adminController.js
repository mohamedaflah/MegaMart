const adminDb = require("../model/collections/adminDb");
const userDb = require("../model/collections/UserDb");
const categoryCollection = require("../model/collections/CategoryDb");
const orderCollection = require("../model/collections/orders");
const bcrypt = require("bcrypt");
const productCollection = require("../model/collections/products");
const fs = require("fs");
const { ObjectId } = require("mongodb");
// const formidable = require("formidable");
async function adminHomeShowuser(req, res) {
  let usersData = await userDb.find().sort({ joinDate: -1 });
  res.render("admins/admin", { usersData });
}
async function adminLoginGet(req, res) {
  if (req.session.adminAuth) {
    res.redirect("/admin/");
  } else {
    res.render("admins/adlog", { err: false });
  }
}
async function adminLoginPost(req, res) {
  try {
    let getData = await adminDb.find({ email: req.body.email_or_Phone });

    if (getData.length > 0) {
      const passCompare = bcrypt.compareSync(
        req.body.password,
        getData[0].password
      );

      if (getData[0].email === req.body.email_or_Phone && passCompare) {
        req.session.adminAuth = true;
        res.redirect("/admin/");
      } else {
        res.render("admins/adlog", { err: "Login Failed" });
      }
    } else {
      res.render("admins/adlog", { err: "Login Failed" });
    }
  } catch (error) {
    console.error("Error in adminLoginPost:", error);
    res.render("admins/adlog", { err: "Login Failed" });
  }
}
function adminErrClose(req, res) {
  res.redirect("/admin/login");
}
async function blockUser(req, res) {
  let userId = req.params.id;
  await userDb
    .updateOne({ _id: new ObjectId(userId) }, { $set: { status: false } })
    .then(() => {
      console.log("user blocked");
      req.session.userAuth = false;
    });
  res.redirect("/admin/");
}

async function unBlockUser(req, res) {
  let userId = req.params.id;
  await userDb
    .updateOne({ _id: new ObjectId(userId) }, { $set: { status: true } })
    .then(() => {
      console.log("user (unblocked)");
    });
  res.redirect("/admin/");
}
async function manageProducts(req, res) {
  try {
    let categories = await categoryCollection.find();
    let productData = await productCollection.find();
    let newData = { ...productData };
    for (let i = 0; i < productData.length; i++) {
      let catId = newData[i].category;
      let catName = await categoryCollection.findOne({ _id: catId });
      // newData[i].category=catName.categoryname;
      console.log(catId + " cate Id");
      console.log(catName + " cate datas");
    }
    // console.log(JSON.stringify(newData)+"product updated data")
    let combined = await productCollection.aggregate([
      {
        $lookup: {
          from: "categories", // Name of collection "category"
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
          addedDate: 1,
          category: "$categoryInfo.categoryname",
          categoryId: "$categoryInfo._id",
          categorystatus: "$categoryInfo.categorystatus",
          _id: true,
          price: true,
          discount: true,
          image: true,
          brand: true,
          specification: true,
          currentStatus: true,
          deletionStatus: true,
          stock: true,
        },
      },
      {
        $sort: {
          addedDate: -1, // Sort by date in descending order (latest first)
        },
      },
    ]);
    console.log(JSON.stringify(combined, null, 2) + "lookup data");
    res.render("admins/products", { categories, productData: combined });
  } catch (error) {
    console.error("Error querying products:", error);
    res.status(500).send("Internal Server Error");
  }
}

function adminLogout(req, res) {
  req.session.adminAuth = false;
  res.redirect("/admin/login");
}
function overView(req, res) {
  res.render("admins/overview");
}
async function ManageCategory(req, res) {
  let categories = await categoryCollection.find();
  res.render("admins/category", { categories, err: false });
}
async function addCategory(req, res) {
  try {
    let categories = await categoryCollection.find();
    console.log(req.body);
    let categoryExist = await categoryCollection.findOne({
      categoryname: req.body.category,
    });
    if (!categoryExist) {
      await new categoryCollection({
        categoryname: req.body.category,
        addedDate: Date.now(),
      }).save();
      res.redirect("/admin/category");
    } else {
      res.render("admins/category", {
        categories,
        err: "Category Already Exist!!",
      });
    }
  } catch (err) {
    console.log("error in add cate" + err);
  }
}
async function addProduct(req, res) {
  try {
    const main = req.files["main"][0];
    const img2 = req.files["image1"][0];
    const img3 = req.files["image2"][0];
    const img4 = req.files["image3"][0];
    const img5 = req.files["image4"][0];
    const {
      productname,
      price,
      discount,
      brand,
      stock,
      category,
      spec1,
      spec2,
      spec3,
      spec4,
      description,
    } = req.body;

    console.log("name is " + productname);
    let categoryId = await categoryCollection.find({ categoryname: category });
    await new productCollection({
      productName: productname,
      category: new ObjectId(categoryId[0]._id),
      price: price,
      discount: discount,
      image: {
        mainimage: main.filename,
        image1: img2.filename,
        image2: img3.filename,
        image3: img4.filename,
        image4: img5.filename,
      },
      brand: brand,
      description: description,
      addedDate: Date.now(),
      specification: {
        spec1: spec1,
        spec2: spec2,
        spec3: spec3,
        spec4: spec4,
      },
      stock: stock,
    }).save();
    let data = await categoryCollection.find({ categoryname: category });
    // console.log(data + " __ this category data");
    await categoryCollection.updateOne(
      { categoryname: category },
      { $inc: { stock: 1 } }
    );
    res.redirect("/admin/products");
  } catch (err) {
    console.log("error found" + err);
  }
}
async function editCategoryGet(req, res) {
  const id = req.params.id;
  const categories = await categoryCollection.findById(id);
  res.render("admins/categoryedit", { categories });
}
async function editCategoryPost(req, res) {
  const id = req.params.id;
  await categoryCollection.findByIdAndUpdate(new ObjectId(id), {
    categoryname: req.body.category,
  });
  res.redirect("/admin/category");
}
async function unListCategory(req, res) {
  const id = req.params.id;
  await categoryCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { categorystatus: false } }
  );
  res.redirect("/admin/category");
}
async function getEditProduct(req, res) {
  const proId = req.params.id;
  const productData = await productCollection.findById(proId);
  const categories = await categoryCollection.find();
  const currentProuductCategory = await categoryCollection.findById({
    _id: productData.category,
  });
  res.render("admins/productedit", {
    productData,
    categories,
    currentProuductCategory,
  });
}

async function postEditProduct(req, res) {
  try {
    let proId = req.params.id;
    const {
      productname,
      price,
      discount,
      brand,
      category,
      spec1,
      spec2,
      spec3,
      spec4,
      description,
    } = req.body;
    console.log("category is a ++++++++++" + category);
    let categoryId = await categoryCollection.find({ categoryname: category });
    await productCollection.updateOne(
      { _id: new ObjectId(proId) },
      {
        $set: {
          productName: productname,
          category: categoryId[0]._id,
          price: price,
          discount: discount,
          brand: brand,
          description: description,
          specification: [
            {
              spec1: spec1,
              spec2: spec2,
              spec3: spec3,
              spec4: spec4,
            },
          ],
        },
      }
    );
    if (req.files && req.files["main"] && req.files["main"][0]) {
      await productCollection.updateOne(
        { _id: new ObjectId(proId) },
        {
          $set: {
            "image.0.mainimage": req.files["main"][0].filename,
          },
        }
      );
    }
    if (req.files && req.files["image1"] && req.files["image1"][0]) {
      await productCollection.updateOne(
        { _id: new ObjectId(proId) },
        {
          $set: {
            "image.0.image1": req.files["image1"][0].filename,
          },
        }
      );
    }
    if (req.files && req.files["image2"] && req.files["image2"][0]) {
      await productCollection.updateOne(
        { _id: new ObjectId(proId) },
        {
          $set: {
            "image.0.image2": req.files["image2"][0].filename,
          },
        }
      );
    }
    if (req.files && req.files["image3"] && req.files["image3"][0]) {
      await productCollection.updateOne(
        { _id: new ObjectId(proId) },
        {
          $set: {
            "image.0.image3": req.files["image3"][0].filename,
          },
        }
      );
    }
    if (req.files && req.files["image4"] && req.files["image4"][0]) {
      await productCollection.updateOne(
        { _id: new ObjectId(proId) },
        {
          $set: {
            "image.0.image4": req.files["image4"][0].filename,
          },
        }
      );
    }
    res.redirect("/admin/products");
  } catch (err) {
    console.log(`error in updating product ${err}`);
  }
}

async function deleteProduct(req, res) {
  let proId = req.params.id;
  await productCollection.updateOne(
    { _id: new ObjectId(proId) },
    { $set: { deletionStatus: true } }
  );
  res.redirect("/admin/products");
}
async function recoverProduct(req, res) {
  let productId = req.params.id;
  await productCollection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { deletionStatus: false } }
  );
  res.redirect("/admin/products");
}
async function listAllOrders(req, res) {
  // const orderDetail = await userDb.aggregate([
  //   {
  //     $lookup: {
  //       from: "orders",
  //       localField: "_id",
  //       foreignField: "userId",
  //       as: "userOrders",
  //     },
  //   },
  //   {
  //     $unwind: "$userOrders",
  //   },
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "userOrders.products.productId",
  //       foreignField: "_id",
  //       as: "userOrders.products.productDetails",
  //     },
  //   },
  //   {
  //     $unwind: "$userOrders.products.productDetails",
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       userOrders: {
  //         _id: "$userOrders._id",
  //         userId: "$userOrders.userId",
  //         paymentmode: "$userOrders.paymentmode",
  //         delverydate: "$userOrders.delverydate",
  //         status: "$userOrders.status",
  //         address: "$userOrders.address",
  //         products: "$userOrders.products.productDetails", // Reshape here
  //       },

  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$_id",
  //       userAddress: { $first: "$userAddress" },
  //       userOrders: { $push: "$userOrders" },
  //     },
  //   },
  // ]);

  // const orderDetail=await orderCollection.aggregate([
  //   {
  //     $lookup: {
  //       from: 'users', // Use the name of your Users collection here
  //       localField: 'userId',
  //       foreignField: '_id',
  //       as: 'user',
  //     },
  //   },
  //   {
  //     $unwind: '$user',
  //   },
  //   {
  //     $unwind: '$products',
  //   },
  //   {
  //     $lookup: {
  //       from: 'products', // Use the name of your Products collection here
  //       localField: 'products.productId',
  //       foreignField: '_id',
  //       as: 'product',
  //     },
  //   },
  //   {
  //     $unwind: '$product',
  //   },
  //   {
  //     $group: {
  //       _id: '$_id',
  //       userId: { $first: '$userId' },
  //       paymentmode: { $first: '$paymentmode' },
  //       delverydate: { $first: '$delverydate' },
  //       status: { $first: '$status' },
  //       address: { $first: '$address' },
  //       user: { $first: '$user' },
  //       products: {
  //         $push: {
  //           productId: '$product._id',
  //           qty: '$products.qty',
  //           productName: '$product.productName', // Add other product fields as needed
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       userId: 1,
  //       paymentmode: 1,
  //       delverydate: 1,
  //       status: 1,
  //       address: 1,
  //       'user._id': 1,
  //       'user.name': 1, // Add other user fields as needed
  //       products: 1,
  //     },
  //   },
  // ])

  const orderDetail = await orderCollection.aggregate([
    {
      $lookup: {
        from: "users", // Use the name of your Users collection here
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products", // Use the name of your Products collection here
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        paymentmode: 1,
        delverydate: 1,
        status: 1,
        address: 1,
        user: 1, // This will contain all user details
        products: {
          productId: "$product._id",
          qty: "$products.qty",
          productDetails: "$product", // This will contain all product details
        },
      },
    },
  ]);
  console.log(JSON.stringify(orderDetail) + " orders ");
  // await orderCollection.aggregate([
  //   {
  //     $
  //   }
  // ])
  res.render("admins/listOrders", { orderDetail });
}
async function getOrderDetails(req, res) {
  const orderId = req.params.orderId;
  const userId = req.params.userId;
  const orderDetail = await orderCollection.aggregate([
    {
      $match: {
        _id: new ObjectId(orderId), // Assuming ObjectId is used for _id field
        userId: new ObjectId(userId), // Assuming ObjectId is used for userId
      },
    },
    {
      $lookup: {
        from: "users", // Use the name of your Users collection here
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products", // Use the name of your Products collection here
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        paymentmode: 1,
        delverydate: 1,
        status: 1,
        address: 1,
        user: 1, // This will contain all user details
        products: {
          productId: "$product._id",
          qty: "$products.qty",
          productDetails: "$product", // This will contain all product details
        },
      },
    },
  ]);
  console.log(JSON.stringify(orderDetail) + " specific order");
  var totalAmount = 0;
  orderDetail.forEach((order) => {
    const product = order.products.productDetails;
    const quantity = order.products.qty;
    console.log(
      "produt  " +
        JSON.stringify(product.price) +
        "  pr  " +
        JSON.stringify(quantity) +
        "     qty"
    );
    var price;
    if (product.discount) {
      price = product.discount;
    } else {
      price = product.price;
    }
    console.log(price + " proc");

    // Calculate the subtotal for this product
    const subtotal = quantity * price;
    console.log(subtotal + "  sub total");
    // Add the subtotal to the total amount
    totalAmount = totalAmount + subtotal;
  });
  console.log("total Amt       " + totalAmount);
  res.render("admins/orderDetail", { orderDetail, totalAmount });
}
async function changeOrderStatus(req, res) {
  const ordeId = req.params.orderId;
  const userId = req.params.userId;
  await orderCollection.updateOne(
    { _id: new ObjectId(ordeId), userId: new ObjectId(userId) },
    {
      $set: {
        status: req.body.status,
      },
    }
  );
  console.log(ordeId+'     r')
  console.log(userId+'id')
  res.redirect(`/admin/products/orders/list-orders/orders-detail/${ordeId}/${userId}/`)
}
module.exports = {
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
  unListCategory,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  recoverProduct,
  listAllOrders,
  getOrderDetails,
  changeOrderStatus,
};
