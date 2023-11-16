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
const { generateRazorpay } = require("../helper/razorpay");
const {
  getOrderId,
  getOrderProductByOrderId,
  getDeliveredOrders,
} = require("../helper/orderhelper");
const { addAmountIntoWallet } = require("./walletController");
const { getWhishLIstCount } = require("../helper/whish-helper");
const { getWalletAmountofUser } = require("../auth/walet-helper");
const walletCollection = require("../model/collections/wallet");
// Listing Orders is Admin Side
async function listAllOrders(req, res) {
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
      $lookup: {
        from: "products", // Use the name of your Products collection here
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        paymentmode: 1,
        delverydate: 1,
        status: 1,
        address: 1,
        isEmpty: 1,
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
        isEmpty: 1,
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
  res.redirect(
    `/admin/products/orders/list-orders/orders-detail/${ordeId}/${userId}/`
  );
}

// Filter Orders for Admin
async function filterOrders(req, res) {
  const filterorder = req.params.filterorder;

  const commonAggregation = [
    {
      $lookup: {
        from: "users",
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
        from: "products",
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
        user: 1,
        isEmpty: 1,
        products: {
          productId: "$product._id",
          qty: "$products.qty",
          productDetails: "$product",
        },
      },
    },
  ];

  const sort = {
    $sort: {
      delverydate: 1,
    },
  };

  const matchStatus = {
    $match: {
      status: filterorder,
    },
  };

  let aggregationPipeline;

  switch (filterorder) {
    case "bylatest":
      aggregationPipeline = [...commonAggregation, sort];
      break;
    case "byoldest":
      aggregationPipeline = [
        ...commonAggregation,
        { ...sort, $sort: { delverydate: -1 } },
      ];
      break;
    case "Pending":
    case "Confirmed":
    case "Delivered":
    case "Shipped":
      aggregationPipeline = [...commonAggregation, matchStatus, sort];
      break;
    default:
      aggregationPipeline = commonAggregation;
  }

  const orderDetail = await orderCollection.aggregate(aggregationPipeline);
  res.render("admins/listOrders", { orderDetail });
}

// For users  Start */

//User Checkout Section
async function checkOut(req, res) {
  const userId = req.params.userId;

  let useraddressIsExist = await addressCollection.findOne({
    userId: new ObjectId(userId),
  });

  if (!useraddressIsExist || useraddressIsExist.addresses.length <= 0) {
    res.redirect(`/users/product/checkout/address/${userId}`);
  } else {
    res.redirect(`/users/product/cart/checkout/place-order/${userId}`);
  }
}

// user Place order Get page
async function placeOrder(req, res) {
  const userId = req.params.userId;
  const cartCount = await getCartCount(userId);
  const walletAmount = await getWalletAmountofUser(userId);
  const addressData = await addressCollection.findOne({
    userId: new ObjectId(userId),
  });
  const cartData = await getUserCartData(userId);
  const whishCount = await getWhishLIstCount(userId);
  const totalAmount = await getTotalAmount(userId);
  let walletStatus;
  if (walletAmount >= totalAmount) {
    walletStatus = true;
  } else {
    walletStatus = false;
  }

  res.render("users/place-order", {
    profile: true,
    cartCount,
    id: userId,
    addressData,
    whishCount,
    cartData,
    walletStatus,
    totalAmount,
  });
}

// user place order Post Section
async function placeOrderPost(req, res) {
  try {
    const userId = req.params.userId;
    const totalAmount = await getTotalAmount(userId);
    const addressdata = await addressCollection.findOne({
      userId: new ObjectId(userId),
    });
    // addressdata = addressdata.addresses[Number(req.body.address)];
    const userCartdata = await getUserCartData(userId);
    const products = userCartdata.map((cartItem) => {
      let price;
      console.log(JSON.stringify(cartItem) + "--------cart items");
      if (
        cartItem.cartData &&
        cartItem.cartData.offer &&
        cartItem.cartData.offer.offerprice
      ) {
        price =
          cartItem.cartData.price -
          cartItem.cartData.price * (cartItem.cartData.offer.offerprice / 100);
      } else if (cartItem.cartData.discount) {
        price = cartItem.cartData.discount;
      } else {
        price = cartItem.cartData.price;
      }
      return {
        productId: cartItem.products.productId,
        qty: cartItem.products.qty,
        price: price - price * (cartItem.getDiscount / 100),
      };
    });
    await new orderCollection({
      userId: new ObjectId(userId),
      paymentmode: req.body.payment_method,
      delverydate: Date.now(),
      status: "Pending",
      totalAmount: totalAmount,
      address: addressdata.addresses[Number(req.body.address)],
      products: products,
    }).save();
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
    if (req.body.payment_method == "COD") {
      res.json({ status: "COD" });
    } else if (req.body.payment_method == "Wallet") {
      await walletCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $inc: { amount: -totalAmount } }
      );
      res.json({ status: "Wallet" });
    } else {
      let orderId = await getOrderId(userId);
      generateRazorpay(orderId, totalAmount, userId)
        .then(async (order) => {
          res.json(order);
        })
        .catch((err) => {
          console.log("Razorpay Error in Checkout ", err);
          res
            .status(500)
            .json({ error: "Error in Generating Razopay Checkout" });
        });
    }
  } catch (err) {
    console.log("error in checkout place order post" + err);
  }
}
async function userOrders(req, res) {
  const userId = req.params.userId;
  const cartCount = await getCartCount(userId);
  const whishCount = await getWhishLIstCount(userId);
  const anotherOrder = await UserCollection.aggregate([
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
      $project: {
        _id: 1,
        userOrders: {
          _id: "$userOrders._id",
          userId: "$userOrders.userId",
          paymentmode: "$userOrders.paymentmode",
          delverydate: "$userOrders.delverydate",
          status: "$userOrders.status",
          address: "$userOrders.address",
          totalAmount: "$userOrders.totalAmount",
          products: "$userOrders.products.productDetails", // Reshape here
          __v: "$userOrders.__v",
        },
        __v: 1,
      },
    },
    {
      $sort: {
        "userOrders.delverydate": -1, // Sort by delverydate in descending order (latest first)
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

  for (const order of anotherOrder) {
    for (const userOrder of order.userOrders) {
      for (const product of userOrder.products) {
        const orderId = userOrder._id;
        const productQty = await getOrderProductByOrderId(orderId, product._id);
        product.qty = productQty.qty;
        product.finalprice = productQty.price;
        // product.price=
        console.log(productQty + " this is the qty of product");
      }
    }
  }

  let orderqtys = await orderCollection.find({
    userId: new ObjectId(userId),
  });

  let qty = [];
  orderqtys.forEach((value) => {
    value.products.forEach((qt) => {
      qty.push(qt.qty);
    });
  });

  res.render("users/tesorder", {
    profile: true,
    cartCount,
    whishCount,
    id: userId,
    orderDetail: anotherOrder,
    qty,
  });
}

async function cancelOrder(req, res) {
  try {
    const userId = req.params.userId;
    const orderId = req.params.orderId;
    const orderData = await orderCollection.findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    });

    const paymentMode = await orderCollection.findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    });
    await orderCollection.updateOne(
      { _id: new ObjectId(orderId), userId: new ObjectId(userId) },
      {
        $set: { status: "Canceled" },
      }
    );
    orderData.products.map(async (data) => {
      console.log(data + " each data sadlk");
      await productsCollection.updateOne(
        { _id: data.productId },
        { $inc: { stock: data.qty } }
      );
    });
    if (paymentMode.paymentmode == "Bank") {
      addAmountIntoWallet(userId, orderId).then(() => {
        res.redirect(`/users/product/orders/trackorders/${userId}`);
      });
    } else {
      res.redirect(`/users/product/orders/trackorders/${userId}`);
    }
  } catch (err) {
    console.log("Error during cancel order" + err);
  }
}
function genereateRazopayforOrder(req, res) {
  try {
    const { totalAmount, userId } = req.body;
    const KEY_ID = process.env.RAZORPAY_KEYID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: KEY_ID, // Use 'key_id' instead of 'KEY_ID'
      key_secret: KEY_SECRET,
    });
    let options = {
      amount: totalAmount * 100, // Amount in paise (multiply by 100 to convert to currency)
      currency: "INR",
      receipt: userId,
      payment_capture: 1,
    };
    razorpay.orders.create(options, (err, order) => {
      if (err) {
        console.error("Razorpay order creation error", err);
        return res.status(500).json({ error: "Razorpay order creation error" });
      } else {
        res.json({ order });
      }
    });
  } catch (err) {
    console.log("errr in rzp9090  -?" + err);
    res.json({ error: "Err is " + err });
  }
}
function razopayPaymentVerification(req, res) {
  try {
    const { orderid, paymentId } = req.body;
    const Razorpay = require("razorpay");
    const KEY_ID = process.env.RAZORPAY_KEYID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const razorpay = new Razorpay({
      key_id: KEY_ID, // Use 'key_id' instead of 'KEY_ID'
      key_secret: KEY_SECRET,
    });
    let status = true;
    razorpay.payments
      .fetch(paymentId)
      .then((payment) => {
        if (payment.status === "captured") {
          // Payment was successfully captured
          res.json({ status: true });
        } else {
          // Payment verification failed
          res
            .status(400)
            .json({ status: false, message: "Payment verification failed" });
        }
      })
      .catch((error) => {
        console.error("Razorpay payment verification error:", error);
        res.status(500).json({
          status: false,
          message: "An error occurred while verifying the payment" + error,
        });
      });
    //  res.json({status})
  } catch (err) {
    res
      .status(500)
      .json({ status: false, message: "Error in verify payment " + err });
  }
}
function getSalesReport(req, res) {
  console.log('api called');
  getDeliveredOrders().then((response) => {

    let {ordersbyDay,ordersByWeek,ordersByMonth}=response
    console.log("By day ",ordersbyDay)
    console.log("By Week ",ordersByWeek)
    console.log("By Month ",ordersByMonth)
    res.json({ordersbyDay,ordersByWeek,ordersByMonth})

  }).catch(err=>{
    res.json({err})
  })
}
const forUser = {
  checkOut,
  placeOrder,
  placeOrderPost,
  userOrders,
  cancelOrder,
  genereateRazopayforOrder,
  razopayPaymentVerification,
};

// user contor end

module.exports = {
  listAllOrders,
  getOrderDetails,
  changeOrderStatus,
  filterOrders,
  forUser,
  getSalesReport,
  // filterSpecificOrder
};
