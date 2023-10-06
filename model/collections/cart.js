require("../config");
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
      qty: {
        type: Number,
      },
    },
  ],
});

module.exports = mongoose.model("Cart", schema);