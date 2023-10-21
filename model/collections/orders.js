require("../../config/dbconfg");
require("dotenv").config();
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  paymentmode: {
    type: String,
    required: true,
  },
  delverydate: {
    type: Date,
  },
  status: {
    type: String,
  },
  totalAmount:{
    type:Number,
  },
  address:{
    type:Object
  },
  products: [
    {
      productId: {
        type: ObjectId,
        required: true,
      },
      qty: {
        type: Number,
      },
    },
  ],
});
module.exports = mongoose.model(process.env.ORDERS_COLLECTION, schema);
