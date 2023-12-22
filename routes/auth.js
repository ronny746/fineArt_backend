const router = require("express").Router();
const User = require("../models/user");
const accountSid = 'AC786f30725b2eb832abe2b7dd32cfa7c7';
const authToken = 'be1ff04fb92c7d03f240287e8c1a5fd0';
const twilioPhoneNumber = '+14695357349';
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const secret_key = "Rana";

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
    }

    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        req.userId = decoded.userId;
        next();
    });
};

//REGISTER
router.post("/register", async (req, res) => {
    try {
        const mobile = req.body.mobileNumber;

        // Check if user already exists with the given mobile number
        const existingUser = await User.findOne({ mobile: mobile });

        if (existingUser && existingUser.isVerify == true) {
            return res.status(400).json({ success: false, message: 'User with this mobile number already exists.' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Use Twilio to send OTP
        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: twilioPhoneNumber,
            to: '+91 ' + mobile
        })
            .then(message => {
                console.log(`OTP sent successfully! ${otp}: ${message.sid}`);

                // If OTP is sent successfully, proceed with user registration
                if (existingUser) {
                    existingUser.otp = otp;
                    return existingUser.save();

                } else {
                    const newUser = new User({
                        name: req.body.name,
                        mobile: mobile,
                        email : req.body.email,
                        otp: otp
                    });

                    return newUser.save();
                }
            })
            .then(user => {
                // User registered successfully after OTP is sent
                res.status(200).json({
                    success: true,
                    message: 'OTP sent successfully. User registered.',
                    data: { user }
                });
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
        console.log(enteredOTP);
        console.log(user.otp);
        if (enteredOTP !== user.otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }

        // OTP is valid, you can update the user status or perform other actions

        // For example, update the user's status to indicate successful verification
        user.isVerify = true;
        user.otp = " ";
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
        console.log(mobileNumber);

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
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select('-products');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch users." });
    }
});

router.get("/getProfile", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const users = await User.findById(userId).select('-products');
        // const users = await User.findById(userId)
        // .populate({
        //     path: 'products',
        //     populate: {
        //         path: 'category subcategory',
        //     },
        // });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch user." });
    }
});


router.put('/user/update', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const updatedUserData = req.body;
        console.log(userId);
        // Find the user by ID and update the user data
        const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                success: false
                , message: "User not found."
            });
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ success: false, message: "Failed to update user." });
    }
});
router.delete('/user/delete', verifyToken, async (req, res) => {
    try {
        const userId = req.userId; // Extracted from the token during verification
        // Find the user by ID and delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
});


module.exports = router;
