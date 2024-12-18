const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const USER = mongoose.model("user") 

module.exports=async(req,res,next)=>{
    const {authorization} = req.headers;
   
    if(!authorization){
        return res.status(401).json({error:"you must have login"})
    }

    const token = authorization.replace("Bearer ","")
   
    const decoded =  jwt.verify(token,process.env.JWT_SECRET)

    if (!decoded) {
        return res.status(401).json({error:"you must have login"}) 
    }

    const user = await USER.findOne({ _id: decoded.id })

    if(user) {
        req.user = user
    }

    next()    
}