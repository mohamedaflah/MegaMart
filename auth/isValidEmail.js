function isValidMail(mail){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
}
module.exports=isValidMail;