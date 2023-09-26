const router = require("express").Router();
router.get('/',(req,res)=>{
    res.render('admins/admin')
})
module.exports = { router };
