const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const registerUser = asyncHandler(async(req,res) =>{

    const { name,email,password } = req.body;
    //validattion
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
        password : password
    })

    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            phone: user.phone,
            bio: user.bio
        })
    }else{
        res.status(400)
        throw new Error("Invalid user data");
    }
})

module.exports = {
    registerUser : registerUser
}