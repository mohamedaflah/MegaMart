require("../../config/dbconfg");
require("dotenv").config();
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  otpnum: {
    type: String,
    required: true,
  },
  useremail: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    expires: '1m',
    default: Date.now,
  }
});

// module.exports = mongoose.model("User", schema);
module.exports = mongoose.model(process.env.OTP_COLLECTION, schema);
