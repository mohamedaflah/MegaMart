const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
require("dotenv").config();
const router = require("./router/userRoute");
// app.use(require('morgan')())
app.use(passport.initialize());
app.use(require('nocache')())
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/", router.router);
const port = process.env.PORT;
app.listen(port, () =>
  console.log(`Server Currenty Runnig in http://localhost:${port}`)
);
