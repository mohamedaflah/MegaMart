const adminDb = require("../model/collections/adminDb");
const userDb = require("../model/collections/UserDb");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
async function adminHomeShowuser(req, res) {
  // let hashedPass = bcrypt.hashSync("admin786", 10);
  // let data = await new adminDb({
  //   email: "admin@gmail.com",
  //   password: hashedPass,
  //   joinDate: Date.now(),
  // })
  //   .save()
  //   .then(() => {
  //     console.log("inserted admin");
  //   });
  let usersData = await userDb.find().sort({ joinDate: -1 });
  res.render("admins/admin", { usersData });
}
async function adminLoginGet(req, res) {
  if (req.session.adminAuth) {
    res.redirect("/admin/");
  } else {
    res.render("admins/adlog", { err: false });
  }
}
async function adminLoginPost(req, res) {
  try {
    let getData = await adminDb.find({ email: req.body.email_or_Phone });

    if (getData.length > 0) {
      const passCompare = bcrypt.compareSync(
        req.body.password,
        getData[0].password
      );

      if (getData[0].email === req.body.email_or_Phone && passCompare) {
        req.session.adminAuth = true;
        res.redirect("/admin/");
      } else {
        res.render("admins/adlog", { err: "Login Failed" });
      }
    } else {
      res.render("admins/adlog", { err: "Login Failed" });
    }
  } catch (error) {
    console.error("Error in adminLoginPost:", error);
    res.render("admins/adlog", { err: "Login Failed" });
  }
}
function adminErrClose(req, res) {
  res.redirect("/admin/login");
}
async function blockUser(req, res) {
  let userId = req.params.id;
  await userDb
    .updateOne({ _id: new ObjectId(userId) }, { $set: { status: false } })
    .then(() => {
      console.log("user blocked");
      req.session.userAuth = false;
    });
  res.redirect("/admin/");
}

async function unBlockUser(req, res) {
  let userId = req.params.id;
  await userDb
    .updateOne({ _id: new ObjectId(userId) }, { $set: { status: true } })
    .then(() => {
      console.log("user (unblocked)");
    });
  res.redirect("/admin/");
}
function manageProducts(req, res) {
  res.render("admins/products");
}
function adminLogout(req, res) {
  req.session.adminAuth = false;
  res.redirect("/admin/login");
}
function overView(req, res) {
  res.render("admins/overview");
}
function ManageCategory(req, res) {
  res.render("admins/category");
}
function addCategory() {
    
}
module.exports = {
  adminHomeShowuser,
  adminLoginGet,
  adminLoginPost,
  adminErrClose,
  blockUser,
  unBlockUser,
  manageProducts,
  adminLogout,
  overView,
  ManageCategory,
  addCategory,
};
