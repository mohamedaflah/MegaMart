const adminDb = require("../model/collections/adminDb");
const userDb = require("../model/collections/UserDb");
const bcrypt = require("bcrypt");
const fs = require("fs");

const { ObjectId } = require("bson");
// const CategoryDb=require('../model/collections/CategoryDb')
// const formidable = require("formidable");
async function adminHomeShowuser(req, res) {
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
    // console.log(JSON.stringify(req.body)+'admin ')
    // req.body.password=bcrypt.hashSync(req.body.password,10)
    // await new adminDb({
    //   email:req.body.email_or_Phone,
    //   password:req.body.password,
    //   joinDate:Date.now()
    // }).save()
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
    });
  req.session.userAuth = false;
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

function adminLogout(req, res) {
  req.session.adminAuth = false;
  res.redirect("/user/login");
}
function overView(req, res) {
  res.render("admins/overview");
}



async function filterUser(req, res) {
  const filterOrder = req.params.filterorder;
  var usersData;
  if (filterOrder == "blocked") {
    usersData = await userDb.find({ status: false });
  } else if (filterOrder == "unblocked") {
    usersData = await userDb.find({ status: true });
  } else if (filterOrder == "latest") {
    usersData = await userDb.find().sort({ joinDate: -1 });
  } else if (filterOrder == "oldest") {
    usersData = await userDb.find().sort({ joinDate: 1 });
  }
  res.render("admins/filteruser", { usersData });
}
async function serchUser(req, res) {
  const searchData = req.body.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const usersData = await userDb.find({
    name: { $regex: "^" + searchData, $options: "i" },
  });
  // res.render("admins/admin", { usersData });
  res.json({usersData})
  // const productData = await productsCollection.find({
  //   productName: { $regex: "^" + req.body.searchdata, $options: "i" },
  // });
}




module.exports = {
  adminHomeShowuser,
  adminLoginGet,
  adminLoginPost,
  adminErrClose,
  blockUser,
  unBlockUser,
  adminLogout,
  overView,
  filterUser,
  serchUser,
};
