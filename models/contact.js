const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const contactSchema = new mongoose.Schema({
    users:[
        {
            type:ObjectId,
            ref:'user'
        }
    ],
    lastMessage:{
        type:ObjectId,
        ref:'message'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    isGroupChat:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('contact', contactSchema);