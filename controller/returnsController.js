const { ObjectId } = require("mongodb");
require("dotenv").config();
const productCollection = require("../model/collections/products");
const returnCollection = require("../model/collections/returns");
const orderCollection = require("../model/collections/orders");
const walletCollection = require("../model/collections/wallet");
const { getCartCount } = require("../helper/cart-helper");
const { getWhishLIstCount } = require("../helper/whish-helper");
async function getReturnedProduct(req, res) {
  const producId = req.query.id;
  const product = await productCollection.findOne({
    _id: new ObjectId(producId),
  });
  if (!product) {
    res.json({ err: "Product not found" });
  }
  res.json({ product });
}
async function returnProduct(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ err: "No file selected" });
    }

    const productId = req.params.productId;
    const userId = req.params.userId;
    const orderId = req.query.orderId;
    console.log(productId + "  this is the produt id ");
    console.log(userId + "  this is the user id ");
    console.log(orderId + "  this is the order -- id ");
    await orderCollection
      .updateOne(
        { _id: new ObjectId(orderId) },
        { $pull: { products: { productId: new ObjectId(productId) } } }
      )
      .then(() => {
        console.log("order collection inserted");
      });
    await productCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { stock: 1 } }
    );
    const productPrice=await productCollection.findOne({_id:new ObjectId(productId)})
    await walletCollection.updateOne({userId:new ObjectId(userId)},{$inc:{amount:productPrice.price}})
    const filename = `/profile-images/${req.file.filename}`;

    await new returnCollection({
      userId: new ObjectId(userId),
      product: new ObjectId(productId),
      image: filename,
      reason: req.body.reason,
      returnedDate: Date.now(),
    }).save();

    res.json({ status: true });
  } catch (err) {
    res.json({ err: err });
    console.log("Error in returnProduct: " + err);
  }
}
async function seeAllreturns(req, res) {
  console.log("api called");
  const userId = req.params.userId;
  const cartCount = await getCartCount(userId);
  const whishCount = await getWhishLIstCount(userId);
  const returns = await returnCollection.aggregate([
    {
      $lookup: {
        from: "products", // Name of the product collection
        localField: "productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: "$productInfo",
    },
    {
      $project: {
        _id: 1, // Include the return document's _id
        productId: 1, // Include the productId
        reason: 1, // Include other fields from the Return collection
        image: 1,
        returnedDate: 1,
        productName: "$productInfo.name", // Include fields from the Product collection
        // Add more fields from the Product collection as needed
      },
    },
    // Add further aggregation stages as needed
  ]);

  let allReturnData = await orderCollection.find();
  let obj = [];
  for (let i = 0; i < allReturnData.length; i++) {
    // if()
    let productData = await productCollection.findOne({
      _id: new ObjectId(allReturnData[i]),
    });
    if (productData) {
      obj.push(productData);
    }
  }
  res.json({ obj });
  // res.render("users/showReturns", {
  //   profile: true,
  //   id: userId,
  //   cartCount,
  //   whishCount,
  // });
}
module.exports = { getReturnedProduct, returnProduct, seeAllreturns };
