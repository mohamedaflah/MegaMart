const { getCartCount } = require("../helper/cart-helper");
const { getWhishLIstCount, whishListData } = require("../helper/whish-helper");
const whishListCollection = require("../model/collections/whish");
const cartCollection = require("../model/collections/cart");
const { ObjectId } = require("mongodb");
async function getWhishListPage(req, res) {
  let userId = req.params.id;
  let userWhish = await whishListData(userId);
  let cartCount = await getCartCount(userId);
  let whishCount = await getWhishLIstCount(userId);
  res.render("users/whish", {
    profile: true,
    cartCount,
    whishCount,
    userWhish,
    id: userId,
    whishListData,
  });
}
async function addToWhishList(req, res) {
  const productId = req.params.productId;
  const userId = req.params.userId;
  try {
    let userWhishExist = await whishListCollection.findOne({
      userId: new ObjectId(userId),
    });
    console.log(userWhishExist + " whish skjkl");
    if (!userWhishExist) {
      await new whishListCollection({
        userId: new ObjectId(userId),
        products: [
          {
            productId: new ObjectId(productId),
          },
        ],
      }).save();
    } else {
      const productExist = await whishListCollection.aggregate([
        {
          $match: { userId: new ObjectId(userId) },
        },
        {
          $unwind: "$products",
        },
        {
          $match: { "products.productId": new ObjectId(productId) },
        },
      ]);
      console.log(JSON.stringify(productExist) + "`in whish`");
      if (productExist.length <= 0) {
        await whishListCollection.updateOne(
          {
            userId: new ObjectId(userId),
          },
          {
            $push: {
              products: {
                productId: new ObjectId(productId),
              },
            },
          }
        );
      } else {
        res.json({ status: false });

        console.log("whished data " + data);
      }
    }
    // res.redirect("/");
    res.json({ status: true });
  } catch (err) {
    console.log("error in add to cart" + err);
  }
}
async function removeProductInwhish(req, res) {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;
    await whishListCollection.updateOne(
      {
        userId: new ObjectId(userId),
        "products.productId": new ObjectId(productId),
      },
      {
        $pull: {
          products: {
            productId: new ObjectId(productId),
          },
        },
      }
    );
    res.json({ status: true });
  } catch (err) {
    res.json({ status: false });
  }
}
async function movetoCartinWhishList(req, res) {
  const productId = req.params.productId;
  const userId = req.params.userId;
  var productExistStatus=false
  await whishListCollection.findOneAndUpdate(
    {
      userId: new ObjectId(userId),
    },
    {
      $pull: {
        products: {
          productId: new ObjectId(productId),
        },
      },
    },
    { returnOriginal: false }
  );
  let cartExist = await cartCollection.findOne({
    userId: new ObjectId(userId),
  });
  if (cartExist) {
    const productExist = await cartCollection.aggregate([
      {
        $match: { userId: new ObjectId(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $match: { "products.productId": new ObjectId(productId) },
      },
    ]);
    if (productExist.length <= 0) {
      await cartCollection.updateOne(
        {
          userId: new ObjectId(userId),
        },
        {
          $push: {
            products: {
              productId: new ObjectId(productId),
              qty: 1,
            },
          },
        }
      );
    }else{
      productExistStatus=true;
    }
  }else{
    await new cartCollection({
      userId: new ObjectId(userId._id),
      products: [
        {
          productId: new ObjectId(productId),
          qty: 1,
        },
      ],
    }).save();
  }
  res.json({ status: true,productExistStatus });
}
module.exports = {
  getWhishListPage,
  addToWhishList,
  removeProductInwhish,
  movetoCartinWhishList,
};
