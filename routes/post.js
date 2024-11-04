var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
const requireLogin = require('../middlewares/requireLogin')
const { post, param } = require('.');
const posts = mongoose.model('post')
const comments = mongoose.model('comment')
const replys = mongoose.model('reply')

const cloudinary = require('cloudinary').v2;

// router.post('/createpost',requireLogin,function(req,res,next){
//     console.log("body",req.body)
//     const {body,picture} = req.body

//     if(!body||!picture){
//     return  res.status(422).json({ error: "pls add all the fields" })
//     }
//    // req.user

//     console.log("ok") 

// //    const post = new posts({
// //     body,
// //     picture,  
// //     postedby:req.user
// //    })
 
//    posts.insertMany({body:body,picture:picture,postedby:req.user}).then((post)=>{
//     // console.log("post hooo gyiiiii",post)
//     return  res.status(200).json({status:true,message:'submit successfully'})
//    })
//    .catch(err => { console.log(err) })

// })

router.post('/createpost', requireLogin, async (req, res) => {
    try {
        console.log("Request Body Received:", req.body);  // Log the received data
        const { body, picture, video } = req.body;

        // Check if body and either picture or video is provided
        if (!body || (!picture && !video)) {
            console.log("Missing fields"); // Log if fields are missing
            return res.status(422).json({ error: "Please add all the fields" });
        }

        const userId = req.user._id;
        const post = new posts({
            body: body,
            picture: picture || "",
            video: video || "",
            postedby: userId
        });

        const savedPost = await post.save();
        console.log("Post created successfully", savedPost);  // Log the created post
        return res.status(200).json({ status: true, message: 'Post submitted successfully', post: savedPost });
    } catch (err) {
        console.error("Error creating post:", err);
        return res.status(500).json({ status: false, error: "Internal server error" });
    }
});



router.post('/fetchpost',requireLogin,async function(req,res,next){
    // console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjj")
try{

    const {user} = req.body
    // console.log("user : ",user)
    if(!user){
     return  res.status(422).json({ error: "please login" })
    }

        let savedData = await posts.find({})
                                .populate('postedby')
        if(savedData){
            // console.log(savedData)
            res.status(200).json({data:savedData,status:true,message:"Fetch succussfully"})
        }else{
            res.status(200).json({data:[],status:false,message:"Fetch Unsuccussfully"})
        }
}
catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
}
})

