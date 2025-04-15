require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = () => {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err);
            process.exit(1); 
        });
};

module.exports = connectDB;
