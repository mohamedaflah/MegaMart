require("dotenv").config();
const { ObjectId } = require("mongodb");
const userCollection = require("../model/collections/UserDb");
const KEY_ID = process.env.RAZORPAY_KEYID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
    key_id: KEY_ID, // Use 'key_id' instead of 'KEY_ID'
    key_secret: KEY_SECRET
});
function generateRazorpay(orderId, totalAmount, userId) {
  return new Promise(async (resolve, reject) => {
    const username = await userCollection.findOne({
      _id: new ObjectId(userId),
    });
    // http://localhost:5001/users/product/checkout/payment/success/${userId}
    const amountInPaise=totalAmount*100
    let options = {
      amount: amountInPaise, // Amount in paise (multiply by 100 to convert to currency)
      currency: "INR",
      receipt: orderId,
      payment_capture: 1,
    };
    razorpay.orders.create(options,(err,order)=>{
        if(err){
            console.log('error in razorpay generating '+JSON.stringify(err));
            reject(err)
        }else{
            resolve(order)
        }
    })
  });
}
module.exports = { generateRazorpay };
