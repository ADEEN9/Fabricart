const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Helper: delete a local image file
const deleteLocalImage = (filename) => {
    if (!filename) return;
    const imgPath = path.join(__dirname, '..', 'uploads', 'products', filename);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
};

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const { category, material, brand, search, sort, page = 1, limit = 12 } = req.query;

        const filter = {};

        if (category) filter.category = category;
        if (material) filter.material = material;
        if (brand) filter.brand = { $regex: brand, $options: 'i' };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { ratings: -1 };
        if (sort === 'name') sortOption = { name: 1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalProducts: total,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const { name, brand, category, material, price, stock, description } = req.body;

        // Build images array from uploaded files
        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                images.push({
                    url: `/uploads/products/${file.filename}`,
                    filename: file.filename,
                });
            }
        }

        // Set the primary imageUrl from the first image (backwards compatibility)
        const imageUrl = images.length > 0 ? images[0].url : '';
        const imagePublicId = images.length > 0 ? images[0].filename : '';

        const product = await Product.create({
            name,
            brand,
            category,
            material,
            price,
            stock,
            description,
            images,
            imageUrl,
            imagePublicId,
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        // If new images uploaded, delete old local files and replace
        if (req.files && req.files.length > 0) {
            // Delete old images
            if (product.images && product.images.length > 0) {
                for (const img of product.images) {
                    deleteLocalImage(img.filename);
                }
            } else if (product.imagePublicId) {
                deleteLocalImage(product.imagePublicId);
            }

            // Build new images array
            const images = req.files.map((file) => ({
                url: `/uploads/products/${file.filename}`,
                filename: file.filename,
            }));
            req.body.images = images;
            req.body.imageUrl = images[0].url;
            req.body.imagePublicId = images[0].filename;
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        // Delete all local image files
        if (product.images && product.images.length > 0) {
            for (const img of product.images) {
                deleteLocalImage(img.filename);
            }
        } else if (product.imagePublicId) {
            deleteLocalImage(product.imagePublicId);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product stock (in meters)
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
const updateStock = async (req, res, next) => {
    try {
        const { stock } = req.body;

        if (stock === undefined || stock < 0) {
            res.status(400);
            throw new Error('Please provide a valid stock quantity in meters');
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true, runValidators: true }
        );

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
};
