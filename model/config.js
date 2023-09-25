require("dotenv").config();
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Succefully Connected Mongodb");
  })
  .catch((err) => {
    console.log("Mongodb Connection Failed  Your Error is : " + err);
  });
