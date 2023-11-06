const { ObjectId } = require("mongodb");
const ordersCollection = require("../model/collections/orders");
const walletCollection = require("../model/collections/wallet");
function addAmountIntoWallet(userId, orderId) {
  return new Promise(async (resolve, reject) => {
    const Amount = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    });
    console.log("order in user)000000000000" + Amount);
    const walletExist = await walletCollection.findOne({
      userId: new ObjectId(userId),
    });
    if (!walletExist) {
      await new walletCollection({
        userId: new ObjectId(userId),
        amount: Amount.totalAmount,
        creditAmount: Amount.totalAmount,
        orderId: new ObjectId(orderId),
      }).save();
    } else {
      await walletCollection.updateOne(
        {
          userId: new ObjectId(userId),
        },
        {
          $set: {
            orderId: new ObjectId(orderId),
          },
        }
      );
      await walletCollection.updateOne(
        { userId: new ObjectId(userId) },
        {
          $inc: {
            amount: Amount.totalAmount,
          },
        }
      );
    }
    resolve();
  });
}
module.exports = { addAmountIntoWallet };
