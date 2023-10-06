const userCollection = require("../model/collections/UserDb");
const checkingUserStatus = async (req, res, next) => {
  try {
    const userEmail = req.session.userEmail;
    let getUserData = await userCollection.find({ email: userEmail });
    console.log(getUserData);
    if (getUserData[0].status) {
      next();
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log("status checking error " + err);
  }
};
module.exports = { checkingUserStatus };
