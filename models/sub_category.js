const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String, // You can adjust the type based on how you plan to store images
            default: "", // Default image URL or path
        },
    },
    { timestamps: true }
);

const SubCategoryModel = mongoose.model("SubCategory", SubCategorySchema);

module.exports = SubCategoryModel;
