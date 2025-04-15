const express = require('express')
const router = express.Router()
const { addUser ,loginUser,upload , deleteUsers ,encrypt,decrypt} = require('../controllers/user')
const auth = require('../middleware/auth')


router.post('/random',addUser)
router.delete('/random', deleteUsers)

router.post('/login', loginUser)

router.get('/profile',auth,(req,res)=>{
    res.status(200).json({message:'welcome',user:req.user})
})

router.post('/encrypt',encrypt)
router.post('/decrypt',decrypt)


router.post('/upload',upload.single('myfile'),(req,res)=>{
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    res.json({
        message: 'File uploaded successfully!',
        file: req.file
    })
})

module.exports = router