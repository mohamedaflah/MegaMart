const couponCollection = require("../model/collections/cupon");
async function showAllCouponInAdmin(req, res) {
  const coupons = await couponCollection.find().sort({ addedDate: -1 });
  res.render("admins/coupon", { coupons });
}
async function addCouponPost(req, res) {
  console.log(req.body);
  let { couponname, couponcode, expiry, discount, usagelimit, minorderAmt } =
    req.body;
  expiry = new Date(expiry);
  let couponExistStatus = await couponCollection.findOne({
    couponcode: couponcode,
  });
  if (couponExistStatus) {
    return res.json({ existerr: "Coupon code already exists!!", exist: true });
  }
  await new couponCollection({
    couponname: couponname,
    couponcode: couponcode,
    addedDate: Date.now(),
    expiryDate: expiry,
    discount: discount,
    usageLimit: usagelimit,
  }).save();
  res.json({ status: true });
}
module.exports = { showAllCouponInAdmin, addCouponPost };
