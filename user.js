// Required modules
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto-js');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');

// Add a new user to the database
const addUser = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User added successfully', user: newUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add user' });
    }
};

// Login user and return JWT token
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(500).json(" user not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json(token);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Delete all users
const deleteUsers = async (req, res) => {
    const user = await User.deleteMany({});
    console.log("Old users deleted");

    res.json(user);
};

// Encrypt given text using AES
const encrypt = async (req, res) => {
    const { text } = req.body;

    if (!text) return res.status(500);

    const encrypted = crypto.AES.encrypt(text, process.env.SECRET_KEY).toString();
    res.status(200).json({ original: text, encrypted });
};

// Decrypt the given AES encrypted text
const decrypt = async (req, res) => {
    const { encrypted } = req.body;

    const bytes = crypto.AES.decrypt(encrypted, process.env.SECRET_KEY);
    const decrypted = bytes.toString(crypto.enc.Utf8);

    res.json({
        encrypt: encrypted,
        decrypt: decrypted
    });
};

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Moment time and timezone examples
const currentTime = moment().subtract(5, 'hours').format('D-M-Y h-m-s');
console.log(currentTime);

const startdate = moment();
const dob = moment('1999-04-04');
const difff = dob.diff(startdate, 'years');
console.log(difff);

console.log("newyork", moment().tz('America/New_York').format('YYYY-MM-DD HH-MM-SS'));
console.log('tokio', moment().tz('Asia/TOkio').format('YYYY-MM-DD HH-MM-SS'));

// Nodemailer email sending setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

const message = {
    from: process.env.EMAIL,
    to: "srihariprasanth123@gmail.com",
    subject: "testing node mailer",
    text: "testing ok"
};

transporter.sendMail(message, (err, info) => {
    if (err) console.error(err);
    console.log(info.response);
});

// Cron job to log every minute
cron.schedule('* * * * *', () => {
    console.log("one minute over");
});

// Exporting all functions
module.exports = { addUser, loginUser, deleteUsers, encrypt, decrypt, upload };

