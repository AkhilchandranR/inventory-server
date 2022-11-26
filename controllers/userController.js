const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"1d"});
}

const registerUser = asyncHandler(async(req,res) =>{

    const { name,email,password } = req.body;

    //validation
    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please fill in all the fields");
    }
    if(password.length < 6){
        res.status(400)
        throw new Error("Password must be upto 6 characters");
    }

    //check if email is unique
    const userExists = await User.findOne({email});
    if(userExists){
        res.status(400)
        throw new Error("Email has already been registered");
    }

    //create new user otherwise
    const user = await User.create({
        name : name,
        email : email,
        password : password,
    })

    if(user){
        //generate token for the user
        const token = generateToken(user._id);

        //send http-only cookie
        res.cookie("token", token, {
            path:"/",
            httpOnly:true,
            expires: new Date(Date.now() + 1000*86400), // 1day
            sameSite: "none",
            secure: true
        })

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            phone: user.phone,
            bio: user.bio,
            token: token
        })
    }else{

        res.status(400)
        throw new Error("Invalid user data");

    }

})

module.exports = {
    registerUser : registerUser
}