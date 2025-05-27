const mongoose = require('mongoose');
require('dotenv').config()

MONGO_URL = process.env.MONGO_URL;

const connectDb = async()=>{
    try {
        await mongoose.connect(MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
        console.log(`mongodb is connected...`);
    } catch (err) {
        console.log(`error occured in connection of mongoDb`);
        process.exit(1);
    }
}

module.exports = connectDb;