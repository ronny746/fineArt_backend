const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        mobile: {
            type: String,
            require: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        otp: {
            type: String,
            default: "123456",
        },
        isVerify: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
