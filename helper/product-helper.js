const productsCollection=require('../model/collections/products')

class ProductHelper{

    getProductDataForLandingPage=()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let productData = await productsCollection.find({stock:{$gte:1}}).sort({ addedDate: -1 }).limit(6)
                resolve(productData)
            }catch(err){
                console.log("err in Product helper");
                reject(err)
            }
            
        })
        
    }
}
module.exports=ProductHelper