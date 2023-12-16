const router = require("express").Router();
const User = require("../models/user");
const accountSid = 'AC608c293f7cd37e13823f6a4256a9d25f';
const authToken = '08617c75beb2fdee4448a400b942222c';
const twilioPhoneNumber = '+12058289919';
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

        if (existingUser) {
            // User already exists, you might want to handle this case appropriately
            return res.status(400).json({ success: false, message: 'User with this mobile number already exists.' });
        }

        // User does not exist, generate OTP and create a new user
        const otp = Math.floor(100000 + Math.random() * 900000);
        const newUser = new User({
            name: req.body.name,
            mobile: mobile,
            otp: otp
        });

        const user = await newUser.save();

        // Use Twilio to send OTP
        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: twilioPhoneNumber,
            to: "+91 " + mobile
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
        user.otp = "";
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
        const users = await User.find();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch users." });
    }
});

router.get("/getProfile",verifyToken,async (req, res) => {
    try {
        const userId = req.userId;
        const users = await User.findById(userId);
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


module.exports = router;
