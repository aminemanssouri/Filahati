# 🌱 Filahati API

Backend API for the Filahati project built with Express.js and PostgreSQL.

## 📁 Project Structure

```
filahati-api/
├── config/             # Configuration files
│   └── database.js     # Database connection
├── controllers/        # Request handlers
│   └── sampleController.js
├── middlewares/        # Custom middleware functions
│   └── auth.js
├── models/             # Database models
│   └── sampleModel.js
├── routes/             # API routes
│   ├── api.js          # Main API router
│   └── sampleRoutes.js # Sample routes
├── .env                # Environment variables
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── server.js           # Entry point
```

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### ⚙️ Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   Edit the `.env` file with your configuration

3. Start the development server:
   ```
   npm run dev
   ```

4. For production:
   ```
   npm start
   ```

## 🔌 API Endpoints

### 🧪 Test Route
- GET `/api/test` - Test if API is working

### 🔐 Authentication Routes
- POST `/api/auth/register` - Register a new user (buyer or producer)
- POST `/api/auth/login` - Authenticate user & get token
- POST `/api/auth/logout` - Logout user & clear cookie
- GET `/api/auth/me` - Get current user profile

### 🛒 Product Routes
- POST `/api/products` - Create a new product (producers only)
- GET `/api/products/:id` - Get a product by ID
- GET `/api/products/producer/:producerId` - Get all products by a specific producer
- GET `/api/products/my/products` - Get all products of the authenticated producer
- PUT `/api/products/:id` - Update a product (producers only)
- DELETE `/api/products/:id` - Delete a product (producers only)

## 💾 Data Models

### 👤 User
```json
{
  "id": "integer",
  "email": "string",
  "passwordHash": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "role": "string" // 'buyer' or 'producer'
}
```

### Producer
```json
{
  "id": "integer",
  "businessName": "string",
  "productionType": "string",
  "profileImage": "string",
  "streetAddress": "string",
  "postalCode": "string",
  "userId": "integer",
  "cityId": "integer"
}
```

### Product
```json
{
  "ProductsId": "integer",
  "title": "string",
  "description": "text",
  "price": "decimal",
  "quantity": "integer",
  "minorderquntity": "integer",
  "Availablequantity": "integer",
  "HarvestDate": "date",
  "ExpiryDate": "date",
  "FreeShipping": "boolean",
  "Organic": "boolean",
  "GrowingInfo": "text",
  "shippingInfo": "text",
  "status": "enum", // 'Active', 'Low Stock', or 'Out of Stock'
  "categoryId": "integer",
  "cityId": "integer",
  "producerId": "integer",
  "uniteId": "integer"
}
```

### Buyer
```json
{
  "id": "integer",
  "businessType": "string",
  "businessName": "string",
  "website": "string",
  "languagePreference": "string",
  "bookingNotification": "boolean",
  "emailNotification": "boolean",
  "smsNotification": "boolean",
  "orderUpdates": "boolean",
  "newProductNotification": "boolean",
  "promotionsOffers": "boolean",
  "userId": "integer",
  "shippingAddressId": "integer",
  "cityId": "integer"
}
```

### 📦 ShippingAddress
```json
{
  "id": "integer",
  "addressLine1": "string",
  "addressLine2": "string",
  "postalCode": "string",
  "contactNumber": "string",
  "contactName": "string",
  "isDefault": "boolean",
  "cityId": "integer",
  "buyerId": "integer"
}
```

### Order
```json
{
  "orderId": "integer",
  "buyerId": "integer",
  "shippingAddressId": "integer",
  "orderDate": "date",
  "totalAmount": "decimal",
  "status": "enum", // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  "paymentMethod": "string",
  "paymentStatus": "enum", // 'Pending', 'Completed', 'Failed', 'Refunded'
  "shippingCost": "decimal",
  "deliveryDate": "date",
  "notes": "text"
}
```

