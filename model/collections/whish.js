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
      }
    }
  ],
});

// module.exports = mongoose.model("Cart", schema);
module.exports = mongoose.model(process.env.WHISHLIST_COLLECTION, schema);