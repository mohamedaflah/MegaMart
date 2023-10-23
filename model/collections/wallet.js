require("../../config/dbconfg");
require("dotenv").config();
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  amount: {
    type: Number,
  },
  debitAmount: {
    // Payed
    type: Number,
    default:0
  },
  creditAmount: {
    // Recived
    type: Number,
  },
  orderId: {
    type: ObjectId,
  },
});

module.exports = mongoose.model(process.env.WALLET_COLLECTION, schema);
