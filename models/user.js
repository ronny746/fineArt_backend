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
        email: {
            type: String,
            require: false,
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
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
