const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

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

        res.status(201).cookie("token", token, {
            path:"/",
            // httpOnly:true,
            expires: new Date(Date.now() + 1000*86400), // 1day
            // sameSite: "none",
            // secure: true
        }).json({
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

//login function 
const loginUser = asyncHandler(async(req,res) =>{
    const { email,password } = req.body;

    //validae requests
    if(!email || !password){
        res.status(400);
        throw new Error("Please add an email and password");
    }

    //check if user exists
    const user = await User.findOne({email});
    if(!user){
        res.status(400);
        throw new Error("User not found");
    }

    //if user exists , check for password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    const token = generateToken(user._id);
    res.cookie("token", token, {
        path:"/",
        // httpOnly:true,
        expires: new Date(Date.now() + 1000*86400), // 1day
        // sameSite: "none",
        // secure: true
    })

    //if password is correct login user
    if(user && isPasswordCorrect){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            phone: user.phone,
            bio: user.bio,
            token: token
        })
    }else{
        res.status(400);
        throw new Error("Invalid email or password");
    }

})

module.exports = {
    registerUser : registerUser,
    loginUser : loginUser
}