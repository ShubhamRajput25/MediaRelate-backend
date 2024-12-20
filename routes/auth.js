var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("user");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const requireLogin = require('../middlewares/requireLogin');
const ShortUniqueId = require('short-unique-id');
const Otp = require("../models/otp-model");
const { sendOtpForUserSignup } = require('../mail');
const sendToken = require('../jwtToken');
const generateUserName = require('../constant');


/* GET home page. */


router.get('/', function (req, res, next) {
    res.send("hello")
});


router.post('/signup', async function (req, res, next) {

    const { name, username, email, password } = req.body;

    if (!name || !email || !username || !password) {
        res.status(422).json({ error: "pls add all the fields" })
    }

    let user = await USER.findOne({ $or: [{ email: email }, { username: username }] })

        if (user) {
            // console.log(savedUser)
            return res.status(422).json({ error: "user already exit with this email and username" })
        }

        const uniqueId = new ShortUniqueId({length: 4, dictionary: "number"})
        const currentUniqueId = uniqueId?.rnd()

        await Otp.create({ email, otp: currentUniqueId, otp_expiry: Date.now() + 20 * 60 * 1000 });

        await sendOtpForUserSignup({...req?.body, otp : currentUniqueId})

        return res?.status(200)?.json({status: true, message: "Otp Send Successfully"})

});

router.post('/verify-signup-otp', async function(req, res, next){
    console.log("call")
    try{
        
      const { name, username, email, password, otp } = req.body;
      
      const otpMatch = await Otp?.findOne({email, otp})

      if(!otpMatch) {
        return res.status(400)?.json({status: false, message: "Invalid Otp"})
      }

      //check otp expiry
      if(otpMatch?.otp_expiry <Date?.now()) {
        await Otp?.deleteOne({email, otp})
        return res?.status(400)?.json({status: false, message: "Otp Expired"})  
      }
     
      //delete otp
      await USER?.deleteOne({email, otp})
      console.log("enter")
      //hash password
      const hash = await bcrypt?.hash(password, 12)
      
      //Create New User
        const user = new USER({
            name,
            username,
            email,
            password: hash
        })

        user.save()
            .then(user => { return res.json({ status: true, message: "saved successfully" }) })
            .catch(err => { console.log(err) })
   

    }catch(e){
       return res.status(400).json({data:[],status:false,message:"server error"})
    }
})

router.post('/signin', async function (req, res, next) {

    const { email, password } = req.body

    if (!email || !password) {
       return res.status(422).json({ error: "pls add all the fields" })
    }

    let user = await USER.findOne({ $or: [{ email: email }, { username: email }] })

    if(!user) {
        return res?.status(400)?.json({status: false, message: " User Not Exit", data: []})
    }

    if(user?.password) {
        const passwordMatch = bcrypt?.compare(password, user?.password)

        if(passwordMatch) {
            sendToken(user, 200, res, "user Login successfully")
        }else{
            return res?.status(400)?.json({status: false, message: "Incorrect Password", data: []})
        }
    }

})

router.post('/findUser',requireLogin,function(req,res,next){
    var id = req.body.id
    console.log(id)
    USER.findOne({_id:id}).then((s)=>{
        if(s){
        res.json({data:s,status:true})
        // console.log(s)
        }
        else {
            console.log("error")
            res.json({data:{},status:false})
         }
    })
    console.log("ok")
})

router.get('/get-user-details-by-userid/:id',function(req,res,next){
    var userId = req.params.id
    USER.findOne({_id:userId}).then((s)=>{
        if(s){
        res.json({data:s,status:true})
        }
        else {
            console.log("error")
            res.json({data:{},status:false})
         }
    })
})

router.post('/createpost', requireLogin, (req, res, next) => {
    console.log("auth")
})

router.get('/search-users/:pattern',requireLogin, async function(req, res, next){
    try{
        let pattern = req.params.pattern

        let result = await USER.find({$or:[{name:{$regex:pattern}},{username:{$regex:pattern}}]})

        if(result){
            res.status(200)?.json({message:'Users fetch sucessfully', status:true, data:result})
        }else{
            res.status(401)?.json({message:'Users fetch Unsucessfully', status:false, data:result})
        }
    }catch(e){
        res.status(400)?.json({message:'server Error', status:false, data:[]})
    }
})

router.get('/check-user',requireLogin, function(req, res, next){
    try{
        if(req.user){
            res.status(200).json({status:true, message:'It is a valid user!', data:req.user})
        }else{
            res.status(401).json({status:false, message:'It is not a valid user!', data:[]})
        }
    }catch(e){
        res.status(400).json({status:false, message:'server error', data:[]})
    }
})

router.post('/continue-with-google',async function(req, res, next){
    try{
        const {email_verified, clientId, email, name, picture, given_name} = req.body

        if(email_verified) {

            let user = await USER.findOne({email:email})

            if(user) {
                // mean's user want's to signin
                sendToken(user, 200, res, "user Login successfully")
            }else{
                // mean's user wnat's to signup
                
               let username = await generateUserName(given_name)
                
               let password = email+clientId

               let newUser = new USER({
                    name,
                    username,
                    email,
                    password,
                    profilepic: picture
               })

               let result = await newUser.save()
            //    console.log("result: ", result)
               if(result) {
                sendToken(result, 200, res, "User LOgin Successfully with google")
               }else {
                return res?.status(401)?.json({status: false, message: "something went's wrong", data: []})
               }
            }
        }

    }catch(e){
        console.log("error", e)
        res.status(400).json({status:false, message:'server error', data:[]})
    }
})

router.post('/send-otp-for-forget-password',async function(req, res, next){
    try{
        const {email} = req.body

        let user = await USER.findOne({ $or: [{ email: email }, { username: email }] })

        if (!user) {
            return res.status(422).json({ error: "Email Doesn't exit please signup your account" })
        }

        let uniqueId = new ShortUniqueId({length:4,dictionary:'number'})
        let currentUniqueId = uniqueId.rnd()

        await Otp.create({ email, otp: currentUniqueId, otp_expiry: Date.now() + 20 * 60 * 1000 });

        await sendOtpForUserSignup({...user, otp: currentUniqueId, email})

        return res?.status(200)?.json({status: true, message: "Otp Send Successfully"})

    }catch(e){
        console.log("error", e)
        res.status(400).json({status:false, message:'server error', data:[]})
    }
})

router.post('/change-password-by-forget-password', async function(req, res, next){
    try{
        const {otp, email, password} = req.body

        let otpMatch = await Otp.findOne({email, otp})

        if(!otpMatch) {
            return res.status(400)?.json({status: false, message: "Invalid Otp"})
          }
    
        //check otp expiry
        if(otpMatch?.otp_expiry <Date?.now()) {
        await Otp?.deleteOne({email, otp})
        return res?.status(400)?.json({status: false, message: "Otp Expired"})  
        }

        //delete otp
        await USER?.deleteOne({email, otp})

        let hashPassword = await bcrypt.hash(password, 12)

        let result = await USER.updateOne({email: email}, {$set:{password:hashPassword}})

        if(result) {
            return res?.status(200)?.json({status: true, message: "Password Change Succesfully", data: result})
        }else {
            return res?.status(401)?.json({status: false, message: "something went's wrong", data: []})
        }

    }catch(e) {
        console.log("error", e)
        res.status(400).json({status:false, message:'server error', data:[]})
    }
})


module.exports = router;