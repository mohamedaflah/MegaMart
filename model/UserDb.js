require("./config");
const mongoose = require("mongoose");
const schema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  profileImage:{
    type:String,
    required:false
  },
  emailAuth:{
    type:Boolean,
    default:false
  },
  joinDate:{
    type:Date,
  }
});

module.exports = mongoose.model("User", schema);
