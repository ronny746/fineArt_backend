const router = require("express").Router();
const jwt = require('jsonwebtoken');
const CategoryModel = require('../models/category'); // Adjust the path accordingly
const secret_key = "Rana";


// Middleware to verify the token
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


// Endpoint to add a new category (protected with token verification)
router.post('/add-category', verifyToken, async (req, res) => {
    try {
        const { title, in_navbar } = req.body;

        const newCategory = new CategoryModel({
            title,
            in_navbar,
        });

        const savedCategory = await newCategory.save();
        res.status(201).json({ success: true, category: savedCategory });
    } catch (error) {
        console.error('Error adding category:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add category.' });
    }
});

router.get('/get-categories', async (req, res) => {
    try {
        const categories = await CategoryModel.find();

        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
});

router.search('/search-categories', async (req, res) => {
    try {
        const { query } = req.query;

        // Perform a case-insensitive search for categories containing the query
        const categories = await CategoryModel.find({ title: { $regex: new RegExp(query, 'i') } });

        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error('Error searching categories:', error.message);
        res.status(500).json({ success: false, message: 'Failed to search categories.' });
    }
});

module.exports = router;

