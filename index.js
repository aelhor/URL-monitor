const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const userRoute = require('./routes/userRoute')
const checkRoute = require('./routes/checkRoute')

require('dotenv').config()
app.use(cors())
app.use(express.json()) 

app.use(express.static('public'))
// routes
app.use('/', userRoute)
app.use('/', checkRoute)



// Handle Not Found Routes 
app.use((req, res, next)=> { 
    const error = new Error(`${req.originalUrl} Page Not Found... `)
    res.status(404)
    next(error)
})

app.use((error, req, res, next)=> { 
    //check if the status is still 200 means that other routh threw that err so we will make it 500 
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode  
    res.status (statusCode)
    res.json({ 
        message : error.message,
        error : error,  
        // stack :process.env.NODE_ENV === 'PRODUCTION ' ? 'Babe, hi': error.stack // hlpful for debuging tellingg u where the err is   
        }
    )}
)


mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser : true,
        useUnifiedTopology: true  
    }, 
    ()=> console.log('db connected')
)

app.listen( process.env.PORT, ()=>  console.log(`server on ${ process.env.PORT}`) )