router.post('/fetchPostsByUserid',requireLogin,function(req,res,next){
    try{
        let userId = req.body.userid
        posts.find({postedby:req.body.userid})
        .populate('postedby')
        .then((savedData)=>{
            if(savedData){
                // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",savedData)
                res.status(200).json({data:savedData,status:true,message:"Fetch succussfully"})
            }else{
                res.status(200).json({data:[],status:false,message:"Fetch Unsuccussfully"})
            }
        })
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/addlikes',requireLogin,function(req,res,next){
    try{
    posts.updateOne({_id:{$eq:req.body.id}},{$addToSet:{likes:req.user._id}}).then((savedData)=>{
        if(savedData){
            console.log(savedData)
            res.status(200).json({data:savedData,status:true,message:"update like succussfully"})
        }else{
            res.status(200).json({data:[],status:false,message:"update like Unsuccussfully"})
        }
    })
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/removelikes',requireLogin,function(req,res,next){
    try{
        posts.updateOne({_id:{$eq:req.body.id}},{$pull:{likes:req.user._id}}).then((savedData)=>{
            if(savedData){
                console.log(savedData)
                res.status(200).json({data:savedData,status:true,message:"update like succussfully"})
            }else{
                res.status(200).json({data:[],status:false,message:"update like Unsuccussfully"})
            }
        })
        }catch(e){
            console.log(e)
            res.status(200).json({data:[],status:false,message:"server error"})
        }
})

router.post('/addcomments',requireLogin,async function(req,res,next){
    try{
        // posts.updateOne({_id:req.body.id},{$push:{comments:{postedby:req.user,comment:req.body.comment,username:req.body.username}}}).then((savedData)=>{
        //     if(savedData){
        //         console.log(savedData)
        //         res.status(200).json({data:savedData,status:true,message:"update comment succussfully"})
        //     }else{
        //         res.status(200).json({data:[],status:false,message:"update comment Unsuccussfully"})
        //     }
        // })
        let result = await comments.create({...req.body,postedby:req.user._id})
        if(result){
            return res.status(200).json({data:[],status:true,message:"Add Comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed to Add Comment"})
        }
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/fetch-comment-by-post',requireLogin,async function(req,res,next){
    try{
        const { postId } = req.body;
        const {pageNumber} = req.query;

        let result = await comments.find({postId:postId})
                            .sort({createdAt:-1})
                            .skip((pageNumber - 1) * 15)
                            .limit(15)
                            .populate('postedby')
                            .populate({
                                path:'replies',
                                populate: {
                                    path: 'replyBy replyTo'
                                  }
                            });

        if(result){
            return res.status(200).json({data:result,status:true,message:"Fetch Comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed to Fetch Comment"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.get('/fetchAllPosts',requireLogin,async function(req,res,next){
    try{
        let result = await posts.find({})
        .sort({createdAt:-1})
        .populate('postedby')

        return res.status(200).json({data:result,status:true,message:"Fetch succussfully"})
    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.delete('/deletePost/:postId',requireLogin,async function(req,res,next){
    try{
        const postId = req.params.postId

        let findPost = await posts.find({_id:postId})

        if(!findPost){
            return res.status(200).json({data:[],status:false,message:"Post Doesn't Exist"})
        }

        if(!(findPost[0]?.postedby?.toString() == req.user._id?.toString())){
            return res.status(200).json({data:[],status:false,message:"User Not Autherized"})
        }

         // Delete from Cloudinary
         if (post.picture) {
            const picturePublicId = post.picture.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(picturePublicId);
        }

        if (post.video) {
            const videoPublicId = post.video.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(videoPublicId);
        }

        let result = await posts.deleteOne({_id:postId})
        // console.log(result)
        if(result){
            return res.status(200).json({data:[],status:true,message:"Delete Post succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To Delete Post"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/like-comment',requireLogin,async function(req,res,next){
    try{
        const {commentId} = req.body

        let findComment = await comments.find({_id:commentId})
 
        if(!findComment){
             return res.status(200).json({data:[],status:false,message:"comment Doesn't Exist"})
        }

        let result = await comments.updateOne({_id:commentId},{$addToSet:{likes:req.user._id}})
      
        if(result){
            return res.status(200).json({data:[],status:true,message:"like comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To Like Comment"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/unlike-comment',requireLogin,async function(req,res,next){
    try{
        const {commentId} = req.body

        let findComment = await comments.findOne({_id:commentId})

        if(!findComment){
             return res.status(200).json({data:[],status:false,message:"comment Doesn't Exist"})
        }

        let result = await comments.updateOne({_id:commentId},{$pull:{likes:req.user._id}})

        if(result){
            return res.status(200).json({data:[],status:true,message:"Unlike comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To UnLike Comment"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/add-reply-on-comment',requireLogin,async function(req,res,next){
    try{
       const {commentId, replyTo, reply} = req.body
        
       let findComment = await comments.findOne({_id:commentId})

       if(!findComment){
        return res.status(200).json({data:[],status:false,message:"comment Doesn't Exist"})
       }
       
       let saveReply = await replys.create({
        commentId:commentId,
        replyTo: replyTo,
        replyBy:req?.user?._id,
        reply:reply
       })

       if(saveReply){
        let result = await comments.updateOne({_id:commentId},{$push:{replies:saveReply?._id}},{new:true})

        if(result){
            return res.status(200).json({data:[],status:true,message:"add reply to comment succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To add reply to Comment"})
        }

       }else{
        console.log("save nhi hua reply")
        return res.status(200).json({data:[],status:false,message:"faild to add reply"})
       }
       
    } catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/like-reply',requireLogin,async function(req,res,next){
    try{

        const {replyId} = req.body

        let findReply = await replys.find({_id:replyId})

        if(!findReply){
            return res.status(200).json({data:[],status:false,message:"Reply Doesn't Exist"})
        }

        let result = await replys.updateOne({_id:replyId},{$addToSet:{likes:req.user._id}},{new:true})

        if(result){
            return res.status(200).json({data:[],status:true,message:"like Reply succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To Like To reply"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/unlike-reply',requireLogin,async function(req,res,next){
    try{

        const {replyId} = req.body

        let findReply = await replys.find({_id:replyId})

        if(!findReply){
            return res.status(200).json({data:[],status:false,message:"Reply Doesn't Exist"})
        }

        let result = await replys.updateOne({_id:replyId},{$pull:{likes:req.user._id}},{new:true})

        if(result){
            return res.status(200).json({data:[],status:true,message:"unlike Reply succussfully"})
        }else{
            return res.status(200).json({data:[],status:false,message:"Failed To UnLike To reply"})
        }

    }catch(e){
        console.log(e)
        res.status(200).json({data:[],status:false,message:"server error"})
    }
})



module.exports = router