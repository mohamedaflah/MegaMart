const adminDb = require("../model/collections/adminDb");
const userDb = require("../model/collections/UserDb");
const categoryCollection = require("../model/collections/CategoryDb");
const bcrypt = require("bcrypt");

const productCollection = require("../model/collections/products");
const fs = require("fs");
const { ObjectId } = require("mongodb");
// const formidable = require("formidable");
async function adminHomeShowuser(req, res) {
  // let hashedPass = bcrypt.hashSync("admin786", 10);
  // let data = await new adminDb({
  //   email: "admin@gmail.com",
  //   password: hashedPass,
  //   joinDate: Date.now(),
  // })
  //   .save()
  //   .then(() => {
  //     console.log("inserted admin");
  //   });
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
    // for (let i = 0; i < productData.length; i++) {
    //   let catId = productData[i].category;
    //   console.log(catId);
    //   let categoryData = await categoryCollection.find({ _id: catId });
    //   console.log(categoryData + "this is a cateory data_______________");
    //   // console.log(categoryData[0].categoryname,"this is the ct name")
    //   productData[i].category = categoryData.categoryname;
    // }
    // for (let i = 0; i < newData.length; i++) {
    //   let catId = newData[i].category;
    //   console.log(catId);
    //   let categoryData = await categoryCollection.find({ _id: catId });
    //   console.log(categoryData + "this is a category data_______________");
    //   if (categoryData[0] && categoryData[0].categoryname) {
    //     console.log("reached");
    //     newData[i].category = categoryData[0].categoryname;
    //   }
    // }
    // console.log("updated category _+_+" + newData);
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
          category: "$categoryInfo.categoryname",
          categoryId: "$categoryInfo._id",
          _id: true,
          price: true,
          discount: true,
          image: true,
          brand: true,
          specification: true,
          currentStatus: true,
          deletionStatus: true,
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
  res.render("admins/category", { categories });
}
async function addCategory(req, res) {
  try {
    console.log(req.body);
    await new categoryCollection({
      categoryname: req.body.category,
      addedDate: Date.now(),
    }).save();
    res.redirect("/admin/category");
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

    // Do whatever you want with these files.
    console.log("Uploaded files:");
    console.log(main);
    console.log(img2);
    console.log(img3);
    console.log(img4);
    console.log(img5);
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
    // const main = req.files["main"][0];
    // const img2 = req.files["image1"][0];
    // const img3 = req.files["image2"][0];
    // const img4 = req.files["image3"][0];
    // const img5 = req.files["image4"][0];
    // await productCollection.findByIdAndUpdate(new ObjectId(proId), {
    //   productName: productname,
    //   category: new ObjectId(categoryId._id),
    //   price: price,
    //   discount: discount,
    //   brand: brand,
    //   description: description,
    //   specification:[ {
    //     spec1: spec1,
    //     spec2: spec2,
    //     spec3: spec3,
    //     spec4: spec4,
    //   }],
    // });
    await productCollection.updateOne(
      { _id: new ObjectId(proId) },
      {
        $set: {
          productName: productname,
          category: categoryId._id,
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

// async function postEditProduct(req, res) {
//   try {
//     const proId = req.params.id;
//     const {
//       productname,
//       price,
//       discount,
//       brand,
//       category,
//       spec1,
//       spec2,
//       spec3,
//       spec4,
//       description,
//     } = req.body;
//     let catId=categoryCollection.findOne({categoryname:category})
//     const updateFields = {
//       productName: productname,
//       category: new ObjectId(catId._id),
//       price: price,
//       discount: discount,
//       brand: brand,
//       description: description,
//       specification: {
//         spec1: spec1,
//         spec2: spec2,
//         spec3: spec3,
//         spec4: spec4,
//       },
//     };

//     // Check if main image is provided in the request and update it if necessary
//     if (req.files && req.files["main"] && req.files["main"][0]) {
//       updateFields.image = updateFields.image || {}; // Ensure image field exists
//       updateFields.image.mainimage = req.files["main"][0].filename;
//     }

//     // Check if image1 is provided in the request and update it if necessary
//     if (req.files && req.files["image1"] && req.files["image1"][0]) {
//       updateFields.image = updateFields.image || {}; // Ensure image field exists
//       updateFields.image.image1 = req.files["image1"][0].filename;
//     }

//     // Check if image2 is provided in the request and update it if necessary
//     if (req.files && req.files["image2"] && req.files["image2"][0]) {
//       updateFields.image = updateFields.image || {}; // Ensure image field exists
//       updateFields.image.image2 = req.files["image2"][0].filename;
//     }

//     // Check if image3 is provided in the request and update it if necessary
//     if (req.files && req.files["image3"] && req.files["image3"][0]) {
//       updateFields.image = updateFields.image || {}; // Ensure image field exists
//       updateFields.image.image3 = req.files["image3"][0].filename;
//     }

//     // Check if image4 is provided in the request and update it if necessary
//     if (req.files && req.files["image4"] && req.files["image4"][0]) {
//       updateFields.image = updateFields.image || {}; // Ensure image field exists
//       updateFields.image.image4 = req.files["image4"][0].filename;
//     }

//     // Find the current product to get the existing image information
//     const currentProduct = await productCollection.findById(proId);

//     // If the image fields are not provided in the request, retain the existing images
//     if (!updateFields.image) {
//       updateFields.image = currentProduct.image;
//     }

//     // Update the product using the combined updateFields
//     await productCollection.findByIdAndUpdate(new ObjectId(proId), updateFields);

//     res.redirect('/admin/products');
//   } catch (err) {
//     console.error(`Error in updating product: ${err}`);
//   }
// }
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
  await productCollection.updateOne({_id:new ObjectId(productId)},{$set:{deletionStatus:false}})
  res.redirect('/admin/products')
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
  getEditProduct,
  postEditProduct,
  deleteProduct,
  recoverProduct,
};
