const UserCollections = require("../model/collections/UserDb");
async function sesionVerification(req, res, next) {
  let userStatus = await UserCollections.find({
    email: req.session.userEmail,
  });

  if (req.session.userAuth && userStatus[0].status) {
    next();
  } else {
    res.redirect("/user/login");
  }
}
module.exports = { sesionVerification };
