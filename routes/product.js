const router = require("express").Router();
const jwt = require('jsonwebtoken');
const ProductModel = require('../models/product');
const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/sub_category');
const User = require("../models/user");
const multer = require('multer');
const xlsx = require('xlsx');
const secret_key = "Rana";


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload-product', upload.single('productfile'), async (req, res) => {
    try {
        const buffer = req.file.buffer;
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Check for duplicates based on title
        const duplicateTitles = new Set();
        for (const row of data) {
            const existingProduct = await ProductModel.findOne({ title: row.title });
            if (existingProduct) {
                duplicateTitles.add(row.title);
            }
        }

        if (duplicateTitles.size > 0) {
            return res.status(400).json({ success: false, message: 'Duplicate products found.', duplicates: Array.from(duplicateTitles) });
        }

        // Process and add products to the database
        const productPromises = data.map(async (row) => {
            // Check if the specified category exists
            const categoryExists = await CategoryModel.findById(row.category);
            if (!categoryExists) {
                throw new Error(`Category not found for product: ${row.title}`);
            }

            // Check if the specified subcategory exists
            const subcategoryExists = await SubCategoryModel.findById(row.subcategory);
            if (!subcategoryExists) {
                throw new Error(`Subcategory not found for product: ${row.title}`);
            }

            const newProduct = new ProductModel({
                category: row.category,
                subcategory: row.subcategory,
                title: row.title,
                description: row.description,
                price: row.price,
                percentdis: row.percentdis,
                brand: row.brand,
                has_delivery_charge: row.has_delivery_charge,
                delivery_charge: row.delivery_charge,
                in_stock: row.in_stock,
                stock_count: row.stock_count,
                cover_image: row.cover_image,
                images: row.images,
                cart_count: row.cart_count,
                wishlisted: row.wishlisted,
            });

            return newProduct.save();
        });

        const savedProducts = await Promise.all(productPromises);
        res.status(201).json({ success: true, products: savedProducts });
    } catch (error) {
        console.error('Error adding products:', error);
        res.status(500).json({ success: false, message: 'Failed to add products.', error: error.message });
    }
});

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
router.post('/add-product', async (req, res) => {
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

router.get('/products', async (req, res) => {
    try {
        const products = await ProductModel.find().populate('category').populate('subcategory');

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
});

router.post('/addproducttouser', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if the product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        // Add the product to the user's products array
        user.products.push(productId);

        // Save the updated user
        await user.save();

        res.status(200).json({ success: true, message: 'Product added to user successfully.' });
    } catch (error) {
        console.error('Error adding product to user:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add product to user.' });
    }
});
router.get('/products-by-category/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        console.log(categoryId);
        // Find products with the specified category ID
        const products = await ProductModel.find({ category: categoryId });
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products by category:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch products by category.' });
    }
});

router.get('/products-by-subcategory/:subcategoryId', async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        console.log(subcategoryId);
        // Find products with the specified subcategory ID
        const products = await ProductModel.find({ subcategory: subcategoryId });

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products by subcategory:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch products by subcategory.' });
    }
});



module.exports = router;