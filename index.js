const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorMiddleware');


const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.use(cors({ origin:true, credentials:true }));

app.get('/', (req,res)=>{
    res.send("HomePage");
});

//routes middleware users
app.use("/api/users", userRoute);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
        .then(()=>{console.log("Db started")})
        .catch((e)=>{console.log(e)});



app.listen(PORT, ()=>console.log(`Server started at port ${PORT}`));

