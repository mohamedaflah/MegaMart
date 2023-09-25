function isValidMobile(mobile){
    return /^\d{10}$/.test(mobile);
}
module.exports=isValidMobile;