require("../../config/dbconfg");
require("dotenv").config();
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  joinedUser: [
    {
      type: ObjectId,
    },
  ],
  offeramount: {
    type: Number,
  },
  updatedDate: {
    type: Date,
  },
  invitedUser: [
    {
      type: ObjectId,
    },
  ],
});

// module.exports = mongoose.model("Cart", schema);
module.exports = mongoose.model(process.env.REFERAL_COLLECTION, schema);
