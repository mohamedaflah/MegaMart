const { ObjectId } = require("bson");
const CategoryDb = require("../model/collections/CategoryDb");
const categoryOffer = require("../model/collections/categoryOffer");

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
  res.render("admins/categoryoffer", { categories: cateogories,currentOffer });
}
async function addOfferforCategory(req, res) {
  try {
    console.log(req.body);
    // category: offerCategorySelect,
    // offeramount: offeramount,
    // expiry: expiry,
    let { category, offeramount, expiry } = req.body;
    expiry = new Date(expiry);
    if (offeramount <= 0) {
      return res.json({ err: "offer amount only positive values" });
    }
    if (offeramount >= 1000) {
      return res.json({ err: "Offer price must be lesser 1000" });
    }
    if (expiry <= new Date()) {
      return res.json({ err: "Must be select latest date" });
    }
    let categoryId = await CategoryDb.findOne({ categoryname: category });
    categoryId = categoryId._id;
    await new categoryOffer({
      categoryId: new ObjectId(categoryId),
      addedDate: Date.now(),
      offerAmt: offeramount,
      expiryDate: expiry,
    }).save();
    res.json({ status: true });
  } catch (err) {
    console.log("err ()()" + err);
    res.status(500).json({ err: "err" });
  }
}
module.exports = { showCategoryOffers, addOfferforCategory };
