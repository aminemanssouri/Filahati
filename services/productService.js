const { Product, Tag, Category, City, Producer, Unites, Image } = require('../models');

/**
 * Validate product input data
 * @param {Object} data - Product data
 * @returns {Object} - Validation result
 */
const validateProductData = (data) => {
  const { title, description, category, city, price, unite } = data;
  
  if (!title || !description || !category || !city || !price || !unite) {
    return { 
      isValid: false, 
      message: "Required fields are missing" 
    };
  }
  
  return { isValid: true };
};

/**
 * Find or create related entities (category, city, unit)
 * @param {Object} data - Product data
 * @returns {Promise<Object>} - Created/found entities
 */
const processRelatedEntities = async ({ category, city, unite }) => {
  // Find or create category by name
  const [categoryObj] = await Category.findOrCreate({
    where: { categoryName: category.trim() }
  });
  
  // Find or create city by name
  const [cityObj] = await City.findOrCreate({
    where: { cityName: city.trim() }
  });
  
  // Find or create unit by name
  const [uniteObj] = await Unites.findOrCreate({
    where: { name: unite.trim() },
    defaults: {
      UniteSymbole: unite.trim().substring(0, 3).toUpperCase() // Create a symbol from the first 3 chars
    }
  });

  return { categoryObj, cityObj, uniteObj };
};

/**
 * Create the product record
 * @param {Object} data - Product data
 * @param {Object} entities - Related entities
 * @param {Number} producerId - Producer ID
 * @returns {Promise<Object>} - Created product
 */
const createProductRecord = async (data, entities, producerId) => {
  const {
    title, description, price, quantity, minorderquntity,
    Availablequantity, HarvestDate, ExpiryDate, FreeShipping,
    Organic, GrowingInfo, shippingInfo
  } = data;
  
  const { categoryObj, cityObj, uniteObj } = entities;
  
  return await Product.create({
    title,
    description,
    price,
    quantity: quantity || 0,
    minorderquntity: minorderquntity || 1,
    Availablequantity: Availablequantity || quantity,
    HarvestDate: HarvestDate ? new Date(HarvestDate) : null,
    ExpiryDate: new Date(ExpiryDate),
    FreeShipping: FreeShipping || false,
    Organic: Organic || false,
    GrowingInfo: GrowingInfo || null,
    shippingInfo: shippingInfo || null,
    categoryId: categoryObj.categoryId,
    cityId: cityObj.id,
    uniteId: uniteObj.id,
    producerId
  });
};

/**
 * Process tags and associate them with the product
 * @param {Array} tags - Array of tag names
 * @param {Object} product - Product instance
 * @returns {Promise<void>}
 */
const processTags = async (tags, product) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return;
  
  // Find or create tags
  const tagObjects = await Promise.all(
    tags.map(name => 
      Tag.findOrCreate({ where: { name: name.trim().toLowerCase() } })
    )
  );
  
  // Add tags to the product
  await product.addTags(tagObjects.map(tag => tag[0]));
};

/**
 * Process images and associate them with the product
 * @param {Array} images - Array of image URLs
 * @param {Number} productId - Product ID
 * @returns {Promise<Array>} - Created images
 */
const processImages = async (images, productId) => {
  if (!images || !Array.isArray(images) || images.length === 0) return [];
  
  return await Promise.all(
    images.map(url => 
      Image.create({
        url,
        productId
      })
    )
  );
};

/**
 * Get product with all its associations
 * @param {Number} productId - Product ID
 * @returns {Promise<Object>} - Product with associations
 */
const getProductWithAssociations = async (productId) => {
  return await Product.findByPk(productId, {
    include: [
      { model: Category },
      { model: City },
      { model: Producer },
      { model: Unites },
      { model: Tag },
      { model: Image }
    ]
  });
};

/**
 * Get product by ID
 * @param {Number} productId - Product ID
 * @returns {Promise<Object>} - Product with associations
 */
const getProductById = async (productId) => {
  return await Product.findByPk(productId, {
    include: [
      { model: Category },
      { model: City },
      { model: Producer },
      { model: Unites },
      { model: Tag },
      { model: Image }
    ]
  });
};

