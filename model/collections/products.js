const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const imageSchema = new mongoose.Schema({
  mainimage: {
    type: String,
  },
  image1: {
    type: String,
  },
  image2: {
    type: String,
  },
  image3: {
    type: String,
  },
  image4: {
    type: String,
  },
});
const specificationSchema = new mongoose.Schema({
  spec1: {
    type: String,
  },
  spec2: {
    type: String,
  },
  spec3: {
    type: String,
  },
  spec4: {
    type: String,
  },
});
const schema = mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: ObjectId,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  image: [imageSchema],
  brand: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  addedDate: {
    type: Date,
  },
  currentStatus: {
    type: Boolean,
    default: true,
  },
  specification: [specificationSchema],
  deletionStatus: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Products", schema);
