const { Producer } = require('../models');
const productService = require('../services/productService');

/**
 * Create a new product
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const CreateProduct = async (req, res) => {
  try {
    // Check if user is a producer
    if (req.userRole !== 'producer') {
      return res.status(403).json({ message: "Only producers can create products" });
    }

    // Validate input data
    const validationResult = productService.validateProductData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Find the producer based on the authenticated user
    const producer = await Producer.findOne({ where: { userId: req.userId } });
    if (!producer) {
      return res.status(404).json({ message: "Producer profile not found" });
    }

    // Process related entities
    const entities = await productService.processRelatedEntities(req.body);
    
    // Create the product
    const product = await productService.createProductRecord(req.body, entities, producer.id);

    // Process tags
    await productService.processTags(req.body.tags, product);

    // Process images
    await productService.processImages(req.body.images, product.ProductsId);

    // Return the created product with its associations
    const createdProduct = await productService.getProductWithAssociations(product.ProductsId);

    return res.status(201).json({
      message: "Product created successfully",
      product: createdProduct
    });

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      message: "An error occurred while creating the product",
      error: error.message
    });
  }
};

/**
 * Get a product by its ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const GetProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    return res.status(200).json({
      product
    });
    
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({
      message: "An error occurred while getting the product",
      error: error.message
    });
  }
};

/**
 * Get products by producer ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const GetProductsByProducerId = async (req, res) => {
  try {
    const { producerId } = req.params;
    
    if (!producerId) {
      return res.status(400).json({ message: "Producer ID is required" });
    }
    
    const products = await productService.getProductsByProducerId(producerId);
    
    return res.status(200).json({
      count: products.length,
      products
    });
    
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({
      message: "An error occurred while getting the products",
      error: error.message
    });
  }
};

/**
 * Get products by the authenticated producer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const GetMyProducts = async (req, res) => {
  try {
    // Check if user is a producer
    if (req.userRole !== 'producer') {
      return res.status(403).json({ message: "Only producers can access their products" });
    }

    // Find the producer based on the authenticated user
    const producer = await Producer.findOne({ where: { userId: req.userId } });
    if (!producer) {
      return res.status(404).json({ message: "Producer profile not found" });
    }
    
    const products = await productService.getProductsByProducerId(producer.id);
    
    return res.status(200).json({
      count: products.length,
      products
    });
    
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({
      message: "An error occurred while getting your products",
      error: error.message
    });
  }
};

/**
 * Update a product
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const UpdateProduct = async (req, res) => {
  try {
    // Check if user is a producer
    if (req.userRole !== 'producer') {
      return res.status(403).json({ message: "Only producers can update products" });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    const result = await productService.updateProductById(id, req.body, req.userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    return res.status(200).json({
      message: "Product updated successfully",
      product: result.product
    });
    
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      message: "An error occurred while updating the product",
      error: error.message
    });
  }
};

/**
 * Delete a product
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const DeleteProduct = async (req, res) => {
  try {
    // Check if user is a producer
    if (req.userRole !== 'producer') {
      return res.status(403).json({ message: "Only producers can delete products" });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    const result = await productService.deleteProductById(id, req.userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    return res.status(200).json({
      message: result.message
    });
    
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the product",
      error: error.message
    });
  }
};

module.exports = {
  CreateProduct,
  GetProductById,
  GetProductsByProducerId,
  GetMyProducts,
  UpdateProduct,
  DeleteProduct
};

