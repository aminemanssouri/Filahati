const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { User, Buyer, Producer, sequelize } = require('../models'); // Import models and sequelize instance

/**
 * Login controller
 * Authenticates user credentials and issues JWT token
 */
const login = async (req, res) => {
  const { email, password } = req.body; // Changed Password to password for consistency
  
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" }); // Fixed typo: jsom -> json
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.clearCookie("token"); 
      return res.status(400).json({ message: "Invalid credentials!" }); // Fixed typo: jsom -> json
    }
    
    // Create token (2 weeks expiration)
    const age = 1000 * 60 * 60 * 24 * 14;
    const token = jwt.sign(
      { id: user.id ,role:user.role},
      process.env.JWT_SECRET_KEY, // Fixed typo: WT_SECRET_KEY -> JWT_SECRET_KEY
      { expiresIn: age }
    );

    // Set cookie
    res.cookie("token", token, {
      maxAge: age,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: "strict" // Fixed typo: samesite -> sameSite
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Register controller
 * Creates a new user account and corresponding profile (Buyer or Producer)
 */
const register = async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phoneNumber, 
    role, // 'buyer' or 'producer'
    // Buyer specific fields
    businessType,
    businessName,
    website,
    languagePreference,
    // Producer specific fields
    productionType,
    profileImage,
    streetAddress,
    postalCode,
    // Common fields
    cityId
  } = req.body;
  
  // Start a transaction to ensure all operations succeed or fail together
  const transaction = await sequelize.transaction();
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email },
      transaction
    });
    
    if (existingUser) {
      await transaction.rollback();
      res.clearCookie("token"); 
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Validate role
    if (role !== 'buyer' && role !== 'producer') {
      await transaction.rollback();
      res.clearCookie("token"); 
      return res.status(400).json({ message: "Role must be either 'buyer' or 'producer'" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phoneNumber,
      role
    }, { transaction });
    
    // Create profile based on role
    if (role === 'buyer') {
      await createBuyerProfile(newUser.id, req.body, transaction);
    } else if (role === 'producer') {
      await createProducerProfile(newUser.id, req.body, transaction);
    }
    
    // Commit transaction
    await transaction.commit();
    
    // Create token
    const age = 1000 * 60 * 60 * 24 * 14; // 2 weeks
    const token = jwt.sign(
      { id: newUser.id,role:newUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );
    
    // Set cookie
    res.cookie("token", token, {
      maxAge: age,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict"
    });
    
    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (err) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Helper function to create a buyer profile
 */
const createBuyerProfile = async (userId, data, transaction) => {
  const { 
    businessType,
    businessName,
    website,
    languagePreference,
    bookingNotification = true,
    emailNotification = true,
    smsNotification = false,
    orderUpdates = true,
    newProductNotification = false,
    promotionsOffers = false,
    cityId
  } = data;
  
  // Validate required fields
  if (!businessType || !businessName) {
    throw new Error('Business type and name are required for buyer profiles');
  }
  
  // Create buyer profile
  return await Buyer.create({
    userId,
    businessType,
    businessName,
    website,
    languagePreference: languagePreference || 'English',
    bookingNotification,
    emailNotification,
    smsNotification,
    orderUpdates,
    newProductNotification,
    promotionsOffers,
    cityId
  }, { transaction });
};

/**
 * Helper function to create a producer profile
 */
const createProducerProfile = async (userId, data, transaction) => {
  const { 
    businessName,
    productionType,
    profileImage,
    streetAddress,
    postalCode,
    cityId
  } = data;
  
  // Validate required fields
  if (!businessName || !productionType || !streetAddress || !postalCode) {
    throw new Error('Business name, production type, street address, and postal code are required for producer profiles');
  }
  
  // Create producer profile
  return await Producer.create({
    userId,
    businessName,
    productionType,
    profileImage,
    streetAddress,
    postalCode,
    cityId
  }, { transaction });
};

/**
 * Logout controller
 * Clears the authentication cookie
 */
const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  login,
  register,
  logout
};