### 📋 OrderItem
```json
{
  "id": "integer",
  "orderId": "integer",
  "productId": "integer",
  "quantity": "integer",
  "unitPrice": "decimal",
  "subtotal": "decimal",
  "producerNotes": "text",
  "buyerNotes": "text"
}
```

## 💳 Payment System

### ✨ Features

- **Secure Payment Processing**: Process payments for orders with various payment methods
- **Payment Status Tracking**: Monitor payment status (Pending, Processing, Completed, Failed, Refunded)
- **Transaction Management**: Track payment transactions with unique transaction IDs
- **Payment History**: View payment history for orders
- **Payment Gateway Integration**: Placeholder for integration with real payment gateways
- **Transaction Audit Trail**: Complete record of all payment transactions for auditing and reconciliation

### 🔌 Payment Endpoints

- POST `/api/payments` - Process a new payment for an order (buyers only)
- GET `/api/payments/:paymentId` - Get payment details by ID (buyers only)
- GET `/api/payments/order/:orderId` - Get all payments for a specific order (buyers only)
- GET `/api/payments/transactions/order/:orderId` - Get all transactions for a specific order (buyers only)
- PATCH `/api/payments/:paymentId/status` - Update payment status (webhook callback)

### 💾 Payment Model

```json
{
  "paymentId": "integer",
  "orderId": "integer",
  "amount": "decimal",
  "paymentMethod": "enum", // 'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'
  "paymentStatus": "enum", // 'Pending', 'Processing', 'Completed', 'Failed', 'Refunded'
  "transactionId": "string",
  "paymentDate": "date",
  "paymentDetails": "json"
}
```

### 💸 Transaction Model

```json
{
  "transactionId": "integer",
  "orderId": "integer",
  "amount": "decimal",
  "externalTransactionId": "string",
  "paymentMethod": "enum", // 'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'
  "transactionDate": "date",
  "transactionType": "enum", // 'Payment', 'Refund', 'Chargeback'
  "status": "enum", // 'Pending', 'Completed', 'Failed'
  "details": "json"
}
```

## 🛒 Order Management System

### ✨ Features

- **Complete Order Lifecycle Management**: Create, track, update, and cancel orders
- **Multi-party Access**: Different views for buyers and producers
- **Shipping Address Management**: Create and manage multiple shipping addresses
- **Order Status Tracking**: Track orders through their entire lifecycle
- **Payment Status Tracking**: Monitor payment status for each order

### 🔌 Order Endpoints

#### 🛍️ Buyer Order Endpoints
- POST `/api/orders` - Create a new order (buyers only)
- GET `/api/orders/:id` - Get an order by ID
- GET `/api/orders/my` - Get all orders for the authenticated buyer
- PUT `/api/orders/:id/cancel` - Cancel an order (buyers only)

#### 📦 Shipping Address Endpoints
- POST `/api/shipping-addresses` - Create a new shipping address
- GET `/api/shipping-addresses/my` - Get all shipping addresses for the authenticated buyer
- GET `/api/shipping-addresses/:id` - Get a specific shipping address by ID
- PUT `/api/shipping-addresses/:id` - Update a shipping address
- DELETE `/api/shipping-addresses/:id` - Delete a shipping address
- PUT `/api/shipping-addresses/:id/default` - Set a shipping address as default

#### 🧑‍🌾 Producer Order Endpoints
- GET `/api/orders/producer` - Get all orders containing the authenticated producer's products
- PUT `/api/orders/:id/status` - Update order status (producers only)

### 🔄 Order Workflow

1. **📝 Order Creation**:
   - Buyer selects products and quantities
   - Buyer chooses or creates a shipping address
   - System calculates total amount including shipping
   - Order is created with 'Pending' status

2. **⚙️ Order Processing**:
   - Producer receives notification of new order
   - Producer updates order status to 'Processing'
   - Producer prepares products for shipping

