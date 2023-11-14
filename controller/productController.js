const UserCollection = require("../model/collections/UserDb");
const productCollection = require("../model/collections/products");
const cartCollection = require("../model/collections/cart");
const { ObjectId } = require("bson");
const categoryCollection = require("../model/collections/CategoryDb");
const { getCartCount } = require("../helper/cart-helper");
const { getWhishLIstCount } = require("../helper/whish-helper");
async function manageProducts(req, res) {
  try {
    // add Product and Listing Product Section in Admin
    let categories = await categoryCollection.find();
    let productData = await productCollection.find();
    let newData = { ...productData };
    for (let i = 0; i < productData.length; i++) {
      let catId = newData[i].category;
      let catName = await categoryCollection.findOne({ _id: catId });
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
    res.render("admins/products", { categories, productData: combined });
  } catch (error) {
    console.error("Error querying products:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Add Product Post
async function addProduct(req, res) {
  try {
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
    if (
      !productname ||
      !price ||
      !brand ||
      !stock ||
      !category ||
      !spec1 ||
      !description
    ) {
      // return res.redirect(`/admin/products/add-products/nullfield`);
      return res.json({ err: "Must be Enter Data in All Field" });
    }
    if (price <= discount) {
      return res.json({ err: "Discount Amount Must be Lessthan Price" });
    }
    if (price <= 0) {
      return res.json({ err: "Muste enter positive values" });
    }
    if (
      !req ||
      !req.files["main"] ||
      !req.files["main"][0] ||
      !req.files["image1"] ||
      !req.files["image1"][0] ||
      !req.files["image2"] ||
      !req.files["image2"][0] ||
      !req.files["image3"] ||
      !req.files["image3"][0] ||
      !req.files["image4"] ||
      !req.files["image4"][0]
    ) {
      return res.json({ err: "Please Click and Upload Image" });
    }
    const main = req.files["main"][0];
    const img2 = req.files["image1"][0];
    const img3 = req.files["image2"][0];
    const img4 = req.files["image3"][0];
    const img5 = req.files["image4"][0];
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
    await categoryCollection.updateOne(
      { categoryname: category },
      { $inc: { stock: 1 } }
    );
    // res.redirect("/admin/products");
    res.json({ status: true });
  } catch (err) {
    console.log("error found in product add" + err);
    res.json({ err: "Submition Failed Crashed" });
  }
}

// Edit Product Page Get
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

// Post Edit Product
async function postEditProduct(req, res) {
  try {
    let proId = req.params.id;
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
    console.log("category is a ++++++++++" + category);
    // let previousCategoryId=await productCollection.findOne({_id:new ObjectId(proId)})
    let categoryId = await categoryCollection.find({ categoryname: category });
    await categoryCollection.updateOne(
      { _id: new ObjectId(categoryId[0]._id) },
      { $inc: { stock: 1 } }
    );
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
          stock: stock,
        },
      }
    );
    // await categoryCollection.updateOne({_id:new ObjectId(categoryId)},{$inc:{stock:1}})
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

// Delete Product or Unlisting
async function deleteProduct(req, res) {
  let proId = req.params.id;
  await productCollection.updateOne(
    { _id: new ObjectId(proId) },
    { $set: { deletionStatus: true } }
  );
  res.redirect("/admin/products");
}

// Recover Deleted Product
async function recoverProduct(req, res) {
  let productId = req.params.id;
  await productCollection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { deletionStatus: false } }
  );
  res.redirect("/admin/products");
}

async function filtereProduct(req, res) {
  const filterorder = req.params.filtereorder;
  let categories = await categoryCollection.find();
  if (filterorder == "outofstock") {
    let combined = await productCollection.aggregate([
      {
        $match: {
          $or: [{ deletionStatus: true }, { stock: { $lt: 1 } }],
        },
      },
      {
        $lookup: {
          from: "categories",
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
          addedDate: -1,
        },
      },
    ]);
    res.render("admins/filterproduct", { productData: combined, categories });
  } else if (filterorder == "instock") {
    let combined = await productCollection.aggregate([
      {
        $match: {
          deletionStatus: false,
          stock: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "categories",
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
          addedDate: -1,
        },
      },
    ]);
    res.render("admins/filterproduct", { productData: combined, categories });
  } else if (filterorder == "latest") {
    // productData = await productCollection.find().sort({ addedDate: -1 });
    let combined = await productCollection.aggregate([
      {
        $sort: {
          addedDate: -1,
        },
      },
      {
        $lookup: {
          from: "categories",
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
    ]);
    res.render("admins/filterproduct", { productData: combined, categories });
  } else if (filterorder == "oldest") {
    let combined = await productCollection.aggregate([
      {
        $sort: {
          addedDate: 1,
        },
      },
      {
        $lookup: {
          from: "categories",
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
    ]);
    res.render("admins/filterproduct", { productData: combined, categories });
  }
}

// Search Product for Admin
async function searchProductForAdmin(req, res) {
  const searchTerm = req.body.search;
  let combined = await productCollection.aggregate([
    {
      $match: {
        $or: [
          { productName: { $regex: searchTerm, $options: "i" } }, // Case-insensitive product name search
          { brand: { $regex: searchTerm, $options: "i" } }, // Case-insensitive brand search
        ],
      },
    },
    {
      $sort: {
        addedDate: -1,
      },
    },
    {
      $lookup: {
        from: "categories",
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
  ]);
  const categories = await categoryCollection.find();
  // res.render("admins/products", { categories, productData: combined });
  res.json({ categories: categories, productData: combined });
}

// Users Controlling Start

async function detailProductGet(req, res) {
  let proId = req.params.id;
  let mainImageas = req.params.image;
  console.log(proId);
  // if (req.session.userAuth) {
  // }
  const userData = await UserCollection.findOne({
    email: req.session.userEmail,
  });
  const userId = userData._id;
  const whishCount = await getWhishLIstCount(userId);
  const cartData = await cartCollection.findOne({
    userId: new ObjectId(userId),
  });
  let cartCount = await getCartCount(userId);

  let productData = await productCollection.aggregate([
    {
      $match: { _id: new ObjectId(proId) },
    },
    {
      $lookup: {
        from: "categories",
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
        brand: true,
        description: true,
        image: {
          $map: {
            input: "$image",
            as: "img",
            in: {
              mainimage: "$$img.mainimage",
              image1: "$$img.image1",
              image2: "$$img.image2",
              image3: "$$img.image3",
              image4: "$$img.image4",
            },
          },
        },
        specification: {
          $map: {
            input: "$specification",
            as: "spec",
            in: {
              spec1: "$$spec.spec1",
              spec2: "$$spec.spec2",
              spec3: "$$spec.spec3",
              spec4: "$$spec.spec4",
            },
          },
        },
        currentStatus: true,
        deletionStatus: true,
        stock: true,
        offer: true,
      },
    },
  ]);
  const productExist = await cartCollection.aggregate([
    {
      $match: { userId: new ObjectId(userId) },
    },
    {
      $unwind: "$products",
    },
    {
      $match: { "products.productId": new ObjectId(productData[0]._id) },
    },
  ]);
  let exist;
  if (productExist.length > 0) {
    exist = true;
  } else {
    exist = false;
  }
  const catId = productData[0].categoryId;
  const allProduct = await productCollection.find({
    category: new ObjectId(catId),
  });

  console.log(JSON.stringify(productData));
  res.render("users/productDetail", {
    profile: true,
    productData,
    mainImageas,
    cartCount,
    whishCount,
    id: userId,
    allProduct,
    exist,
  });
}

// Searching Product in User
async function searchProduct(req, res) {
  const productData = await productCollection
    .find({
      $or: [
        { productName: { $regex: "^" + req.body.searchdata, $options: "i" } },
        { brand: { $regex: "^" + req.body.searchdata, $options: "i" } },
      ],
    })
    .sort({ addedDate: -1 });
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });
  const brands = await productCollection.distinct("brand");
  const categories = await categoryCollection.find();
  if (req.session.userAuth && userStatus[0].status) {
    const userData = await UserCollection.find({
      email: req.session.userEmail,
    });
    const userId = userData[0]._id;
    var cartCount = await getCartCount(userId);

    res.json({ productData: productData });
  } else {
    res.json({ productData: productData });
  }
}

// Filtering Price
async function filteredbyMinandMaxPrice(req, res) {
  const { min, max } = req.body;
  res.redirect(`/users/product/filteredby/minandmax/${min}/${max}/`);
}

async function filteredbyMinandMaxGet(req, res) {
  console.log("reached");

  const { min, max } = req.params;
  console.log(`min in ${min}  max in ${max}`);
  const productData = await productCollection
    .find({
      $or: [
        { price: { $gt: min, $lt: max } },
        { discount: { $gt: min, $lt: max } },
      ],
    })
    .exec();

  console.log(min + " " + max);
  console.log(JSON.stringify(productData) + "product data");
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });

  const categories = await categoryCollection.find();
  if (req.session.userAuth && userStatus[0].status) {
    const userData = await UserCollection.findOne({
      email: req.session.userEmail,
    });
    const userId = userData._id;
    const whishCount = await getWhishLIstCount(userId);
    var cartCount = await getCartCount(userId);
    console.log("data of a cart " + cartCount);

    res.render("users/filterbyprice", {
      profile: true,
      productData,
      cartCount,
      id: userStatus[0]._id,
      err: false,
      categories,
      whishCount,
    });
    // return;
  } else {
    res.render("users/filterbyprice", {
      profile: false,
      productData,
      id: false,
      err: false,
      categories,
    });
  }
}

// Sort Products
async function sortProducts(req, res) {
  let sortOrder = req.params.sortorder;
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });
  let productData;
  if (sortOrder == "latest") {
    productData = await productCollection.find().sort({ addedDate: -1 });
  } else if (sortOrder == "oldest") {
    productData = await productCollection.find().sort({ addedDate: 1 });
  } else if (sortOrder == "pricehightolow") {
    productData = await productCollection.find().sort({ price: -1 });
  } else if (sortOrder == "pricelowtohigh") {
    productData = await productCollection.find().sort({ price: 1 });
  }
  const categories = await categoryCollection.find();
  if (req.session.userAuth && userStatus[0].status) {
    const userData = await UserCollection.findOne({
      email: req.session.userEmail,
    });
    const userId = userData._id;
    var cartCount = await getCartCount(userId);
    res.render("users/sort", {
      profile: true,
      productData,
      cartCount,
      id: userStatus[0]._id,
      err: false,
      categories,
    });
    // return;
  } else {
    res.render("users/sort", {
      profile: false,
      productData,
      id: false,
      err: false,
      categories,
    });
  }
}
async function filterProductwithBrand(req, res) {
  const brand = req.query.brand;
  const productData = await productCollection.find({
    brand: brand,
  });
  const userStatus = await UserCollection.find({
    email: req.session.userEmail,
  });
  const brands = await productCollection.distinct("brand");
  const categories = await categoryCollection.find();
  if (req.session.userAuth && userStatus[0].status) {
    const userData = await UserCollection.find({
      email: req.session.userEmail,
    });
    const userId = userData[0]._id;
    var cartCount = await getCartCount(userId);
    var whishCount = await getWhishLIstCount(userId);
    // console.log("data of a cart " + cartCount);

    res.render("users/index", {
      profile: true,
      productData,
      cartCount,
      id: userStatus[0]._id,
      err: false,
      categories,
      whishCount,
      brands,
    });
    // return;
  } else {
    res.render("users/index", {
      profile: false,
      productData,
      id: false,
      err: false,
      categories,
      brands,
    });
  }
}
async function filteringandSort(req, res) {
  try{
    const categories = req.query.category ? req.query.category.split(",") : [];
    const brands = req.query.brand ? req.query.brand.split(",") : [];
    const sort = req.query.sort || "";
  console.log(sort,'sort ')
    let filterQuery = {};
    if (categories.length > 0) {
      filterQuery.category = { $in: categories };
    }
    if (brands.length > 0) {
      filterQuery.brand = { $in: brands };
    }
    let sortOption = {};
    if (sort == "hightolow") {
      sortOption.price = -1;
    } else if (sort == "lowtohigh") {
      sortOption.price = 1;
    } else if (sort == "latest") {
      sortOption.addedDate = -1;
    } else if (sort == "oldest") {
      sortOption.addedDate = 1;
    }
    console.log(filterQuery)
    console.log(sortOption,'sort option')
    const data=await productCollection.find(filterQuery).sort(sortOption)
    // console.log(data)
    res.json({data})
  }catch(err){
    console.log("err in sort and filter"+err);
  }

}
async function detailProductForFetch(req, res) {
  console.log("detail api called");

  let proId = req.params.id;
  let mainImageas = req.params.image;
  let productData = await productCollection.aggregate([
    {
      $match: { _id: new ObjectId(proId) },
    },
    {
      $lookup: {
        from: "categories",
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
        brand: true,
        description: true,
        image: {
          $map: {
            input: "$image",
            as: "img",
            in: {
              mainimage: "$$img.mainimage",
              image1: "$$img.image1",
              image2: "$$img.image2",
              image3: "$$img.image3",
              image4: "$$img.image4",
            },
          },
        },
        specification: {
          $map: {
            input: "$specification",
            as: "spec",
            in: {
              spec1: "$$spec.spec1",
              spec2: "$$spec.spec2",
              spec3: "$$spec.spec3",
              spec4: "$$spec.spec4",
            },
          },
        },
        currentStatus: true,
        deletionStatus: true,
        stock: true,
      },
    },
  ]);

  // console.log(JSON.stringify(productData));
  //   res.render("users/productDetail", {
  //     profile: true,
  //     productData,
  //     mainImageas,
  //     cartCount,
  //     id: userId,
  //     allProduct,
  //     exist,
  //   });
  res.json({ productData, mainImageas });
}
const usersProduct = {
  detailProductGet,
  searchProduct,
  filteredbyMinandMaxPrice,
  filteredbyMinandMaxGet,
  sortProducts,
  filterProductwithBrand,
  filteringandSort,
  detailProductForFetch,
};
// Users controlling End
module.exports = {
  manageProducts,
  addProduct,
  getEditProduct,
  postEditProduct,
  deleteProduct,
  recoverProduct,
  filtereProduct,
  searchProductForAdmin,
  usersProduct,
};
