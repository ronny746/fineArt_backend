const router = require("express").Router();
const User = require("../models/user");
const accountSid = 'AC608c293f7cd37e13823f6a4256a9d25f';
const authToken = 'ddbd5c157d5f8e27c4de68ed0771ac2e';
const twilioPhoneNumber = '+12058289919';
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const secret_key = "Rana";

//REGISTER
router.post("/register", async (req, res) => {
    // try {
    //     const mobileNumber = req.body.mobileNumber;

    //     // Check if user already exists with the given mobile number
    //     const existingUser = await User.findOne({ mobile: mobileNumber });

    //     if (existingUser) {
    //         // User already exists, you might want to handle this case appropriately
    //         return res.status(400).json({ success: false, message: 'User with this mobile number already exists.' });
    //     }

    //     // User does not exist, generate OTP and create a new user
    //     const otp = Math.floor(100000 + Math.random() * 900000);
    //     const newUser = new User({
    //         name: req.body.name,
    //         mobile: mobileNumber,
    //         otp: otp
    //     });

    //     const user = await newUser.save();

    //     // Use Twilio to send OTP
        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: twilioPhoneNumber,
            to: "+91 " + mobileNumber
        })
    //         .then(message => {
    //             console.log(`OTP sent successfully! ${otp}: ${message.sid}`);
    //             res.status(200).json({ success: true, message: 'OTP sent successfully.', data: user });
    //         })
    //         .catch(error => {
    //             console.error('Error sending OTP:', error.message);
    //             res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    //         });
    // } catch (error) {
    //     console.error('Error creating user or sending OTP:', error.message);
    //     res.status(500).json({ success: false, message: 'Failed to create user or send OTP.' });
    // }
    const otp = Math.floor(100000 + Math.random() * 900000);
    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
});

// Verify OTP

router.post("/verify-otp", async (req, res) => {
    try {
        const mobileNumber = req.body.mobileNumber;
        const enteredOTP = req.body.otp;

        // Find the user with the given mobile number
        const user = await User.findOne({ mobile: mobileNumber });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if the entered OTP matches the stored OTP
        if (enteredOTP !== user.otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        // OTP is valid, you can update the user status or perform other actions

        // For example, update the user's status to indicate successful verification
        user.isVerify = true;
        await user.save();

        // You can also generate a JWT token and send it back to the client for authentication
        const token = jwt.sign({ userId: user._id }, secret_key);

        res.status(200).json({ success: true, message: "OTP verification successful.", token, data: user });
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        res.status(500).json({ success: false, message: "Failed to verify OTP." });
    }
});
//LOGIN
router.post("/login", async (req, res) => {
    try {
        const mobileNumber = req.body.mobileNumber;


        // Find the user with the given mobile number
        const user = await User.findOne({ mobile: mobileNumber });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if the user is verified (you may have a 'isVerified' field in your User model)
        const otp = Math.floor(100000 + Math.random() * 900000);

        user.otp = otp;
        await user.save();
        // const user = await newUser.save();

        // Use Twilio to send OTP
        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: twilioPhoneNumber,
            to: "+91 " + mobileNumber
        })
            .then(message => {
                console.log(`OTP sent successfully! ${otp}: ${message.sid}`);
                res.status(200).json({ success: true, message: 'OTP sent successfully.', data: user });
            })
            .catch(error => {
                console.error('Error sending OTP:', error.message);
                res.status(500).json({ success: false, message: 'Failed to send OTP.' });
            });
    } catch (error) {
        console.error('Error creating user or sending OTP:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create user or send OTP.' });
    }
});
module.exports = router;
