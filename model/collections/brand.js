require("../../config/dbconfg");
require("dotenv").config();

const mongoose = require("mongoose");
const schema = mongoose.Schema({
  brandname: {
    type: String,
    required: true,
  },
  brandlogo: {
    type: String,
  },
  brandstatus: {
    type: Boolean,
    default: true,
  },
  addedDate: {
    type: Date,
    required: true,
  },
  sales: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
});

module.exports=mongoose.model(process.env.BRAND_COLLECTION,schema);