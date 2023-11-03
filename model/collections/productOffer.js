require("../../config/dbconfg");
require("dotenv").config();
// const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  addedDate: {
    type: Date,
    required: true,
  },
  offerAmt: {
    type: Number,
  },
  updatedDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
});

// Create a TTL index on the `expiryDate` field
schema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 }); // 0 means documents will be deleted immediately after `expiryDate`

module.exports = mongoose.model(process.env.PRODUCT_OFFER, schema);
