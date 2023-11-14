const { ObjectId } = require("mongodb");
require("dotenv").config();
const productCollection = require("../model/collections/products");
const returnCollection = require("../model/collections/returns");
const orderCollection = require("../model/collections/orders");
const walletCollection = require("../model/collections/wallet");
const { getCartCount } = require("../helper/cart-helper");
const { getWhishLIstCount } = require("../helper/whish-helper");
const { getAllreturnedProductByUseId } = require("../helper/returnHelper");
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
    const fianlprice = req.query.finalprice;
    const productData = await orderCollection.findOne(
      {
        _id: new ObjectId(orderId),
        userId: new ObjectId(userId),
        "products.productId": new ObjectId(productId),
      },
      {
        "products.$": 1,
      }
    );

    await productCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { stock: 1 } }
    );
    await orderCollection
      .updateOne(
        { _id: new ObjectId(orderId) },
        { $pull: { products: { productId: new ObjectId(productId) } } }
      )
      .then(() => {
        console.log("order collection updated");
      });
    const orderData = await orderCollection.findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    });
    if (orderData.products.length <= 0) {
      await orderCollection.updateOne(
        { _id: new ObjectId(orderId), userId: new ObjectId(userId) },
        { $set: { isEmpty: true } }
      );
    }
    const productPrice = await productCollection.findOne({
      _id: new ObjectId(productId),
    });
    let actualPrice;
    if (productPrice.discount) {
      actualPrice = productPrice.discount;
    } else {
      actualPrice = productPrice.price;
    }
    const walletExist = await walletCollection.findOne({
      userId: new ObjectId(userId),
    });
    if (walletExist) {
      await walletCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $inc: { amount: fianlprice } }
      );
    } else {
      await new walletCollection({
        userId:new ObjectId(userId),
        amount:fianlprice,
        orderId:new ObjectId(orderId)
      }).save()
    }
    const filename = `/return-images/${req.file.filename}`;

    await new returnCollection({
      userId: new ObjectId(userId),
      product: new ObjectId(productId),
      image: filename,
      reason: req.body.reason,
      finalPrice: Number(fianlprice),
      returnedDate: Date.now(),
      orderDate: orderData.delverydate,
    }).save();

    res.json({ status: true });
  } catch (err) {
    res.json({ err: err });
    console.log("Error in returnProduct: " + err);
  }
}
async function seeAllreturns(req, res) {
  const userId = req.params.userId;
  const cartCount = await getCartCount(userId);
  const whishCount = await getWhishLIstCount(userId);

  const allUserreturns = await getAllreturnedProductByUseId(userId);
  console.log("after calling " + JSON.stringify(allUserreturns));
  res.render("users/returns", {
    profile: true,
    id: userId,
    cartCount,
    whishCount,
    allUserreturns,
  });
}

// for admin start

function showAllreturns(req, res) {
  res.render("admins/returns");
}

// admin side end
const admin = { showAllreturns };
module.exports = { getReturnedProduct, returnProduct, seeAllreturns, admin };
