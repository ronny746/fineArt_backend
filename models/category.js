const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        in_navbar: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
