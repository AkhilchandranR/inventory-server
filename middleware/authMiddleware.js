const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = asyncHandler(async(req,res,next)=>{

    //verify the token 

    try {
        const token = req.cookies.token;
        if(!token){
            res.status(401)
            throw new Error("Not authorised, please login");
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        //get user_id from token
        const user = await User.findById(verified.id).select("-password");
        
        //if there is no user
        if(!user){
            res.status(401)
            throw new Error("User not found");
        }
        req.user = user;
        next();

    } catch (error) {
        res.status(401)
        throw new Error("not authorised");
    }
})

module.exports = protect;