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

  console.log(JSON.stringify(productOffers));

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
    const existStatus=await productOffer.findOne({productId:new ObjectId(productoffer)})
    if(existStatus){
      return res.json({err:"This product have already offer you can update"})
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
      console.log(JSON.stringify(product));
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
module.exports = { showProductOffer, addProductOffer };
