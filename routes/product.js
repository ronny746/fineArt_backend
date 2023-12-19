const router = require("express").Router();
const jwt = require('jsonwebtoken');
const ProductModel = require('../models/product');
const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/sub_category'); 
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

// Endpoint to add a new product (protected with token verification)
router.post('/add-product', verifyToken, async (req, res) => {
    try {
        const {
            category,
            subcategory,
            title,
            description,
            price,
            percentdis,
            brand,
            has_delivery_charge,
            delivery_charge,
            in_stock,
            stock_count,
            cover_image,
            images,
            cart_count,
            wishlisted,
        } = req.body;

        // Check if the specified category exists
        const categoryExists = await CategoryModel.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        // Check if the specified subcategory exists
        const subcategoryExists = await SubCategoryModel.findById(subcategory);
        if (!subcategoryExists) {
            return res.status(404).json({ success: false, message: 'Subcategory not found.' });
        }

        const newProduct = new ProductModel({
            category,
            subcategory,
            title,
            description,
            price,
            percentdis,
            brand,
            has_delivery_charge,
            delivery_charge,
            in_stock,
            stock_count,
            cover_image,
            images,
            cart_count,
            wishlisted,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, product: savedProduct });
    } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add product.' });
    }
});

router.get('/products',verifyToken, async (req, res) => {
    try {
        const products = await ProductModel.find().populate('category').populate('subcategory');

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
});



module.exports = router;