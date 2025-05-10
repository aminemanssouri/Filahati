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

## License

ISC
