require("../../config/dbconfg");
require('dotenv').config()
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  products: [
    {
      productId: {
        type: ObjectId,
      },
      reason:{
        type:String,
      },
      image:{
        type:String,
      }
    },
  ],
});

// module.exports = mongoose.model("Cart", schema);
module.exports = mongoose.model(process.env.CART_COLLECTION, schema);