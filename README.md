# Filahati API

Backend API for the Filahati project built with Express.js and MongoDB.

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

### Sample Routes
- GET `/api/samples` - Get all samples
- GET `/api/samples/:id` - Get sample by ID
- POST `/api/samples` - Create new sample (protected route)

## License

ISC
