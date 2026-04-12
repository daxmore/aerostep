const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const Sale = require('../models/Sale');

// @route   GET api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { featured, tags, sort, minPrice, maxPrice, category, size, search } = req.query;

    // Build filter object
    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (featured) {
      filter.featured = featured === 'true';
    }

    if (tags) {
      filter.tags = { $in: [tags] };
    }

    if (category) {
      filter.category = category;
    }

    if (size) {
      filter["sizes.size"] = Number(size);
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sortOption = {};

    if (sort === 'price-asc') {
      sortOption.price = 1;
    } else if (sort === 'price-desc') {
      sortOption.price = -1;
    } else if (sort === 'rating') {
      sortOption.averageRating = -1;
    } else {
      sortOption.createdAt = -1; // Default: newest first
    }

    const products = await Product.find(filter).sort(sortOption);

    // Apply active sales
    const activeSales = await Sale.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    const productsWithSale = products.map(product => {
      const pObj = product.toObject();
      const sale = activeSales.find(s => s.category === 'All' || s.category === pObj.category);
      if (sale) {
        pObj.salePrice = Math.floor(pObj.price * (1 - sale.discountPercentage / 100));
        pObj.activeSale = {
          name: sale.name,
          discountPercentage: sale.discountPercentage
        };
      }
      return pObj;
    });

    res.json(productsWithSale);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/search?q=keyword
// @desc    Search products by keyword
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ msg: 'Search query required' });
    }

    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/active-deals
// @desc    Get all active sales
// @access  Public
router.get('/active-deals', async (req, res) => {
    console.log('GET /api/products/active-deals request received');
    try {
        const sales = await Sale.find({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        res.json(sales);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products/:id
// @desc    Get product by ID with reviews
// @access  Public
router.get('/:id', async (req, res) => {
  console.log('GET /api/products/:id request received with ID:', req.params.id);
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const reviews = await Review.find({ productId: req.params.id }).populate('userId', 'name');

    // Fetch active sales for this product
    const sale = await Sale.findOne({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $or: [{ category: 'All' }, { category: product.category }]
    }).sort({ discountPercentage: -1 });

    const productObj = product.toObject();
    if (sale) {
      productObj.salePrice = Math.floor(productObj.price * (1 - sale.discountPercentage / 100));
      productObj.activeSale = {
        name: sale.name,
        discountPercentage: sale.discountPercentage
      };
    }

    res.json({ ...productObj, reviews });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});



module.exports = router;

