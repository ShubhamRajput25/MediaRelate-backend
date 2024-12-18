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
 
    // bcrypt.hash(password, 12).then((hashedpassword) => {
    //     USER.findOne({ $and: [{ $or: [{ email: email }, { username: email }] }, { password: password }] }).then((savedUser) => {
    //         if (savedUser) {
    //             // console.log(savedUser)
    //             // res.status(200).json({status:true,message:"user hai bhai database me",data:savedUser})
    //             const token = jwt.sign({ _id: savedUser.id }, process.env.JWT_SECRET)

    //             console.log(token)
    //             res.json({status:true,token,message:"successfully login",data:savedUser })
    //         } else {
    //             res.status(200).json({ status: false, message: "user nhi hai bhai database me", data: [] })
    //         }

    //     })
    // })


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


module.exports = router;