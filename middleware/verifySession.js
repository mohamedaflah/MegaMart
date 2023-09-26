function verifySessionAuth(req,res,next){
    if(req.session.userAuth){
        next()
    }
}
module.exports={verifySessionAuth}