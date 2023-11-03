const { ObjectId } = require("bson");
const couponCollection = require("../model/collections/cupon");
const cartCollection = require("../model/collections/cart");
const { getTotalAmount } = require("../helper/cart-helper");
async function showAllCouponInAdmin(req, res) {
  const coupons = await couponCollection.find().sort({ addedDate: -1 });
  res.render("admins/coupon", { coupons });
}
async function addCouponPost(req, res) {
  console.log(req.body);
  let { couponname, couponcode, expiry, discount, usagelimit, minorderAmt } =
    req.body;
  expiry = new Date(expiry);
  if (expiry < new Date()) {
    return res.json({ existerr: "Coupon has already expired.", exist: true });
  }
  let couponExistStatus = await couponCollection.findOne({
    couponcode: couponcode,
  });
  if (couponExistStatus) {
    return res.json({ existerr: "Coupon code already exists!!", exist: true });
  }
  if (Number(discount) <1 || Number(discount)>90) {
    return res.json({ existerr: "must be between 1 and 90 %", percent: true });
  }
  await new couponCollection({
    couponname: couponname,
    couponcode: couponcode,
    addedDate: Date.now(),
    statusChangeDate: expiry,
    discount: discount,
    usageLimit: usagelimit,
    status: "active",
    minOrderAmt: minorderAmt,
  }).save();
  res.json({ status: true });
}

async function getEditCouponData(req, res) {
  let cuponId = req.params.couponId;
  const couponData = await couponCollection.findById(new ObjectId(cuponId));
  res.json({ couponData });
}
async function editCouponPost(req, res) {
  try{

    const couponId = req.params.couponId;
    let { couponname, couponcode, expiry, discount, usagelimit, minorderAmt } =
      req.body;
      if(!couponname || !couponcode || !expiry || !discount || !usagelimit || !minorderAmt){
        return res.json({err:"Fill all field"})
      }
    let couponData=await couponCollection.findById(new ObjectId(couponId)) 
    // if(couponname==couponData.couponname){
    //   return res.json({err:"Coupon name already exist"})
    // } 
    // if(couponcode==couponData.couponname){

    // }
    expiry = new Date(expiry);
    let status;
    if(expiry>=new Date()){
      status='active'
    }else{
      status='expired'
    }
    await couponCollection.updateOne(
      { _id: new ObjectId(couponId) },
      {
        $set: {
          couponname: couponname,
          couponcode: couponcode,
          statusChangeDate: expiry,
          usageLimit: usagelimit,
          status:status,
          minorderAmt: minorderAmt,
        },
      }
    );
    // res.redirect('http://localhost:5001/admin/products/cupons/allcupons')
    res.json({status:true})
  }catch(err){
    console.log('error founded in update copon'+err);
    res.json({err})
  }
}
async function checkCouponisExist(req, res) {
  // console.log("CALLED");
  const { couponcode } = req.body;
  let exist = await couponCollection.findOne({ couponcode: couponcode });
  if (exist) {
    res.json({ err: "Coupon code is already exist!!!" });
  } else {
    res.json({ status: true });
  }
}

// for user

// async function applyCoupon(req, res) {
//   const { couponcode } = req.body;
//   const userId = req.query._id;
//   try {
//     const couponData = await couponCollection.findOne({
//       couponcode: couponcode,
//     });
//     const userCn = await couponCollection.findOne({
//       couponcode: couponcode,
//       "users.userId": new ObjectId(userId),
//     });
//     const userCouponInfo = await couponCollection.aggregate([
//       {
//         $match: {
//           couponcode: couponcode,
//           "users.userId": new ObjectId(userId),
//         },
//       },
//       {
//         $project: { _id: 0, count: "$users.count" },
//       },
//     ]);
//     console.log(userCn + "           99");
//     console.log(couponData + "sadlkf   9");
//     console.log("coupon info _______", JSON.stringify(userCouponInfo));

//     if (!couponData) {
//       return res.json({ err: "Coupon not matching" });
//     }
//     const result = await couponCollection.aggregate([
//       {
//         $match: { couponcode: couponcode },
//       },
//       {
//         $unwind: "$users",
//       },
//       {
//         $match: { "users.userId": new ObjectId(userId) },
//       },
//     ]);
//     console.log(JSON.stringify(result) + "sdaf      sadfsd");
//     if (userCouponInfo.length<=0 || userCouponInfo[0].count <= 3) {
//       console.log('reached __');
//       let discount = couponData.discount;
//       if(userCouponInfo.length<=0){
//         console.log('reached if sdf()(');
//         await couponCollection.updateOne({couponcode:couponcode},{$push:{
//           userId:new ObjectId(userId),
//           count:1
//         }})
//       }else{
//         console.log('reached if sdf()(-=-=');
//         await couponCollection.updateOne(
//           {
//             couponcode: couponcode,
//             "users.userId": new ObjectId(userId)
//           },
//           {
//             $inc: { "users.$.count": 1 }
//           }
//         );
//       }
//       await cartCollection.updateOne(
//         { userId: new ObjectId(userId) },
//         { $set: { getDiscount: discount } }
//       );
//       res.json({status:true,discount})
//     } else {
//       return res.json({ err: "Your limit exceed" });
//     }
//   } catch (err) {
//     console.log("error in apply coupon post", err);
//   }
// }

async function applyCoupon(req, res) {
  const { couponcode } = req.body;
  const userId = req.query.id;
  let coupondata = await couponCollection.findOne({ couponcode: couponcode });
  let userOrderAmt = await getTotalAmount(userId);
  if (!coupondata) {
    return res.json({ err: "Coupon not matching" });
  }
  console.log(coupondata.minOrderAmt + "min order amt");
  console.log(userOrderAmt + " user  order amt");
  if (userOrderAmt >= coupondata.minOrderAmt) {
    const discountAmount = coupondata.discount;
    await cartCollection
      .updateOne(
        { userId: new ObjectId(userId) },
        { $set: { getDiscount: discountAmount } }
      )
      .then(() => {
        console.log("cart updated");
      });
    let userdata = await couponCollection.aggregate([
      {
        $match: {
          "users.userId": new ObjectId(userId),
        },
      },
      {
        $unwind: "$users",
      },
      {
        $match: {
          "users.userId": new ObjectId(userId),
        },
      },
      {
        $project: {
          _id: 0,
          count: "$users.count",
        },
      },
    ]);
    console.log(JSON.stringify(userdata) + "    data of   user  ");
    // if (userdata[0].count > coupondata.usageLimit) {
    //   return res.json({ err: "User limit exceeded" });
    // }
    console.log(JSON.stringify(userdata));
    if (userdata.length <= 0) {
      await couponCollection.updateOne(
        { couponcode: couponcode },
        {
          $addToSet: {
            users: {
              userId: userId,
              count: 1, // Initialize the count to 1 for new users
            },
          },
        }
      );
    } else {
      if (userdata[0].count > coupondata.usageLimit) {
        return res.json({ err: "Maximum attempt reached" });
      }
      await couponCollection.updateOne(
        { couponcode: couponcode, "users.userId": userId },
        {
          $inc: { "users.$.count": 1 },
        }
      );
    }
    res.json({ status: true, discount: discountAmount });
  } else {
    return res.json({
      err: "Minimum Purcahse amount is" + coupondata.minOrderAmt,
    });
  }
}

const forUserCoupon = { applyCoupon };
module.exports = {
  showAllCouponInAdmin,
  addCouponPost,
  checkCouponisExist,
  forUserCoupon,
  getEditCouponData,
  editCouponPost,
};
