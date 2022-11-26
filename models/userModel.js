const mongoose = require('mongoose');

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
        minLength: [6, "Short Password"],
        maxLength: [23, "Password too long"]
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
    phone: {
        type: String,
        default : "bio",
        maxLength: [250, "Bio too long"]
    }
} , {
    timestamps : true
});

const User = mongoose.model("User", userSchema);

module.exports = User;