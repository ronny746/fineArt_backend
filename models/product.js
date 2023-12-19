const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: {
            type: [String], 
            default: [],
        },
        price: {
            type: Number,
            required: true,
        },
        percentdis: {
            type: Number,
            default: 0,
        },
        disprice: {
            type: Number,
            default:0,
        },
        brand: {
            type: String,
        },
        has_delivery_charge: {
            type: Boolean,
            required: true,
        },
        delivery_charge: {
            type: Number,
            required: function () {
                return this.has_delivery_charge;
            },
        },
        in_stock: {
            type: Boolean,
            required: true,
        },
        stock_count: {
            type: Number,
            default: 0,
        },
        cover_image: {
            type: String,
        },
        cart_count: {
            type: Number,
        },
        wishlisted: {
            type: Boolean,
        },
    },
    { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
