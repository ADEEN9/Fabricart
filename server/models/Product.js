const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide product name'],
            trim: true,
            maxlength: [120, 'Product name cannot exceed 120 characters'],
        },
        brand: {
            type: String,
            required: [true, 'Please provide brand name'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: {
                values: ['Shirting', 'Suiting'],
                message: 'Category must be either Shirting or Suiting',
            },
        },
        material: {
            type: String,
            required: [true, 'Please provide material type'],
            enum: {
                values: ['Cotton', 'Linen', 'Silk', 'Polyester', 'Wool', 'Blend'],
                message: 'Please select a valid material type',
            },
        },
        price: {
            type: Number,
            required: [true, 'Please provide price per meter'],
            min: [0, 'Price cannot be negative'],
        },
        stock: {
            type: Number,
            required: [true, 'Please provide stock in meters'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        description: {
            type: String,
            required: [true, 'Please provide product description'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        // Multiple images support
        images: [
            {
                url: { type: String, required: true },
                filename: { type: String, required: true },
            },
        ],
        // Keep legacy single image fields for backwards compatibility
        imageUrl: {
            type: String,
            default: '',
        },
        imagePublicId: {
            type: String,
        },
        ratings: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for faster filtering
productSchema.index({ category: 1, material: 1, brand: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
