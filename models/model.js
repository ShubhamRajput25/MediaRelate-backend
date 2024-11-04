const mongoose=require("mongoose");
const {ObjectId} = mongoose.Schema.Types

const replySchema = new mongoose.Schema({
    commentId: {
        type: ObjectId,
        ref: 'comment',  // Reference to the comment being replied to
        required: true
    },
    replyTo: {
        type: ObjectId,
        ref: 'user',     // Reference to the user the reply is directed to
        required: true
    },
    replyBy: {
        type: ObjectId,
        ref: 'user',     // Reference to the user who is replying
        required: true
    },
    reply: {
        type: String,
        required: true   // Ensure that the reply text is mandatory
    },
    likes: [{
        type: ObjectId,
        ref: 'user'      // Users who liked the reply
    }],
    unlikes: [{
        type: ObjectId,
        ref: 'user'      // Users who disliked the reply
    }],
    createdAt: {
        type: Date,
        default: Date.now // Auto-set the timestamp when reply is created
    }
})

const commentSchema = new mongoose.Schema({
    postedby:{
     type:ObjectId,
     ref:'user'
    },
    postId:{
     type:ObjectId,
     ref:'posts'
    },
    comment:{
     type:String
    },
    replies: [{
        type: ObjectId,
        ref: 'reply'  // Reference to the replies on this comment
    }],
    createdAt: {
     type: Date,
     default: Date.now
    },
    likes:[{
        type:ObjectId,
        ref:'user'
    }],
    unlikes:[{
         type:ObjectId,
        ref:'user'
    }]
 })

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    followers:[{
        type:ObjectId,
        ref:"user"
    }],
    following:[{
        type:ObjectId,
        ref:'user'
    }],
    links:[{
        name:{type:String},
        link:{type:String}
    }],
    gender:{
        type:String
    },
    dob:{
        type:String
    },
    bio:{
        type:String
    },
    profilepic:{
        type:String
    },
    coverpic:{
        type:String
    }
})

const postSchema=new mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    picture:{
        type:String,
        default:""
    },
    video: {
        type: String,
        default: ""
    },
    postedby:{
        type:ObjectId,
        ref:"user"
    },
    likes:[{
        type:ObjectId,
        ref:'user'
    }],
    unlikes:[{
         type:ObjectId,
        ref:'user'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
})




mongoose.model("user",userSchema) 
mongoose.model("post",postSchema)
mongoose.model('comment',commentSchema)
mongoose.model('reply',replySchema)