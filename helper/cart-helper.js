const { ObjectId } = require("bson");
const cartCollection = require("../model/collections/cart");
module.exports = {
  getCartCount: async (userId) => {
    const carData = await cartCollection.findOne({
      userId: new ObjectId(userId),
    });
    let cartCount = 0;
    if (carData) {
      cartCount = carData.products.length;
    }
    return cartCount;
  },
  getUserCartData: async (userId) => {
    let userCart = await cartCollection.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "cartData",
        },
      },
      {
        $unwind: "$cartData",
      },
    ]);

    return userCart;
  },
};

// let userCartdata = await cartCollection.aggregate([
//   { $match: { userId: new ObjectId(userId) } },
//   {
//     $unwind: "$products",
//   },
//   {
//     $lookup: {
//       from: "products",
//       localField: "products.productId",
//       foreignField: "_id",
//       as: "cartData",
//     },
//   },
//   {
//     $unwind: "$cartData",
//   },
// ]);
