var express = require('express');
const requireLogin = require('../middlewares/requireLogin');
const { default: mongoose } = require('mongoose');
var router = express.Router();
const USER = mongoose.model("user");
/* GET users listing. */
router.post('/addfollowers',requireLogin, function(req, res, next) {
try{
USER.updateOne({_id:{$eq:req.body.friendid}},{$addToSet:{followers:req.user._id}}).then((savedData)=>{
  if(savedData){
      // console.log(savedData)
      USER.updateOne({_id:{$eq:req.user._id}},{$addToSet:{following:req.body.friendid}}).then((result)=>{
        if(result){
        return  res.status(200).json({data:savedData,status:true,message:"update followers succussfully"})
        }else{
        return  res.status(200).json({data:[],status:false,message:"update followers Unsuccussfully"})
        }  
      })
  }else{
     return res.status(200).json({data:[],status:false,message:"update followers Unsuccussfully"})
  }
})
}catch(e){
  console.log(e)
    return res.status(200).json({data:[],status:false,message:"server error"})
}

});

router.post('/removefollowers',requireLogin,function(req,res,next){
  try{
    USER.updateOne({_id:{$eq:req.body.friendid}},{$pull:{followers:req.user._id}}).then((savedData)=>{
      if(savedData){
          // console.log(savedData)
          USER.updateOne({_id:{$eq:req.user._id}},{$pull:{following:req.body.friendid}}).then((result)=>{
            if(result){
            return  res.status(200).json({data:savedData,status:true,message:"update followers succussfully"})
            }else{
            return  res.status(200).json({data:[],status:false,message:"update followers Unsuccussfully"})
            }  
          })
      }else{
         return res.status(200).json({data:[],status:false,message:"update followers Unsuccussfully"})
      }
    })
    }catch(e){
      console.log(e)
      res.status(200).json({data:[],status:false,message:"server error"})
    }
})

router.post('/fetchAllUsers',requireLogin,function(req,res,next){
  try{
    USER.find().then((savedData)=>{
      if(savedData){
      return  res.status(200).json({data:savedData,status:true,message:"fetch users succussfully"})
      }else{
      return  res.status(200).json({data:[],status:false,message:"fetch users Unsuccussfully"})
      }  
    })
  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.post('/fetchusersdetail',requireLogin,function(req,res,next){
  try{

    USER.find({_id:{$in:req.body.users}}).then((savedData)=>{
      if(savedData){
      return  res.status(200).json({data:savedData,status:true,message:"fetch users succussfully"})
      }else{
      return  res.status(200).json({data:[],status:false,message:"fetch users Unsuccussfully"})
      }  
    })

  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.post('/editprofile',requireLogin,function(req,res,next){
  try{
      if(req.body.username){

        USER.find({username:req.body.username}).then((result)=>{
          if(result){
            return  res.status(200).json({data:[],status:false,message:"Username already present"})
          }else{

          }
        })

        USER.updateOne({_id:req.user._id},{$set:{username:req.body.username,name:req.body.name,gender:req.body.gender,bio:req.body.bio,dob:req.body.dob}}).then((savedData)=>{
          if(savedData){
            USER.find({_id:req.user._id}).then((result)=>{
              if(result){
                return  res.status(200).json({data:result,status:true,message:"edit userdata succussfully"})
              }else{
                return  res.status(200).json({data:[],status:true,message:"edit userdata succussfully but vant fetch userdata"})
              } 
            })
         
          }else{
          return  res.status(200).json({data:[],status:false,message:"edit userdata Unsuccussfully"})
          }  
        })

      }else{

        USER.updateOne({_id:req.user._id},{$set:{name:req.body.name,gender:req.body.gender,bio:req.body.bio,dob:req.body.dob}}).then((savedData)=>{
          if(savedData){
            USER.find({_id:req.user._id}).then((result)=>{
              if(result){
                return  res.status(200).json({data:result,status:true,message:"edit userdata succussfully"})
              }else{
                return  res.status(200).json({data:[],status:true,message:"edit userdata succussfully but vant fetch userdata"})
              }
            })
          }else{
          return  res.status(200).json({data:[],status:false,message:"edit userdata Unsuccussfully"})
          }  
        })

      }
   

  }catch(e){
    console.log(e)
    return res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.post('/addlinks',requireLogin,function(req,res,next){
  try{

    USER.updateOne({_id:req.user._id},{$push:{links:{name:req.body.name,link:req.body.link}}}).then((savedData)=>{
      if(savedData){
      return  res.status(200).json({data:savedData,status:true,message:"add linksuccussfully"})
      }else{
      return  res.status(200).json({data:[],status:false,message:"add link Unsuccussfully"})
      }  
    })

  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.post('/addprofilepic',requireLogin,function(req,res,next){
  try{
    let {profilepic} = req.body
    USER.updateOne({_id:req.user._id},{$set:{profilepic}}).then((savedData)=>{
      if(savedData){
      return  res.status(200).json({data:savedData,status:true,message:"add profilepic succussfully"})
      }else{
      return  res.status(200).json({data:[],status:false,message:"add profilepic Unsuccussfully"})
      }  
    })
  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.post('/addcoverpic',requireLogin,function(req,res,next){
  try{
    let {coverpic} = req.body
    USER.updateOne({_id:req.user._id},{$set:{coverpic}}).then((savedData)=>{
      if(savedData){
      return  res.status(200).json({data:savedData,status:true,message:"add coverpic succussfully"})
      }else{
      return  res.status(200).json({data:[],status:false,message:"add coverpic Unsuccussfully"})
      }  
    })
  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.delete('/removeFollower/:id',requireLogin,async function(req,res,next){
  try{
    let followerId = req.params.id

   let result1 =  await  USER.updateOne({_id:{$eq:followerId}},{$pull:{following:req.user._id}})

   let result2 =  await  USER.updateOne({_id:{$eq:req.user._id}},{$pull:{followers:followerId}})

   res.status(200).json({data:result2,status:true,message:"Remove Follower SuccessFully"})

  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.delete('/unfollow/:id',requireLogin,async function(req,res,next){
  try{
    let followingId = req.params.id

   let result1 =  await  USER.updateOne({_id:{$eq:followingId}},{$pull:{followers:req.user._id}})

   let result2 =  await  USER.updateOne({_id:{$eq:req.user._id}},{$pull:{following:followingId}})

   res.status(200).json({data:result2,status:true,message:"Unfollow SuccessFully"})

  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})

router.get('/getsuggestionList',requireLogin,async function (req,res,next) {
  try{
    let result = await USER.find({_id:{$nin:req?.user?.following}})
   
      res.status(200).json({data:result,status:true,message:"fetch suggestion list SuccessFully"})

  }catch(e){
    console.log(e)
    res.status(200).json({data:[],status:false,message:"server error"})
  }
})
module.exports = router;
   