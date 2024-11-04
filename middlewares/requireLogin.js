const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const user = mongoose.model("user") 

module.exports=(req,res,next)=>{
    const {authorization} = req.headers;
    //   console.log("xxxxxxxxxxxxxxxxxxxxxxxxx",req.headers.authorization)
    if(!authorization){
    console.log("hlooooo") 

        // console.log(error)
        return res.status(401).json({error:"you must have login"})
    }

    const token = authorization.replace("Bearer ","")
 
   
    jwt.verify(token,process.env.JWT_SECRET,(error,payload)=>{
        if(error){
           
            return res.status(401).json({error:"you must have login"}) 
          
        }

        const {_id}=payload
        user.findById(_id).then(userData=>{
            req.user = userData
            // console.log(userData)
            // res.status(200).json({data:userData})
            next() 
        })
       
    })
   
    
}