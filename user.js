const User = require('../model/user');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto-js')
const multer = require('multer');
const path = require('path');

const addUser = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password,10)

        const newUser = new User({
            name,
            username,
            password:hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User added successfully', user: newUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add user' });
    }
};

 const loginUser = async(req,res)=>{
    try{
        const {username , password} = req.body
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = await User.findOne({username})

        if(!user) return res.status(500).json(" user not found")

            const isMatch = await bcrypt.compare(password,user.password)
        if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

            const token = jwt.sign({userId:user._id,username:user.username},
                process.env.SECRET_KEY,{expiresIn:"1h"}
            )

        res.status(200).json(token)

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
 }


 const deleteUsers = async(req,res)=>{
    const user = await User.deleteMany({})
    console.log("Old users deleted");

    res.json(user)
 }
 
const encrypt = async(req,res)=>{
    const{text} = req.body

    if(!text) return res.status(500)

        const encrypted = crypto.AES.encrypt(text,process.env.SECRET_KEY).toString()
        res.status(200).json({original:text , encrypted})
}

const decrypt = async(req,res)=>{
    const {encrypted} = req.body

    const bytes = crypto.AES.decrypt(encrypted,process.env.SECRET_KEY)

    const decrypted = bytes.toString(crypto.enc.Utf8)

    res.json({
        encrypt:encrypted,
        decrypt:decrypted
    })
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        const uniquesuffix = Date.now() + '-' +Math.round(Math.round(Math.random()*1E9))
        const ext= path.extname(file.originalname)
        cb(null,file.fieldname+'-'+uniquesuffix+ext)
    }
})

const upload = multer({storage:storage})

module.exports = {  addUser ,loginUser,deleteUsers , encrypt , decrypt , upload};
