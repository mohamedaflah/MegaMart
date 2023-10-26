require("../../config/dbconfg");
require('dotenv').config()
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  getDiscount:{
    type:Number,
    default:0
  },
  products: [
    {
      productId: {
        type: ObjectId,
      },
      qty: {
        type: Number,
      },
    },
  ],
});

// module.exports = mongoose.model("Cart", schema);
module.exports = mongoose.model(process.env.CART_COLLECTION, schema);