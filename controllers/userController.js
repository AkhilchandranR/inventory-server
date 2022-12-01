const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

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

//logout user
const logout = asyncHandler(async(req,res) =>{

    res.cookie("token","", {
        path:"/",
        // httpOnly:true,
        expires: new Date(0), // current second
        // sameSite: "none",
        // secure: true
    });

    return res.status(200).json({
        message : "Successfully logged out"
    })

})

//get user data
const getUser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);

    if(user){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            phone: user.phone,
            bio: user.bio,
        })
    }else{
        res.status(400);
        throw new Error("User not found");
    }
})

//get login status
const loginStatus = asyncHandler(async(req,res)=>{
    const token = req.cookies.token;
    if(!token){
        return res.json(false);
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified){
        return res.json(true);
    }

    return res.json(false);
})

//updateuser
const updateUser = asyncHandler(async(req,res)=>{

    const user = await User.findById(req.user._id);
    if(user){
        const { name, email, photo, phone, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();

        res.status(200).json({
            id : updatedUser._id,
            name: updatedUser.name,
            email : updatedUser.email,
            phone : updatedUser.phone,
            bio: updatedUser.bio,
            photo : updatedUser.photo
        })
    }
    else{
        res.status(404);
        throw new Error("user not found");
    }
})

const changePassword = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);

    if(!user){
        res.status(404);
        throw new Error("user not found");
    }

    const { oldPassword, password } = req.body;
    if(!oldPassword || !password){
        res.status(400);
        throw new Error("please add old and new password");
    }

    //check if passwords matches
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    //save new password if matches
    if(user && isPasswordCorrect){
        user.password = password;
        await user.save();
        res.status(200).send("Password changed successfully");
    }else{
        res.status(400);
        throw new Error("Password is incorrect");
    }
})

const forgotPassword = asyncHandler(async(req,res)=>{
    const { email } = req.body;
    const user = await User.findOne({email});

    if(!user){
        res.status(404);
        throw new Error("User not found");
    }

    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    //hash the token before saving it to db
    const hashedToken = crypto.createHash("sha256")
    .update(resetToken).digest("hex");

    //save token to db
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30*(60*1000) //30 miniutes
    }).save();

    //construct reset url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    //reset email
    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use your url below to reset your password</p>
    <p>This reset link is valid only for 30 minutes</p>

    <a href=${resetUrl} clicktracking=off>${resetUrl}</href>

    <p>Regards</p>
    
    `;

    const subject = "Password reset request";
    const send_to = user.email;
    const send_from = process.env.EMAIL_USER;

    try{
        await sendEmail(subject,message,send_to,send_from);
        res.status(200).json({
            success: true,
            message: "Reset email send"
        })
    }catch(err){
        res.status(500);
        throw new Error("Email not send");
    }
})


module.exports = {
    registerUser : registerUser,
    loginUser : loginUser,
    logout: logout,
    getUser : getUser,
    loginStatus : loginStatus,
    updateUser : updateUser,
    changePassword : changePassword,
    forgotPassword : forgotPassword
}