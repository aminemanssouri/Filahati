# Filahati API

Backend API for the Filahati project built with Express.js and PostgreSQL.

## Project Structure

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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

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

## API Endpoints

### Test Route
- GET `/api/test` - Test if API is working

### Authentication Routes
- POST `/api/auth/register` - Register a new user (buyer or producer)
- POST `/api/auth/login` - Authenticate user & get token
- POST `/api/auth/logout` - Logout user & clear cookie
- GET `/api/auth/me` - Get current user profile

### Product Routes
- POST `/api/products` - Create a new product (producers only)
- GET `/api/products/:id` - Get a product by ID
- GET `/api/products/producer/:producerId` - Get all products by a specific producer
- GET `/api/products/my/products` - Get all products of the authenticated producer
- PUT `/api/products/:id` - Update a product (producers only)
- DELETE `/api/products/:id` - Delete a product (producers only)

## Data Models

### User
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

### ShippingAddress
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

### OrderItem
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

## Order Management System

### Features

- **Complete Order Lifecycle Management**: Create, track, update, and cancel orders
- **Multi-party Access**: Different views for buyers and producers
- **Shipping Address Management**: Create and manage multiple shipping addresses
- **Order Status Tracking**: Track orders through their entire lifecycle
- **Payment Status Tracking**: Monitor payment status for each order

### Order Endpoints

#### Buyer Order Endpoints
- POST `/api/orders` - Create a new order (buyers only)
- GET `/api/orders/:id` - Get an order by ID
- GET `/api/orders/my` - Get all orders for the authenticated buyer
- PUT `/api/orders/:id/cancel` - Cancel an order (buyers only)

#### Shipping Address Endpoints
- POST `/api/shipping-addresses` - Create a new shipping address
- GET `/api/shipping-addresses/my` - Get all shipping addresses for the authenticated buyer

#### Producer Order Endpoints
- GET `/api/orders/producer` - Get all orders containing the authenticated producer's products
- PUT `/api/orders/:id/status` - Update order status (producers only)

### Order Workflow

1. **Order Creation**:
   - Buyer selects products and quantities
   - Buyer chooses or creates a shipping address
   - System calculates total amount including shipping
   - Order is created with 'Pending' status

2. **Order Processing**:
   - Producer receives notification of new order
   - Producer updates order status to 'Processing'
   - Producer prepares products for shipping

3. **Order Shipping**:
   - Producer ships the order
   - Order status is updated to 'Shipped'
   - Buyer receives shipping notification

4. **Order Delivery**:
   - Order is delivered to the buyer
   - Status is updated to 'Delivered'
   - Buyer can leave reviews for products

## License

ISC
