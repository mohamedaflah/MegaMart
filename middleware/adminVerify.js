function admiLoginVerify(req,res,next){
    if(req.session.adminAuth){
        next()
    }else{
        res.redirect('/user/login')
    }
}

module.exports={admiLoginVerify}