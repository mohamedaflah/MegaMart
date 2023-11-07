const cron = require("node-cron");
const couponCollection = require("../model/collections/cupon");
const products = require("../model/collections/products");
const categoryOffer = require("../model/collections/categoryOffer");
const { ObjectId } = require("bson");

async function updateCouponStatus() {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("called crondlsfak");
      const currentDate = new Date();

      const expiredCoupons = await couponCollection.updateMany(
        { status: "active", statusChangeDate: { $lte: currentDate } },
        { $set: { status: "expired" } }
      );
      console.log(`Updated coupon expired` + JSON.stringify(expiredCoupons));
    } catch (err) {
      console.log("error in updating coupon" + err);
      res.status(404)
    }
  });
}
async function updateProductOffer() {
  cron.schedule("*/1 * * * *", async () => {
    // * * * * * *
    // console.log('running');
    const currentDate = new Date();
    const productOffer=await products.find({"offer.offertype":"product"})
    productOffer.forEach(async(product)=>{
      if(product.offer.offerexpiryDate<=new Date()){
        let categoryOffeExist=await categoryOffer.findOne({categoryId:product.category})
        if(categoryOffeExist){
          await products.updateOne({_id:new ObjectId(product._id)},{$set:{
            "offer.offerprice":categoryOffeExist.offerAmt,
            "offer.offerexpiryDate":categoryOffeExist.expiryDate,
            "offer.offertype":"category"
          }})
        }
      }
    })
    const result = await products.updateMany(
      {
        "offer.offerexpiryDate": { $lte: currentDate },
      },
      {
        $unset: { offer: 1 },
      }
    );
  });
  
}
module.exports = { updateCouponStatus,updateProductOffer };
