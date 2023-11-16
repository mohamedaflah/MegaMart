const adminDb = require("../model/collections/adminDb");
const userDb = require("../model/collections/UserDb");
const orderHelper = require("../helper/orderhelper");
const bcrypt = require("bcrypt");
const fs = require("fs");

const { ObjectId } = require("bson");
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
  // orderHelper.getDeliveredOrders().then((response) => {
  //   console.log(response);
  //   const daySalesReport = response.map((entry) => ({
  //     label: `${entry._id.day}/${entry._id.month}`,
  //     count: entry.count,
  //   }));
  //   const daySalesReportCount=daySalesReport.map(count=>count.count)

  //   const monthSalesData = response.map((entry) => ({
  //     label:`${entry._id.month}/${entry._id.year}`,
  //     count:entry.count
  //   }));

  //   console.log("Day Sales Data",daySalesReport);
  //   console.log("Month Sales Data",monthSalesData);
  // });
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
  res.json({ usersData });
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
