const productsCollection = require("../model/collections/products");
const cartCollection = require("../model/collections/cart");
const orderCollection = require("../model/collections/orders");
const addressCollection = require("../model/collections/address");

// const CategoryDb=require('../model/collections/CategoryDb')
const {
  getCartCount,
  getUserCartData,
  getTotalAmount,
} = require("../helper/cart-helper");
const { ObjectId } = require("bson");
const { generateRazorpay } = require("../helper/razorpay");
const { getOrderId } = require("../helper/orderhelper");
const { getWhishLIstCount } = require("../helper/whish-helper");

// Address form Get
async function enterAddress(req, res) {
  const userId = req.params.userId;
  let userCartdata = await getUserCartData(userId);
  console.log(JSON.stringify(userCartdata));
  // const cartData = await cartCollection.findOne({
  //   userId: new ObjectId(userId),
  // });
  // var cartCount = 0;
  // if (cartData) {
  //   cartCount = cartData.products.length;
  // }
  const cartCount = await getCartCount(userId);
  const whishCount=await getWhishLIstCount(userId)
  const totalAmount = await getTotalAmount(userId);

  res.render("users/address", {
    profile: true,
    id: userId,
    cartCount,
    whishCount,
    userCartdata,
    totalAmount,
  });
}

// Address form Post
async function postUserAddress(req, res) {
  try {
    console.log("reached_______________ and api called");
    const userId = req.params.userId;
    let userCartdata = await getUserCartData(userId);
    console.log(JSON.stringify(userCartdata) + " this is the body of request");
    const {
      name,
      email,
      state,
      district,
      pincode,
      street,
      phone,
      apartment,
      payment_method,
    } = req.body;
    // const productIds = userCartdata.map(
    //   (cartItem) => cartItem.products.productId
    // );
    // const quantities = userCartdata.map((cartItem) => cartItem.products.qty);
    const products = userCartdata.map((cartItem) => {
      let price;
      if(cartItem.cartData && cartItem.cartData.offer && cartItem.cartData.offer.offerprice){
        price=cartItem.cartData.price-(cartItem.cartData.price*(cartItem.cartData.offer.offerprice/100))
      }else if(cartItem.cartData.discount){
        price=cartItem.cartData.discount
      }else{
        price=cartItem.price
      }
      return({
        productId: cartItem.products.productId,
        qty: cartItem.products.qty,
        price:price
      });
    });
    console.log(JSON.stringify(products)+' products i')
    // console.log(userCartdata+' orders data')
    // console.log('            sadf'+JSON.stringify(products)+'this is the products')
    let totalAmount = await getTotalAmount(userId);

    await new addressCollection({
      userId: new ObjectId(userId),
      addresses: [
        {
          name: name,
          state: state,
          district: district,
          pincode: pincode,
          street: street,
          phone: phone,
          apartmentOrBuilding: apartment,
          email: email,
          addedDate: Date.now(),
        },
      ],
    }).save();
    // new
    // const existingOrder = await orderCollection.findOne({
    //   userId: new ObjectId(userId),
    // });
    const addressdata = await addressCollection.findOne({
      userId: new ObjectId(userId),
    });
    // if (existingOrder) {
    //   // Update the existing order by pushing products to the array
    //   await orderCollection.updateOne(
    //     { _id: existingOrder._id },
    //     {
    //       $push: {
    //         products: products, // Add new products to the array
    //       },
    //     }
    //   );
    // } else {
    //   // Create a new order document
    //   await new orderCollection({
    //     userId: new ObjectId(userId),
    //     paymentmode: req.body.payment_method,
    //     delverydate: Date.now(),
    //     status: "Pending",
    //     address: addressdata.addresses[Number(req.body.address)],
    //     products: products,
    //   }).save();
    // }

    //new end

    //start

    await new orderCollection({
      userId: new ObjectId(userId),
      paymentmode: payment_method,
      delverydate: Date.now(),
      status: "Pending",
      totalAmount: totalAmount,
      address: {
        name: name,
        state: state,
        district: district,
        pincode: pincode,
        street: street,
        phone: phone,
        apartmentOrBuilding: apartment,
        email: email,
        addedDate: Date.now(),
      },
      products: products,
    }).save();

    // end

    // console.log(qty + " 999999999999     ");
    await cartCollection
      .deleteOne({ userId: new ObjectId(userId) })
      .then(() => {
        console.log("deleted");
      });
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

    if (payment_method == "COD") {
      // res.redirect(`/users/product/checkout/payment/success/${userId}`);
      res.json({ status: "COD" });
    } else {
      let orderId = await getOrderId(userId);
      generateRazorpay(orderId, totalAmount, userId).then((order) => {
        res.json(order);
      }).catch(err=>{
        console.error('Razorpay Err ',err)
        res.status(500).json({error:"Error generating Razorpay order"})
      })
    }
  } catch (err) {
    console.log("error in post address" + err);
  }
}

//User Controlling start

// Add Address Get Page
async function addingAddressGet(req, res) {
  const userId = req.params.userId;
  const cartCount = await getCartCount(userId);
  const whishCount=await getWhishLIstCount(userId)
  res.render("users/addAddress", { id: userId, profile: true, cartCount,whishCount });
}

// Add Address Post page
async function addinAddressPost(req, res) {
  const { name, email, state, district, pincode, street, phone, apartment } =
    req.body;
  const userId = req.params.userId;
  await addressCollection.updateOne(
    { userId: new ObjectId(userId) },
    {
      $push: {
        addresses: {
          name: name,
          state: state,
          district: district,
          pincode: pincode,
          street: street,
          phone: phone,
          apartmentOrBuilding: apartment,
          email: email,
          addedDate: Date.now(),
        },
      },
    }
  );
  // http://localhost:5001/users/product/cart/checkout/place-order/651a9eeb4ff6eaf25dbaa56f
  res.redirect(`/users/product/cart/checkout/place-order/${userId}`);
}

