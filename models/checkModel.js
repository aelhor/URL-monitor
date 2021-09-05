const mongoose = require('mongoose')
const {Schema} = mongoose

const checkSchema = new Schema({
    userId : {
        type : String
    },
    name : { 
        type :String , 
        required : true,
        unique : true
    },
    url :{ 
        type :String , 
        required : true,
        // match : 'url regex'
    }, 
    protocol : { 
        type :String , 
        required : true
    }, 
    path :{ 
        type :String , 
    }, 
    port:{ 
        type :String , 
    } , 
    webhook :{ 
        type :String , 
    }, 
    timeOut :{
        type : Number, 
        default : 5  // sec
    }, 
    interval:{
        type : Number, 
        default : 10 * 60 // min
    } , 
    threshold :{ 
        type : Number, 
        default : 1 // num of failers to create an alert 
    }, 
    authentication  :{
        type: Object , 
    },
    httpHeaders  : {
        type: Map,
        of: String , 
    },
    assert :{
        type : Object   
    }, 
    tags : Array ,   
    ignoreSSL  :Boolean,
    paused : {
        type:Boolean , 
        default : false
    }
    
}, {timestamps :true} )



const check = mongoose.model('Checks', checkSchema);
module.exports = check