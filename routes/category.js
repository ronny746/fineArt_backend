const router = require("express").Router();
const jwt = require('jsonwebtoken');
const CategoryModel = require('../models/category'); // Adjust the path accordingly
const secret_key = "Rana";
const multer = require('multer');
const xlsx = require('xlsx');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint to upload and add categories from an Excel file
router.post('/upload-categories', upload.single('categoryFile'), async (req, res) => {
    try {
        const buffer = req.file.buffer;
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Process and add categories to the database
        const categoryPromises = data.map(async (row) => {
            const newCategory = new CategoryModel({
                title: row.title,
                in_navbar: row.in_navbar,
            });

            return newCategory.save();
        });

        const savedCategories = await Promise.all(categoryPromises);
        res.status(201).json({ success: true, categories: savedCategories });
    } catch (error) {
        console.error('Error adding categories:', error);
        res.status(500).json({ success: false, message: 'Failed to add categories.', error: error.message });
    }
});

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

router.delete('/delete/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
   
        // Check if the category exists
        const categoryExists = await CategoryModel.findById(categoryId);

        if (!categoryExists) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        // Delete the category
        await CategoryModel.findByIdAndDelete(categoryId);

        res.status(200).json({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
        console.error('Error deleting category:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete category.', error: error.message });
    }
});


module.exports = router;

