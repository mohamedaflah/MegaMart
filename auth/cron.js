const cron = require("node-cron");
const couponCollection = require("../model/collections/cupon");
async function updateCouponStatus() {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log('called crondlsfak');
      const currentDate = new Date();

      const expiredCoupons = await couponCollection.updateMany(
        { status: "active", statusChangeDate: { $lte: currentDate } },
        { $set: { status: "expired" } }
      );
      console.log(`Updated coupon expired`+JSON.stringify(expiredCoupons));
    } catch (err) {
      console.log("error in updating coupon" + err);
    }
  });
}
module.exports={updateCouponStatus}