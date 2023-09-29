function admiLoginVerify(req,res,next){
    if(req.session.adminAuth){
        next()
    }else{
        res.redirect('/admin/login')
    }
}

module.exports={admiLoginVerify}