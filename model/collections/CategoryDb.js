require("../config");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  categoryname: {
    type: String,
    required: true,
    unique: true,
  },
  sales: {
    type: Number,
  },
  stock: {
    type: Number,
  },
  addedDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Category", schema);