/**
 * Get products by producer ID
 * @param {Number} producerId - Producer ID
 * @returns {Promise<Array>} - Array of products
 */
const getProductsByProducerId = async (producerId) => {
  return await Product.findAll({
    where: { producerId },
    include: [
      { model: Category },
      { model: City },
      { model: Unites },
      { model: Tag },
      { model: Image }
    ]
  });
};

/**
 * Delete product by ID
 * @param {Number} productId - Product ID
 * @param {Number} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Result of deletion
 */
const deleteProductById = async (productId, userId) => {
  // First check if product exists and belongs to the user's producer profile
  const product = await Product.findByPk(productId, {
    include: [{
      model: Producer,
      where: { userId }
    }]
  });

  if (!product) {
    return { success: false, message: "Product not found or you don't have permission to delete it" };
  }

  // Delete associated images
  await Image.destroy({ where: { productId } });
  
  // Remove tag associations (doesn't delete the tags themselves)
  await product.setTags([]);
  
  // Delete the product
  await product.destroy();
  
  return { success: true, message: "Product deleted successfully" };
};

/**
 * Update product by ID
 * @param {Number} productId - Product ID
 * @param {Object} data - Updated product data
 * @param {Number} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Updated product or error
 */
const updateProductById = async (productId, data, userId) => {
  // First check if product exists and belongs to the user's producer profile
  const product = await Product.findByPk(productId, {
    include: [{
      model: Producer,
      where: { userId }
    }]
  });

  if (!product) {
    return { success: false, message: "Product not found or you don't have permission to update it" };
  }

  const {
    title, description, price, quantity, minorderquntity,
    Availablequantity, HarvestDate, ExpiryDate, FreeShipping,
    Organic, GrowingInfo, shippingInfo, category, city, unite, tags, images
  } = data;

  // Process related entities if they are provided
  let categoryId = product.categoryId;
  let cityId = product.cityId;
  let uniteId = product.uniteId;

  if (category || city || unite) {
    const entities = await processRelatedEntities({
      category: category || '', 
      city: city || '', 
      unite: unite || ''
    });
    
    if (category) categoryId = entities.categoryObj.categoryId;
    if (city) cityId = entities.cityObj.id;
    if (unite) uniteId = entities.uniteObj.id;
  }

  // Update the product
  await product.update({
    title: title || product.title,
    description: description || product.description,
    price: price || product.price,
    quantity: quantity !== undefined ? quantity : product.quantity,
    minorderquntity: minorderquntity !== undefined ? minorderquntity : product.minorderquntity,
    Availablequantity: Availablequantity !== undefined ? Availablequantity : product.Availablequantity,
    HarvestDate: HarvestDate ? new Date(HarvestDate) : product.HarvestDate,
    ExpiryDate: ExpiryDate ? new Date(ExpiryDate) : product.ExpiryDate,
    FreeShipping: FreeShipping !== undefined ? FreeShipping : product.FreeShipping,
    Organic: Organic !== undefined ? Organic : product.Organic,
    GrowingInfo: GrowingInfo !== undefined ? GrowingInfo : product.GrowingInfo,
    shippingInfo: shippingInfo !== undefined ? shippingInfo : product.shippingInfo,
    categoryId,
    cityId,
    uniteId
  });

  // Process tags if provided
  if (tags && Array.isArray(tags)) {
    await processTags(tags, product);
  }

  // Process images if provided
  if (images && Array.isArray(images)) {
    // Optionally remove existing images before adding new ones
    await Image.destroy({ where: { productId } });
    await processImages(images, productId);
  }

  // Return the updated product with associations
  const updatedProduct = await getProductWithAssociations(productId);
  return { success: true, product: updatedProduct };
};

module.exports = {
  validateProductData,
  processRelatedEntities,
  createProductRecord,
  processTags,
  processImages,
  getProductWithAssociations,
  getProductById,
  getProductsByProducerId,
  deleteProductById,
  updateProductById
};
