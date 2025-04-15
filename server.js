const express = require('express')
const app = express()
const port = 3000
app.use(express.json())
const connectDB = require('./config/db')
const userRoutes = require('./routes/user')
connectDB()
app.use('/api',userRoutes)
require('dotenv').config()
// const nodemailer = require('nodemailer');

const a = "hello world"
const buffer = Buffer.from(a)
console.log(buffer)

const crypto = require('crypto-js')

const p = "hari prasanth"

const hash = crypto.SHA256(p).toString()
console.log(hash)

app.listen(port ,()=>{
    console.log('server created')
})