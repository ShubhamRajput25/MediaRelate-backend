const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const messageSchema = new mongoose.Schema({
    senderId:{
        type:ObjectId,
        ref:'user',
        required:true
    },
    receiverId:{
        type:ObjectId,
        ref:'user',
        required:true
    },
    message:{
        type:String,
        default:''
    },
    isRead:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('message', messageSchema)