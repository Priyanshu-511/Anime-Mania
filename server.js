const express = require('express');
const router = require('./routers/route');
const connectDb = require('./database/userdb');
const path = require('path');
const passport = require('./middleware/auth')
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine','ejs');
app.set('views','./views');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(passport.initialize());

app.use('/',router);

connectDb();

app.listen(PORT,(err)=>{
    if (err) {
        console.log('error occured on PORT');
    } else {
        console.log(`server is running...`);
        console.log(`open http://localhost:${PORT}`)
    }
});