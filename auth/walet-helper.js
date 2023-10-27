const e = require('express');
const walletCollection=require('../model/collections/wallet')
async function getWalletAmountofUser(userId){
    const userAmount=await walletCollection.findOne({userId:new Object(userId)})
    if(userAmount){
        return userAmount.amount;
    }else{
        return 0
    }
}
module.exports={getWalletAmountofUser}