const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const Check = require('../models/checkModel')
const authSubSchema = require('../models/checkModel')

const { checkAuth } = require('./auth')
const mailgun = require("mailgun-js");
const { route } = require('./userRoute')
const DOMAIN = 'sandbox2cac0d5702b543c48d5fa08a4653d666.mailgun.org';
const apiKey = '48d589de2be9cef4061a8b8e0bae8b0f-fb87af35-6af10f8c'
const mg = mailgun({apiKey: apiKey, domain: DOMAIN});
require('dotenv').config('../.env')


// craeet a check 'POST req' 
router.post('/createCheck' , async(req, res)=> { 
    const {name , url, protocol, path, port, webhook, timeOut, interval,
        threshold, authUserName, authpassword , httpHeaders  , 
        assertStatusCode , tags, ignoreSSL , paused } = req.body
    try {
        const newCheck =  new Check({
            name : name , 
            url : url , 
            protocol :protocol , 
            path : path,
            port : port , 
            webhook : webhook , 
            timeOut : timeOut , 
            interval : interval , 
            threshold : threshold , 
            authentication: {
                userName  : authUserName, 
                password : authpassword
            },
            // httpHeaders  : httpHeaders , /// MAP 
            assert :{
                statusCode : assertStatusCode
            },
            tags : tags,
            ignoreSSL : ignoreSSL  ,
            paused : paused
            
        })
        const savedcheck = await newCheck.save()
        res.json({
            msg  : 'check created ',
            check : savedcheck
        })
    } catch (error) {
        res.send(error)
    }
})

// edit pause delete checks 

// edit check 
router.put('/editCheck', async(req, res)=> { 
    const {userId, name , newName, url, protocol, path, port, webhook, timeOut, interval,
        threshold, authUserName, authpassword , httpHeaders  , 
        assertStatusCode , tags, ignoreSSL } = req.body
    try {
        const updatedCheck = {
            userId : userId ,
            name : newName , 
            url : url , 
            protocol :protocol , 
            path : path,
            port : port , 
            webhook : webhook , 
            timeOut : timeOut , 
            interval : interval , 
            threshold : threshold , 
            authentication: {
                userName  : authUserName, 
                password : authpassword
            },
            // httpHeaders  : httpHeaders , /// MAP 
            assert :{
                statusCode : assertStatusCode
            },
            tags : tags,
            ignoreSSL : ignoreSSL
        }
        const options =  { 
            new : true ,
        }
        // const user = await User.findById(userId)
        // if(!user) { 
        //     return res.send('user not exists')
        // }
        const updated = await Check.findOneAndUpdate({name : name}, { $set: updatedCheck} , options) 
        res.json({
            message : updated ? 'check updated sucessfully ' : 'can not find any check with this name ' , 
            updatedCheck : updated
        })
    
    } catch (error) {
        res.send(error)
    }
})

// pause 
router.get('/pauseCheck', async(req, res)=> { 
    const {name , paused } = req.body
    try {
        const options =  { 
            new : true ,
        }
        const pausedChick = await Check.findOneAndUpdate({name : name}, { $set: { paused : paused }} , options) 
        res.json({
            message : pausedChick? `check ${paused ? 'paused' : 'resumed'} sucessfully ` : 'can not find any check with this name ' , 
            pausedCheck : pausedChick
        })
    
    } catch (error) {
        res.send(error)
    }
})

router.delete('/deleteCheck', async(req, res)=> { 
    const {name } = req.body
    try {
       
        const deleted = await Check.findOneAndDelete({name : name}) 
        res.json({
            message : deleted ? 'deleted sucessfully ' : 'can not find any check with this name ' , 
            deletedCheck : deleted
        })
    
    } catch (error) {
        res.send(error)
    }
})


// get all the checks
router.get('/', async (req, res, next) => {
    const {userId} = req.body
    try {
      const checks = await Check.findOne({userId : userId})
      res
        .status(200)
        .send(checks)
    } catch (error) {
      next(error);
    }
});
  
router.get('/test', async (req, response, next) => {
    axios.interceptors.request.use(function (config) {
      config.metadata = { startTime: new Date() }
      return config;
    }, function (error) {
      return Promise.reject(error);
    });
  
    axios.interceptors.response.use(function (response) {
      response.config.metadata.endTime = new Date()
      response.duration = response.config.metadata.endTime - response.config.metadata.startTime
      return response;
    }, function (error) {
      return Promise.reject(error);
    });
  
    let visit = {}
    
    axios.get(URL_TO_CHECK)
      .then((response) => {
        visit = {
          timestamp: new Date(),
          responseDuration: response.duration,
          successful: true
        };
      })
      .catch((error) => {
        visit = {
          timestamp: new Date(),
          successful: false
        };
        console.log(error);
        reportError(error);
      })
      .then(async function () {
        // always executed
        try {
          await insertVisit(visit);
        } catch (error) {
          next(error);
        }
  
        response.status(200).send(visit).end();
      });
  });
  




module.exports = router
