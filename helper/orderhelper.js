const { ObjectId } = require("mongodb");
const orderCollection = require("../model/collections/orders");
async function getOrderId(userId) {
  const getId = await orderCollection.findOne({ userId: new ObjectId(userId) });
  return getId._id
}
module.exports = { getOrderId };
