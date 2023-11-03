const { ObjectId } = require("bson");
const CategoryDb = require("../model/collections/CategoryDb");
const categoryOffer = require("../model/collections/categoryOffer");
const products = require("../model/collections/products");

async function showCategoryOffers(req, res) {
  let cateogories = await CategoryDb.find();
  let offeredCategories = categoryOffer.find();
  let currentOffer = await categoryOffer.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "joined",
      },
    },
    {
      $unwind: "$joined",
    },
  ]);
  // console.log(JSON.stringify(joined));
  res.render("admins/categoryoffer", { categories: cateogories, currentOffer });
}
async function addOfferforCategory(req, res) {
  try {
    console.log(req.body);
    const { category, offeramount, expiry } = req.body;
    const expiryDate = new Date(expiry);

    if (offeramount <= 0) {
      return res.json({ err: "Offer amount must be a positive value" });
    }

    if (offeramount >= 1000) {
      return res.json({ err: "Offer price must be less than 1000" });
    }
    
    if (expiryDate <= new Date()) {
      return res.json({ err: "Expiry date must be in the future" });
    }
    const offerExistStatus=await categoryOffer.findOne({categoryId:new ObjectId(category)})
    if(offerExistStatus){
      return res.json({err:"This category have already offer"})
    }
    await new categoryOffer({
      categoryId: new ObjectId(category),
      addedDate: Date.now(),
      offerAmt: offeramount,
      expiryDate: expiryDate,
    }).save();

    const productInThisCategory = await products.find({ category: new ObjectId(category) });

    const productUpdates = productInThisCategory.map(async (product) => {
      if (!product.offer || (product.offer.offertype !== "product")) {
        await products.updateOne(
          { _id: new ObjectId(product._id) },
          {
            $set: {
              "offer.offerprice": offeramount,
              "offer.offerexpiryDate": expiryDate,
              "offer.offertype": "category",
            },
          }
        );
        console.log("Updated product collection for product ID: " + product._id);
      }
    });

    await Promise.all(productUpdates);

    res.json({ status: true });
  } catch (err) {
    console.log("Error: " + err);
    res.status(500).json({ err: "Internal server error" });
  }
}

module.exports = { showCategoryOffers, addOfferforCategory };
