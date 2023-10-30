const returnCollection = require("../model/collections/returns");
const productCollection = require("../model/collections/products");
const { ObjectId } = require("mongodb");
async function getAllreturnedProductByUseId(userId) {
  try {
    const returnAr = [];
    const returnedProducts = await returnCollection.find({
      userId: new ObjectId(userId),
    });

    for (const returnedProduct of returnedProducts) {
      const prooductId = returnedProduct.product;
      const orderDate = returnedProduct.orderDate;
      const returnedDate = returnedProduct.returnedDate;
      const product = await productCollection.findById(prooductId);
      const combinedInfo = {
        product,
        orderDate,
        returnedDate,
      };
      console.log("Returned Produc", JSON.stringify(combinedInfo));
      returnAr.push(combinedInfo);
    }
   console.log(JSON.stringify(returnAr)+' after pushi')
    return returnAr;
  } catch (err) {
    console.error("Erro in return helper " + err);
  }
}
module.exports = { getAllreturnedProductByUseId };
