const router = require("express").Router();
router.get("/", (req, res) => {
  res.render("users/index");
});
module.exports = { router };
