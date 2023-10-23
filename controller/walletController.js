const { ObjectId } = require("mongodb");
const ordersCollection = require("../model/collections/orders");
const walletCollection = require("../model/collections/wallet");
function addAmountIntoWallet(userId, orderId) {
  return new Promise(async (resolve, reject) => {
    const Amount = await ordersCollection.findOne({
      _id:new ObjectId(orderId),  
      userId: new ObjectId(userId),
    });
    console.log('order in user)000000000000'+Amount);
     await new walletCollection({
      userId: new ObjectId(userId),
      amount: Amount.totalAmount,
      creditAmount: Amount.totalAmount,
      orderId: new ObjectId(orderId),
    }).save();
    resolve()
  });
}
module.exports = { addAmountIntoWallet };
