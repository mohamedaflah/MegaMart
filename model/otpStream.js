const mongoose = require("mongoose");
const otpCollection = require("./collections/otp");
const EventEmitter=require('events')
require('../config/dbconfg')
const otpStream=otpCollection.watch()
const emitter=new EventEmitter()
otpStream.on('change',(change)=>{
    if(change.operationType === 'delete'){
        console.log('Otp Document Deleted  '+change.documentKey._id);
        emitter.emit('otpDeleted', change.documentKey._id);
    }
})

module.exports=emitter