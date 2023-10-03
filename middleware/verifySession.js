
function verifySessionAuth(req,res,next){
   
    if(req.session.userAuth){
        next()
    }else{
        res.redirect('/')
    }
}
module.exports={verifySessionAuth}