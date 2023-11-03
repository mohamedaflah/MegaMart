const mongoose = require("mongoose");
require("../../config/dbconfg");
require("dotenv").config();
const { ObjectId } = mongoose.Schema.Types;

const imageSchema = new mongoose.Schema({
  mainimage: {
    type: String,
  },
  image1: {
    type: String,
  },
  image2: {
    type: String,
  },
  image3: {
    type: String,
  },
  image4: {
    type: String,
  },
});
const specificationSchema = new mongoose.Schema({
  spec1: {
    type: String,
  },
  spec2: {
    type: String,
  },
  spec3: {
    type: String,
  },
  spec4: {
    type: String,
  },
});
const offerSchema = new mongoose.Schema({
  offerprice: {
    type: Number,
    // required: true,
  },
  offerexpiryDate: {
    type: Date,
    // required: true,
  },
  offertype: {
    type: String,
  },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: false }
});
const schema = mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: ObjectId,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  image: [imageSchema],
  brand: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  addedDate: {
    type: Date,
  },
  currentStatus: {
    type: Boolean,
    default: true,
  },
  specification: [specificationSchema],
  deletionStatus: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
  },
  offer: offerSchema,
});
schema.index({ "offer.createdAt": 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model("Products", schema);
module.exports = mongoose.model(process.env.PRODUCTS_COLLECTION, schema);
