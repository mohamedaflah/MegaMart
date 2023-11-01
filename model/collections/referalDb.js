require("../../config/dbconfg");
require("dotenv").config();
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  offeramount: {
    type: Number,
  },
  updatedDate: {
    type: Date,
  },
  status: {
    type: Boolean,
  },
  joinedUser: [
    {userId:{
      type: ObjectId,
    }},
  ],
  invitedUser: [
    {
      userId: {
        type: ObjectId,
      },
    },
  ],
});

// module.exports = mongoose.model("Cart", schema);
module.exports = mongoose.model(process.env.REFERAL_COLLECTION, schema);
