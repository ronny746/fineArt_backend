const router = require("express").Router();
const jwt = require('jsonwebtoken');
const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/sub_category');
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
// Endpoint to add a new subcategory (protected with token verification)
router.post('/add-subcategory', verifyToken, async (req, res) => {
    try {
        const { category, title, image } = req.body;

        // Check if the specified category exists
        const categoryExists = await CategoryModel.findById(category);

        if (!categoryExists) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        const newSubCategory = new SubCategoryModel({
            category,
            title,
            image,
        });

        const savedSubCategory = await newSubCategory.save();
        res.status(201).json({ success: true, subcategory: savedSubCategory });
    } catch (error) {
        console.error('Error adding subcategory:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add subcategory.' });
    }
});


router.get('/sub-categories', verifyToken, async (req, res) => {
    try {
        const subcategories = await SubCategoryModel.find().populate('category');

        res.status(200).json({ success: true, subcategories });
    } catch (error) {
        console.error('Error fetching subcategories:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch subcategories.' });
    }
});
router.get('/subcategories-by-category/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        
        // Find subcategories by category ID
        const subcategories = await SubCategoryModel.find({ category: categoryId });

        res.status(200).json({ success: true, subcategories });
    } catch (error) {
        console.error('Error fetching subcategories by category:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch subcategories by category.' });
    }
});


module.exports = router;

