const express = require("express");
const app = express();
require("dotenv").config();
const router = require("./router/userRoute");
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", router.router);
const port = process.env.PORT;

app.listen(port, () =>
  console.log(`Server Currenty Runnig in http://localhost:${port}`)
);
