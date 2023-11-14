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
const { getWhishLIstCount } = require("../helper/whish-helper");

// Address form Get
async function enterAddress(req, res) {
  const userId = req.params.userId;
  let userCartdata = await getUserCartData(userId);
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
    const products = userCartdata.map((cartItem) => {
      let price;
      if(cartItem.cartData && cartItem.cartData.offer && cartItem.cartData.offer.offerprice){
        price=cartItem.cartData.price-(cartItem.cartData.price*(cartItem.cartData.offer.offerprice/100))
      }else if(cartItem.cartData.discount){
        price=cartItem.cartData.discount
      }else{
        price=cartItem.cartData.price
      }
      return({
        productId: cartItem.products.productId,
        qty: cartItem.products.qty,
        price:price
      });
    });
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
    res.json({status:true,userId})
  } catch (err) {
    res.json({status:false,err})
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
    `/users/product/cart/checkout/place-order/${userId}`
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
    `/users/product/cart/checkout/place-order/${userId}`
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
  res.redirect(`/user/account/${userId}`);
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
  res.redirect(`/user/account/${userId}`);
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
  res.redirect(`/user/account/${userId}`);
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
