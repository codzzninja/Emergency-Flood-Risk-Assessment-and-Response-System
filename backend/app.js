const express = require('express');
const cors = require('cors');         // Middleware to enable Cross-Origin Resource Sharing (CORS)
const morgan = require('morgan');     // HTTP request logger middleware for development/debugging
const routes = require('./routes');   // Import all routes from the routes folder

const app = express();

// Enable CORS for all routes to allow cross-origin requests
app.use(cors());

// Log HTTP requests in 'dev' format to the console
app.use(morgan('dev'));

// Middleware to parse incoming JSON payloads in request bodies
app.use(express.json());

// Mount the API routes at the '/api' base path
app.use('/api', routes);

// Global error handling middleware
// Catches errors passed down the middleware chain and returns a 500 response
app.use((err, req, res, next) => {
  console.error(err.stack);                 // Log the full stack trace of the error on the server console
  res.status(500).json({ message: 'Internal Server Error' });  // Send generic error message to client
});

module.exports = app;  // Export the Express app for use by the server (e.g., server.js)
