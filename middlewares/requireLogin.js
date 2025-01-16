const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const USER = mongoose.model("user") 

module.exports=async(req,res,next)=>{
    const {authorization} = req.headers;
    // console.log("first", authorization)
    if(!authorization){
        return res.status(401).json({error:"you must have login"})
    }
   
    const token = authorization.replace("Bearer ","")
    // console.log("second : ", token)
   
    const decoded =  jwt.verify(token,process.env.JWT_SECRET)
    // console.log("third : ", decoded)
    if (!decoded) {
        return res.status(401).json({error:"you must have login"}) 
    }

    const user = await USER.findOne({ _id: decoded.id })
    // console.log("fourth : ", user)
    if(user) {
        req.user = user
    }

    next()    
}