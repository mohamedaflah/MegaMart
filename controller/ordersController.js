
const UserCollection = require("../model/collections/UserDb");
const productsCollection = require("../model/collections/products");
const cartCollection = require("../model/collections/cart");
const orderCollection = require("../model/collections/orders");
const addressCollection = require("../model/collections/address");
const { ObjectId } = require("bson");
const {
  getCartCount,
  getUserCartData,
  getTotalAmount,
} = require("../helper/cart-helper");
// Listing Orders is Admin Side
async function listAllOrders(req, res) {
  // const orderDetail = await userDb.aggregate([
  //   {
  //     $lookup: {
  //       from: "orders",
  //       localField: "_id",
  //       foreignField: "userId",
  //       as: "userOrders",
  //     },
  //   },
  //   {
  //     $unwind: "$userOrders",
  //   },
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "userOrders.products.productId",
  //       foreignField: "_id",
  //       as: "userOrders.products.productDetails",
  //     },
  //   },
  //   {
  //     $unwind: "$userOrders.products.productDetails",
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       userOrders: {
  //         _id: "$userOrders._id",
  //         userId: "$userOrders.userId",
  //         paymentmode: "$userOrders.paymentmode",
  //         delverydate: "$userOrders.delverydate",
  //         status: "$userOrders.status",
  //         address: "$userOrders.address",
  //         products: "$userOrders.products.productDetails", // Reshape here
  //       },

  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$_id",
  //       userAddress: { $first: "$userAddress" },
  //       userOrders: { $push: "$userOrders" },
  //     },
  //   },
  // ]);

  // const orderDetail=await orderCollection.aggregate([
  //   {
  //     $lookup: {
  //       from: 'users', // Use the name of your Users collection here
  //       localField: 'userId',
  //       foreignField: '_id',
  //       as: 'user',
  //     },
  //   },
  //   {
  //     $unwind: '$user',
  //   },
  //   {
  //     $unwind: '$products',
  //   },
  //   {
  //     $lookup: {
  //       from: 'products', // Use the name of your Products collection here
  //       localField: 'products.productId',
  //       foreignField: '_id',
  //       as: 'product',
  //     },
  //   },
  //   {
  //     $unwind: '$product',
  //   },
  //   {
  //     $group: {
  //       _id: '$_id',
  //       userId: { $first: '$userId' },
  //       paymentmode: { $first: '$paymentmode' },
  //       delverydate: { $first: '$delverydate' },
  //       status: { $first: '$status' },
  //       address: { $first: '$address' },
  //       user: { $first: '$user' },
  //       products: {
  //         $push: {
  //           productId: '$product._id',
  //           qty: '$products.qty',
  //           productName: '$product.productName', // Add other product fields as needed
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       userId: 1,
  //       paymentmode: 1,
  //       delverydate: 1,
  //       status: 1,
  //       address: 1,
  //       'user._id': 1,
  //       'user.name': 1, // Add other user fields as needed
  //       products: 1,
  //     },
  //   },
  // ])

  const orderDetail = await orderCollection.aggregate([
    {
      $lookup: {
        from: "users", // Use the name of your Users collection here
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products", // Use the name of your Products collection here
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        paymentmode: 1,
        delverydate: 1,
        status: 1,
        address: 1,
        user: 1, // This will contain all user details
        products: {
          productId: "$product._id",
          qty: "$products.qty",
          productDetails: "$product", // This will contain all product details
        },
      },
    },
    {
      $sort: {
        delverydate: -1, // Sort by delivery date in descending order (latest first)
      },
    },
  ]);
  console.log(JSON.stringify(orderDetail) + " orders ");
  res.render("admins/listOrders", { orderDetail });
}

// Show Order Detail Page in Admin Side
async function getOrderDetails(req, res) {
  const orderId = req.params.orderId;
  const userId = req.params.userId;
  const orderDetail = await orderCollection.aggregate([
    {
      $match: {
        _id: new ObjectId(orderId), // Assuming ObjectId is used for _id field
        userId: new ObjectId(userId), // Assuming ObjectId is used for userId
      },
    },
    {
      $lookup: {
        from: "users", // Use the name of your Users collection here
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products", // Use the name of your Products collection here
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        paymentmode: 1,
        delverydate: 1,
        status: 1,
        address: 1,
        user: 1, // This will contain all user details
        products: {
          productId: "$product._id",
          qty: "$products.qty",
          productDetails: "$product", // This will contain all product details
        },
      },
    },
  ]);
  console.log(JSON.stringify(orderDetail) + " specific order");
  var totalAmount = 0;
  orderDetail.forEach((order) => {
    const product = order.products.productDetails;
    const quantity = order.products.qty;
    console.log(
      "produt  " +
        JSON.stringify(product.price) +
        "  pr  " +
        JSON.stringify(quantity) +
        "     qty"
    );
    var price;
    if (product.discount) {
      price = product.discount;
    } else {
      price = product.price;
    }
    console.log(price + " proc");

    // Calculate the subtotal for this product
    const subtotal = quantity * price;
    console.log(subtotal + "  sub total");
    // Add the subtotal to the total amount
    totalAmount = totalAmount + subtotal;
  });
  console.log("total Amt       " + totalAmount);
  res.render("admins/orderDetail", { orderDetail, totalAmount });
}

// Changing Order Status for Admin side
async function changeOrderStatus(req, res) {
  const ordeId = req.params.orderId;
  const userId = req.params.userId;
  await orderCollection.updateOne(
    { _id: new ObjectId(ordeId), userId: new ObjectId(userId) },
    {
      $set: {
        status: req.body.status,
      },
    }
  );
  console.log(ordeId + "     r");
  console.log(userId + "id");
  res.redirect(
    `/admin/products/orders/list-orders/orders-detail/${ordeId}/${userId}/`
  );
}

// Filter Orders for Admin
async function filterOrders(req, res) {
  const filterorder = req.params.filterorder;
  let orderDetail;
  if (filterorder == "bylatest") {
    orderDetail = await orderCollection.aggregate([
      {
        $lookup: {
          from: "users", // Use the name of your Users collection here
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products", // Use the name of your Products collection here
          localField: "products.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          paymentmode: 1,
          delverydate: 1,
          status: 1,
          address: 1,
          user: 1, // This will contain all user details
          products: {
            productId: "$product._id",
            qty: "$products.qty",
            productDetails: "$product", // This will contain all product details
          },
        },
      },
      {
        $sort: {
          delverydate: -1, // Sort by delivery date in descending order (latest first)
        },
      },
    ]);
  } else if (filterorder == "byoldest") {
    orderDetail = await orderCollection.aggregate([
      {
        $lookup: {
          from: "users", // Use the name of your Users collection here
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products", // Use the name of your Products collection here
          localField: "products.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          paymentmode: 1,
          delverydate: 1,
          status: 1,
          address: 1,
          user: 1, // This will contain all user details
          products: {
            productId: "$product._id",
            qty: "$products.qty",
            productDetails: "$product", // This will contain all product details
          },
        },
      },
      {
        $sort: {
          delverydate: 1, // Sort by delivery date in descending order (latest first)
        },
      },
    ]);
  }
  res.render("admins/listOrders", { orderDetail });
}




// For users  Start */

//User Checkout Section
async function checkOut(req, res) {
    const userId = req.params.userId;
    let useraddressIsExist = await addressCollection.findOne({
      userId: new ObjectId(userId),
    });
    console.log(useraddressIsExist + "        ext");
    if (!useraddressIsExist) {
      res.redirect(`/users/product/checkout/address/${userId}`);
    } else {
      res.redirect(`/users/product/cart/checkout/place-order/${userId}`);
    }
  }

  // user Place order Get page
  async function placeOrder(req, res) {
    const userId = req.params.userId;
    const cartCount = await getCartCount(userId);
    const addressData = await addressCollection.findOne({
      userId: new ObjectId(userId),
    });
    const cartData = await getUserCartData(userId);
    const totalAmount = await getTotalAmount(userId);
    // console.log(JSON.stringify(addressData) + "address data");
    console.log(JSON.stringify(cartData));
    res.render("users/place-order", {
      profile: true,
      cartCount,
      id: userId,
      addressData,
      cartData,
      totalAmount,
    });
  }
  

  // user place order Post Section
  async function placeOrderPost(req, res) {
    try {
      const userId = req.params.userId;
      console.log(JSON.stringify(req.body) + "body of request");
      const addressdata = await addressCollection.findOne({
        userId: new ObjectId(userId),
      });
      // addressdata = addressdata.addresses[Number(req.body.address)];
      const userCartdata = await getUserCartData(userId);
      const products = userCartdata.map((cartItem) => ({
        productId: cartItem.products.productId,
        qty: cartItem.products.qty,
      }));
      await new orderCollection({
        userId: new ObjectId(userId),
        paymentmode: req.body.payment_method,
        delverydate: Date.now(),
        status: "Pending",
        address: addressdata.addresses[Number(req.body.address)],
        products: products,
      }).save();
      // qty=[]
      // console.log(qty + "(((((((9");
      await cartCollection.deleteOne({ userId: new ObjectId(userId) });
      products.forEach(async (product) => {
        const currentData = await productsCollection.findOne({
          _id: new ObjectId(product.productId),
        });
        if (currentData && currentData.stock) {
          const minusdata = currentData.stock - product.qty;
          if (minusdata >= 0) {
            await productsCollection.updateOne(
              { _id: new ObjectId(product.productId) },
              {
                $inc: {
                  stock: -product.qty,
                },
              }
            );
          }
        }
      });
      res.redirect(`/users/product/checkout/payment/success/${userId}`);
    } catch (err) {
      console.log("error in checkout place order post" + err);
    }
  }
  async function userOrders(req, res) {
    const userId = req.params.userId;
    const cartCount = await getCartCount(userId);
    const userDetail = await UserCollection.findOne({
      _id: new ObjectId(userId),
    });
    const orderDetail = await UserCollection.aggregate([
      {
        $match: { _id: new ObjectId(userId) },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "userOrders",
        },
      },
      {
        $unwind: "$userOrders",
      },
      {
        $lookup: {
          from: "products",
          localField: "userOrders.products.productId",
          foreignField: "_id",
          as: "userOrders.products.productDetails",
        },
      },
      {
        $unwind: "$userOrders.products.productDetails",
      },
      {
        $project: {
          _id: 1,
          userOrders: {
            _id: "$userOrders._id",
            userId: "$userOrders.userId",
            paymentmode: "$userOrders.paymentmode",
            delverydate: "$userOrders.delverydate",
            status: "$userOrders.status",
            address: "$userOrders.address",
            products: "$userOrders.products.productDetails", // Reshape here
            __v: "$userOrders.__v",
          },
          __v: 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          userAddress: { $first: "$userAddress" },
          userOrders: { $push: "$userOrders" },
        },
      },
    ]);
  
    let orderqtys = await orderCollection.find({
      userId: new ObjectId(userId),
    });
    console.log(JSON.stringify(orderqtys) + "   orders is _>");
    let qty = [];
    orderqtys.forEach((value) => {
      value.products.forEach((qt) => {
        qty.push(qt.qty);
      });
    });
    console.log(qty + "<----->       p");
    console.log(JSON.stringify(orderqtys) + "order s");
    console.log(JSON.stringify(orderqtys) + "     oreder quantities ");
    console.log(JSON.stringify(orderDetail) + "details of orders");
    // console.log(req.session.qty + " <-in order1111111111112222222    ");
  
    res.render("users/orders", {
      profile: true,
      cartCount,
      id: userId,
      orderDetail,
      qty,
    });
  }

  async function cancelOrder(req, res) {
    try {
      const quantity = Number(req.params.qty);
      const userId = req.params.userId;
      const orderId = req.params.orderId;
      const productId = req.params.productId;
      await orderCollection.updateOne(
        { _id: new ObjectId(orderId), userId: new ObjectId(userId) },
        {
          $set: { status: "Canceled" },
        }
      );
      await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $inc: { qty: quantity } }
      );
      res.redirect(
        `http://localhost:5001/users/product/orders/trackorders/${userId}`
      );
    } catch (err) {
      console.log("Error during cancel order" + err);
    }
  }
const forUser={
    checkOut,
    placeOrder,
    placeOrderPost,
    userOrders,
    cancelOrder
}

// user contor end


module.exports = {
  listAllOrders,
  getOrderDetails,
  changeOrderStatus,
  filterOrders,
  forUser
};
