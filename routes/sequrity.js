const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const secret_key = "Rana";




const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json('Access denied. No token provided');
    }
    const user = token.split(" ");
    const xx = user[1];
    try {
      const decoded = jwt.verify(xx, secret_key); // Replace 'secret_key' with your own secret key
  
      // Attach the decoded user information to the request object
      req.user = decoded;
  
      next(); // Call the next middleware or route handler
    } catch (err) {
      res.status(401).json('Invalid token');
    }
  };
  
  