const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name : {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type : String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Short Password"]
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default : "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
    },
    phone: {
        type: String,
        default : "+91"
    },
    bio: {
        type: String,
        default : "bio",
        maxLength: [250, "Bio too long"]
    }
} , {
    timestamps : true
});

//encrypt the password 
userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
    
})

const User = mongoose.model("User", userSchema);

module.exports = User;