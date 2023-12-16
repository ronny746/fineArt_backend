const router = require("express").Router();
const jwt = require('jsonwebtoken');
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

  
  module.exports = router;