//Update Address Get Page
async function updateAddresGet(req, res) {
  const userId = req.params.userId;
  const addressId = req.params.addressId;
  const addressData = await addressCollection.find(
    { userId: new ObjectId(userId), "addresses._id": new ObjectId(addressId) },
    { "addresses.$": true }
  );
  // let data1 = await addressCollection.updateOne(
  //   {
  //     userId: new ObjectId(userId),
  //     "addresses._id": new ObjectId(productId),
  //   },
  //   { $inc: { "products.$.qty": 1 } }
  // );
  // console.log(JSON.stringify(data)+' {{{{{{{{{{{{{{{{{{{{{data ')
  const cartCount = await getCartCount(userId);
  const whishCount=await getWhishLIstCount(userId)
  res.render("users/editAddress", {
    cartCount,
    whishCount,
    id: userId,
    profile: true,
    addressData,
  });
}

// Update Address Post
async function updateAddressPost(req, res) {
  const { name, email, state, district, pincode, street, phone, apartment } =
    req.body;
  const userId = req.params.userId;
  const addressId = req.params.addressId;
  await addressCollection.updateOne(
    {
      userId: new ObjectId(userId),
      "addresses._id": new ObjectId(addressId),
    },
    {
      $set: {
        "addresses.$.name": name,
        "addresses.$.state": state,
        "addresses.$.district": district,
        "addresses.$.pincode": pincode,
        "addresses.$.street": street,
        "addresses.$.phone": phone,
        "addresses.$.apartmentOrBuilding": apartment,
        "addresses.$.email": email,
        "addresses.$.addedDate": Date.now(),
      },
    }
  );
  res.redirect(
    `http://localhost:5001/users/product/cart/checkout/place-order/${userId}`
  );
}

// Delete Address
async function deleteUserAddress(req, res) {
  const userId = req.params.userId;
  const addressId = req.params.addressId;
  await addressCollection.updateOne(
    { userId: new ObjectId(userId) },
    {
      $pull: {
        addresses: { _id: new ObjectId(addressId) },
      },
    }
  );
  res.redirect(
    `http://localhost:5001/users/product/cart/checkout/place-order/${userId}`
  );
}
async function addAddressinProfileGet(req, res) {
  let cartCount = await getCartCount(req.params.userId);
  let whishCount=await getWhishLIstCount(req.params.userId)
  res.render("users/addAddressinProfile", {
    profile: true,
    id: req.params.userId,
    cartCount,
    whishCount
  });
}
async function addAddressinProfilePost(req, res) {
  const { name, email, state, district, pincode, street, phone, apartment } =
    req.body;
  const userId = req.params.userId;
  const addressExist = await addressCollection.findOne({
    userId: new ObjectId(userId),
  });
  if (addressExist) {
    await addressCollection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $push: {
          addresses: {
            name: name,
            state: state,
            district: district,
            pincode: pincode,
            street: street,
            phone: phone,
            apartmentOrBuilding: apartment,
            email: email,
            addedDate: Date.now(),
          },
        },
      }
    );
  } else {
    await new addressCollection({
      userId: new ObjectId(userId),
      addresses: [
        {
          name: name,
          state: state,
          district: district,
          pincode: pincode,
          street: street,
          phone: phone,
          apartmentOrBuilding: apartment,
          email: email,
          addedDate: Date.now(),
        },
      ],
    }).save();
  }
  res.redirect(`http://localhost:5001/user/account/${userId}`);
}
async function deleteUserAddressinProfile(req, res) {
  const addressId = req.params.addressId;
  const userId = req.params.userId;
  await addressCollection.updateOne(
    { userId: new ObjectId(userId) },
    {
      $pull: {
        addresses: { _id: new ObjectId(addressId) },
      },
    }
  );
  res.redirect(`http://localhost:5001/user/account/${userId}`);
}
async function editAddressinProfileGet(req, res) {
  const userId = req.params.userId;
  const whishCount=await getWhishLIstCount(userId)
  const addressId = req.params.addressId;
  const addressData = await addressCollection.find(
    { userId: new ObjectId(userId), "addresses._id": new ObjectId(addressId) },
    { "addresses.$": true }
  );

  const cartCount = await getCartCount(userId);
  res.render("users/editAddressinProfile", {
    cartCount,
    id: userId,
    profile: true,
    whishCount,
    addressData,
  });
}
async function editAddressinProfilePost(req, res) {
  const { name, email, state, district, pincode, street, phone, apartment } =
    req.body;
  const userId = req.params.userId;
  const addressId = req.params.addressId;
  await addressCollection.updateOne(
    {
      userId: new ObjectId(userId),
      "addresses._id": new ObjectId(addressId),
    },
    {
      $set: {
        "addresses.$.name": name,
        "addresses.$.state": state,
        "addresses.$.district": district,
        "addresses.$.pincode": pincode,
        "addresses.$.street": street,
        "addresses.$.phone": phone,
        "addresses.$.apartmentOrBuilding": apartment,
        "addresses.$.email": email,
        "addresses.$.addedDate": Date.now(),
      },
    }
  );
  res.redirect(`http://localhost:5001/user/account/${userId}`);
}
// for Users
const forUserAddress = {
  addingAddressGet,
  addinAddressPost,
  updateAddresGet,
  updateAddressPost,
  deleteUserAddress,
  addAddressinProfileGet,
  addAddressinProfilePost,
  deleteUserAddressinProfile,
  editAddressinProfileGet,
  editAddressinProfilePost,
};
//User Controll end
module.exports = { postUserAddress, enterAddress, forUserAddress };
