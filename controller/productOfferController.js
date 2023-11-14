const { ObjectId } = require("bson");
const productOffer = require("../model/collections/productOffer");
const productCollection = require("../model/collections/products");

async function showProductOffer(req, res) {
  const products = await productCollection.find();
  const productOffers = await productOffer.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "offeredproduct",
      },
    },
    {
      $unwind: "$offeredproduct",
    },
  ]);

  res.render("admins/productOffer", { products, productOffers });
}
async function addProductOffer(req, res) {
  try {
    let { productoffer, offeramount, expiry } = req.body;
    if (!productOffer) {
      return res.json({ err: "produt offer not selected" });
    }
    if (!offeramount) {
      return res.json({ err: "offer amount not selected" });
    }
    if (!expiry) {
      return res.json({ err: "expiry not selected" });
    }
    const existStatus = await productOffer.findOne({
      productId: new ObjectId(productoffer),
    });
    if (existStatus) {
      return res.json({
        err: "This product have already offer you can update",
      });
    }
    expiry = new Date(expiry);
    if (expiry <= new Date()) {
      return res.json({ err: "date must be latest" });
    }
    const produOffer = await new productOffer({
      productId: new ObjectId(productoffer),
      addedDate: Date.now(),
      offerAmt: offeramount,
      expiryDate: expiry,
    }).save();
    if (produOffer) {
      const product = await productCollection.findById(
        new ObjectId(productoffer)
      );
      if (product) {
        await productCollection
          .updateOne(
            { _id: new ObjectId(productoffer) },
            {
              $set: {
                "offer.offerprice": offeramount,
                "offer.offerexpiryDate": expiry,
                "offer.offertype": "product",
              },
            }
          )
          .then(() => {
            console.log("updated produt collection");
          });
      }
      res.json({ status: true });
    } else {
      res.json({ status: false, err: "Error in adding produt offer" });
    }
  } catch (err) {
    console.log("error in adding product offer " + err);
    res.json({ status: false });
  }
}

async function getUpdateProductofferDetail(req, res) {
  try {
    const produtOfferId = req.query.offerId;
    const offerData = await productOffer.findOne({
      _id: new ObjectId(produtOfferId),
    });
    const productname = await productCollection.findOne({
      _id: new ObjectId(offerData.productId),
    });
    res.json({ offerData, produtname: productname.productName });
  } catch (err) {
    console.log("error in product offer updation " + err);
    res.json({ err: "error is " + err });
  }
}
async function updateProductofferPost(req, res) {
  try {
    const offerId = req.query.offerId;
    console.log(offerId);
    console.log(JSON.stringify(req.body));
    const offerData = await productOffer.findById(new ObjectId(offerId));
    await productCollection.updateOne(
      { _id: new ObjectId(offerData.productId) },
      {
        $set: {
          "offer.offerprice": req.body.offerAmt,
          "offer.offerexpiryDate": new Date(req.body.expiry),
          "offer.offertype": "product",
        },
      }
    );

    await productOffer.updateOne(
      { _id: new ObjectId(offerId) },
      {
        $set: {
          offerAmt: req.body.offerAmt,
          expiryDate: new Date(req.body.expiry),
          updatedDate: Date.now(),
        },
      }
    );
    res.json({ status: true });
  } catch (err) {
    res.json({ err: "error is " + err });
  }
}
module.exports = {
  showProductOffer,
  addProductOffer,
  getUpdateProductofferDetail,
  updateProductofferPost,
};