3. **🚚 Order Shipping**:
   - Producer ships the order
   - Order status is updated to 'Shipped'
   - Buyer receives shipping notification

4. **📬 Order Delivery**:
   - Order is delivered to the buyer
   - Status is updated to 'Delivered'
   - Buyer can leave reviews for products

## 📦 Shipping Address Management System

### ✨ Features

- **Multiple Addresses**: Buyers can save and manage multiple shipping addresses
- **Default Address Selection**: Set a preferred address as default for faster checkout
- **Address Validation**: Basic validation for required fields
- **City Integration**: Addresses are linked to cities for regional organization
- **Secure Access Control**: Only the address owner can view, edit, or delete their addresses
- **Seamless Order Integration**: Addresses can be selected during order creation

### 🔄 Address Management Workflow

1. **📝 Address Creation**:
   - Buyer provides address details (contact name, address lines, postal code, etc.)
   - System validates the address information
   - Address is saved to the buyer's profile
   - First address is automatically set as default

2. **🔄 Address Updates**:
   - Buyer can update any address details
   - Changes are immediately reflected in the system
   - Updated addresses can be used for new orders

3. **⭐ Default Address Management**:
   - Buyer can set any address as default
   - Previous default address is automatically unset
   - Default address is pre-selected during checkout

4. **🗑️ Address Deletion**:
   - Buyer can delete unwanted addresses
   - System prevents deletion of addresses used in active orders
   - If default address is deleted, another address is set as default if available

### 💾 Example Shipping Address Creation

```json
{
  "contactName": "John Doe",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "postalCode": "10001",
  "contactNumber": "+1234567890",
  "cityId": 5,
  "isDefault": true
}
```

## 💰 Transaction Management System

### ✨ Features

- **Secure Payment Tracking**: Track all payment transactions with unique transaction IDs
- **Order Integration**: Transactions are linked directly to orders for complete financial tracking
- **Multiple Payment Methods**: Support for various payment methods (Credit Card, Debit Card, PayPal, etc.)
- **Transaction Status Monitoring**: Track the status of each transaction (Pending, Completed, Failed)
- **Transaction Types**: Support for different transaction types (Payment, Refund, Chargeback)
- **Detailed Transaction Records**: Store comprehensive transaction details for auditing and reporting

### 🔌 Transaction Endpoints

- POST `/api/transactions` - Create a new transaction (Buyers or Admins only)
- GET `/api/transactions/:id` - Get transaction details by ID (Transaction's buyer or Admin)
- GET `/api/transactions/order/:orderId` - Get all transactions for a specific order (Order's buyer or Admin)
- PUT `/api/transactions/:id/status` - Update transaction status (Admins only)
- GET `/api/transactions/generate/id` - Generate a unique transaction ID

### 🔄 Transaction Workflow

1. **💳 Payment Initiation**:
   - Buyer initiates payment for an order
   - System generates a unique transaction ID
   - Transaction is created with 'Pending' status

2. **🔍 Payment Processing**:
   - Payment is processed through the payment gateway
   - External transaction ID from the payment processor is stored
   - Transaction status is updated based on payment result

3. **✅ Payment Completion**:
   - On successful payment, transaction status is updated to 'Completed'
   - Order status is updated accordingly
   - Buyer receives payment confirmation

4. **❌ Payment Failure Handling**:
   - If payment fails, transaction status is updated to 'Failed'
   - System provides feedback on the reason for failure
   - Buyer can retry payment or choose an alternative payment method

### 💾 Transaction Model

```json
{
  "transactionId": "string", // External transaction ID from payment processor as primary key
  "orderId": "integer",
  "amount": "decimal",
  "paymentMethod": "enum", // 'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'
  "transactionDate": "date",
  "transactionType": "enum", // 'Payment', 'Refund', 'Chargeback'
  "status": "enum", // 'Pending', 'Completed', 'Failed'
  "details": "json"
}
```

## 📄 License

ISC
