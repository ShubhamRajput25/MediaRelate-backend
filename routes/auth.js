var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("user");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const requireLogin = require('../middlewares/requireLogin');
/* GET home page. */

router.get('/', function (req, res, next) {
    res.send("hello")
});


router.post('/signup', function (req, res, next) {

    const { name, username, email, password } = req.body;

    if (!name || !email || !username || !password) {
        res.status(422).json({ error: "pls add all the fields" })
    }

    USER.findOne({ $or: [{ email: email }, { username: username }] }).then((savedUser) => {

        if (savedUser) {
            console.log(savedUser)
            return res.status(422).json({ error: "user already exit with this email and username" })
        }

        bcrypt.hash(password, 12).then((hashedpassword) => {

            const user = new USER({
                name,
                username,
                email,
                password: password
            })

            user.save()
                .then(user => { res.json({ status: true, message: "saved successfully" }) })
                .catch(err => { console.log(err) })

        })


    })

});

router.post('/signin', function (req, res, next) {

    const { email, password } = req.body
    if (!email || !password) {
        res.status(422).json({ error: "pls add all the fields" })
    }
 
    bcrypt.hash(password, 12).then((hashedpassword) => {
        USER.findOne({ $and: [{ $or: [{ email: email }, { username: email }] }, { password: password }] }).then((savedUser) => {
            if (savedUser) {
                // console.log(savedUser)
                // res.status(200).json({status:true,message:"user hai bhai database me",data:savedUser})
                const token = jwt.sign({ _id: savedUser.id }, process.env.JWT_SECRET)

                console.log(token)
                res.json({status:true,token,message:"successfully login",data:savedUser })
            } else {
                res.status(200).json({ status: false, message: "user nhi hai bhai database me", data: [] })
            }

        })
    })


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