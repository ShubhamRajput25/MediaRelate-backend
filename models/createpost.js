const mongoose=require("mongoose");
const {ObjectId} = mongoose.Schema.Types

const postSchema=new mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    picture:{
        type:String,
        required:true
    },
    postedby:{
        type:String,
        ref:"user"
    }
})

mongoose.model("post",postSchema)