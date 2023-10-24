const {ObjectId}=require("mongodb")
const whishListCollection=require('../model/collections/whish')
module.exports={
    getWhishLIstCount: async (userId) => {
        const whishListData = await whishListCollection.findOne({
          userId: new ObjectId(userId),
        });
        let whishCount = 0;
        if (whishListData) {
          whishCount = whishListData.products.length;
        }
        return whishCount;
      },
      whishListData: async (userId) => {
        let userwhish = await whishListCollection.aggregate([
          { $match: { userId: new ObjectId(userId) } },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: "products",
              localField: "products.productId",
              foreignField: "_id",
              as: "whishListData",
            },
          },
          {
            $unwind: "$whishListData",
          },
        ]);
    
        return userwhish;
      },
}