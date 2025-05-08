const express = require('express');
const router = express.Router();
const { getAllItems, getItemById, createItem } = require('../controllers/sampleController');
const auth = require('../middlewares/auth');

// Get all items - public route
router.get('/', getAllItems);

// Get single item - public route
router.get('/:id', getItemById);

// Create new item - protected route
router.post('/', auth, createItem);

module.exports = router;
