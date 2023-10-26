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
  getTotalAmount: async (userId) => {
    try {
      const userCart = await cartCollection.aggregate([
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
      
      if (!userCart || userCart.length === 0) {
        // Handle the case where the userCart is empty or null.
        return 0;
      }
  
      const getDiscount = userCart[0].getDiscount;
    let totalAmount = 0;

    userCart.forEach((cardata) => {
      if (cardata.cartData.discount) {
        totalAmount = totalAmount + cardata.cartData.discount * cardata.products.qty;
      } else {
        totalAmount = totalAmount + cardata.cartData.price * cardata.products.qty;
      }
    });

    console.log(Number(totalAmount-getDiscount)+'    sd havi');
    return Number(totalAmount - getDiscount);
    } catch (error) {
      console.error("Error in getTotalAmount:", error);
      return 0; // Handle the error gracefully, returning 0 or any other appropriate value.
    }
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
