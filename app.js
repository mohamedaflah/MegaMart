const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
require("dotenv").config();
const cors=require('cors')
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(require('morgan')())
app.use(
  session({
    secret: process.env.SECRET, // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge:  3 * 24 * 60 * 60 * 1000, // Session expiration time in milliseconds (1 hour in this example)
    },
  })
); 
const router = require("./router/userRoute");
const adminRoute = require("./router/adminRoute");
app.use(passport.initialize());
app.use(require("nocache")());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/", router.router);
app.use("/admin", adminRoute.router);
// Define the catch-all route
app.use((req, res) => {
  res.status(404).render('404',{profile:false,id:false,cartCount:0}); // Render the custom 404 error page
});
const port = process.env.PORT;
app.listen(port, () =>
  console.log(`Server Currenty Runnig in http://localhost:${port}`)
);
