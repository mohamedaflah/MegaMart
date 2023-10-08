require("../config");
require("dotenv").config();
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  addresses: [
    {
      name: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      street: {
        type: String,
      },
      phone: {
        type: String,
      },
      apartmentOrBuilding: {
        type: String,
      },
      email: {
        type: String,
      },
      addedDate: {
        type: Date,
      },
    },
  ],
});

// module.exports = mongoose.model("Orders", schema);
module.exports = mongoose.model(process.env.ADDRESS_COLLECTION, schema);
