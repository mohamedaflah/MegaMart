require("../../config/dbconfg");
require("dotenv").config();
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  couponname: {
    type: String,
    unique:true,
  },
  couponcode: {
    type: String,
    unique: true,
  },
  addedDate: {
    type: Date,
  },
  statusChangeDate: {
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
  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active",
  },
  minOrderAmt:{
    type:Number
  }
});

module.exports = mongoose.model(process.env.COUPON_COLLECTION, schema);
