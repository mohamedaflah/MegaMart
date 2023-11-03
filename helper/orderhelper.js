const { ObjectId } = require("mongodb");
const orderCollection = require("../model/collections/orders");
const productCProllection=require("../model/collections/products")
async function getOrderId(userId) {
  const getId = await orderCollection.findOne({ userId: new ObjectId(userId) });
  return getId._id
}
async function getOrderProductByOrderId(orderId, productId) {
  try {
    // Find the order by its _id
    const order = await orderCollection.findOne({ _id:new ObjectId(orderId) });

    console.log(order+' this is the order ')
    // Find the product within the order by its _id
    const productInOrder =await order.products.find(product => product.productId.toString() === productId.toString());
    console.log(productInOrder+'       product inorder')
    if (productInOrder) {
      return productInOrder;
    } else {
      return 0; // Product not found in order
    }
  } catch (error) {
    console.error("Error retrieving order product:", error);
    return 0; // Handle errors appropriately
  }
}
module.exports = { getOrderId,getOrderProductByOrderId };
