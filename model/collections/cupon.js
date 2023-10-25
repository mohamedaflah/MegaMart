require("../../config/dbconfg");
require("dotenv").config();
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  couponname: {
    type: String,
  },
  couponcode: {
    type: String,
  },
  addedDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  discount: {
    type: Number,
  },
  usageLimit: {
    type: Number,
  },
  users: [
    {
      userId: {
        type: ObjectId,
      },
      count: {
        type: Number,
      },
    },
  ],
});

// module.exports = mongoose.model("Cart", schema);
module.exports = mongoose.model(process.env.COUPON_COLLECTION, schema);
