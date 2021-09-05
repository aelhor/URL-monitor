const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const { checkAuth } = require('./auth')
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox2cac0d5702b543c48d5fa08a4653d666.mailgun.org';
const apiKey = '48d589de2be9cef4061a8b8e0bae8b0f-fb87af35-6af10f8c'
const mg = mailgun({apiKey: apiKey, domain: DOMAIN});
require('dotenv').config('../.env')


router.get('/send' , async(req, res)=> { 

})

router.post('/signup',async (req, res)=> { 
    const {email, password, userName} = req.body
    // CHECK is the user already exist
    try{
        const signinUser = await User.findOne({email : email})
        if (signinUser) { 
            return res.status(409).send('User already exist')
        }   
        else { 
            const confirmToken = jwt.sign({email :email , password : password , userName:userName}, process.env.JWT_SECRET_KEY, {expiresIn : '1d'})
                const data = {
                    from: 'URL Monitor<aelhor90@gmail.com>',
                    to: email,
                    subject: 'Confirm email',
                    html: 
                    `<html>
                        <p> please click the button to confirm your email </p>
                        <button> 
                            <a href= 'http://localhost:5000/confirmEmail?confirmToken=${confirmToken}'>confirm email now</a>
                        </button>
                    </html>`,
                };
                mg.messages().send(data,  (error, body)=>{
                    if (error) {
                        console.log(error)
                    }
                    console.log('body : ',body)
                    return res.send(`email sent to ${email}`)
                });
        }
    }
    catch(error){
        res.status(503).send(error.message)
    }
})

router.get('/confirmEmail' , async(req, res)=> { 
    const {confirmToken} = req.query
    if (confirmToken == null) return res.status(401).send('Not auth')
    try {
        let decoded =  jwt.verify(confirmToken, process.env.JWT_SECRET_KEY);
        // store user info in the db 
        if (!decoded) { 
            return res.send('something went wrong : "invalid confirm Token"')
        }
        try {
            const hased = await bcrypt.hash(decoded.password, 10) 
            // save user in db  
            try{
                const signupToken = jwt.sign({email :decoded.email}, process.env.JWT_SECRET_KEY)
                const newUser =  new User({
                    email :decoded.email, 
                    userName : decoded.userName,
                    password : hased, 
                })
                const saveduser = await newUser.save()
                res.redirect(process.env.CLIENT_URL +'/public/Home.html')
                return res.status(200).json({
                    message : 'User created and verified successfully', 
                    newUser : {
                        id : newUser._id ,
                        userName : newUser.userName ,
                        email : newUser.email,
                        signupToken :signupToken
                    },
                })
            }
            catch(error) { 
                res.status(409).send(error.message) //  saving user error
            }
        
        } catch (error) {
            return res.status(500).send(error.message)
        }
    } 
    catch(err) {
            res.status(403).send(err)
    }
})

router.post('/login', async(req, res)=>{
    const {email, password} = req.body
    try{
        // check if the user email is exist
        const user = await User.findOne({ email : email })
        if (user){
            // verify the password 
            bcrypt.compare(password, user.password, (error, result)=>{ 
                if (error){
                    return res.status(422).send(error)
                }
                if (result){
                    // password is correct 
                    const token = jwt.sign({email : user.email}, process.env.SECRET_KEY, {expiresIn : maxAge })
                    // res.cookie('jwt', token ,{httpOnly : true, maxAge : maxAge}) // not working 
                    return res.status(200).json({
                        userName : user.userName , 
                        id : user._id,
                        token : token
                    })
                }
                return res.status(403).send('Invalid password ')
            })
        }
        else{
            return res.status(404).send('User Not Found')
        }
    }
    catch(err){
        res.status(404).send(err)
    }
})


module.exports = router
// 