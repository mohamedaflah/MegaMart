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
    const offerExistStatus = await categoryOffer.findOne({
      categoryId: new ObjectId(category),
    });
    if (offerExistStatus) {
      return res.json({ err: "This category have already offer" });
    }
    await new categoryOffer({
      categoryId: new ObjectId(category),
      addedDate: Date.now(),
      offerAmt: offeramount,
      expiryDate: expiryDate,
    }).save();

    const productInThisCategory = await products.find({
      category: new ObjectId(category),
    });

    const productUpdates = productInThisCategory.map(async (product) => {
      if (!product.offer || product.offer.offertype !== "product") {
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
        console.log(
          "Updated product collection for product ID: " + product._id
        );
      }
    });

    await Promise.all(productUpdates);

    res.json({ status: true });
  } catch (err) {
    console.log("Error: " + err);
    res.status(500).json({ err: "Internal server error" });
  }
}

async function getupdateCategoryOffer(req, res) {
  try {
    const categoryOfferId = req.query.offerId;

    const categoryOfferData = await categoryOffer.findById(
      new ObjectId(categoryOfferId)
    );
    console.log(categoryOfferData);
    const category = await CategoryDb.findOne({
      _id: new ObjectId(categoryOfferData.categoryId),
    });

    res.json({ categoryOfferData, category });
  } catch (err) {
    console.log("err in get cat offer" + err);
    res.json({ err: "err is " + err });
  }
}

async function updateCategoryOfferPost(req, res) {
  try {
    console.log(JSON.stringify(req.body));
    let { offerId, categoryoffer, offerexpiry } = req.body;
    console.log(offerId);
    const getCategory = await categoryOffer.findOne({
      _id: new ObjectId(offerId),
    });
    const categoryId = getCategory.categoryId;
    const getProduct = await products.find({
      category: new ObjectId(categoryId),
    });
    getProduct.forEach(async (product) => {
      await products.updateOne(
        { _id: new ObjectId(product._id) },
        {
          $set: {
            "offer.offerprice": categoryoffer,
            "offer.offerexpiryDate": new Date(offerexpiry),
            "offer.offertype": "category",
          },
        }
      );
    });
    await categoryOffer.updateOne(
      { _id: new ObjectId(offerId) },
      {
        $set: {
          offerAmt: categoryoffer,
          expiryDate: new Date(offerexpiry),
          updatedDate: Date.now(),
        },
      }
    );
    res.json({ status: true });
  } catch (err) {
    console.log("error in update cat offer" + err);
    res.json({ err: "Error founded " + err });
  }
}
module.exports = {
  showCategoryOffers,
  addOfferforCategory,
  getupdateCategoryOffer,
  updateCategoryOfferPost,
};
