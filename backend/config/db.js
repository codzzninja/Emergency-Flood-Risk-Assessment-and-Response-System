const mongoose = require('mongoose');

// Asynchronous function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variable or default to local MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/trimble_emergency'
    );

    // Log success message on successful connection
    console.log('MongoDB connected');
  } catch (err) {
    // Log the error message and exit the process if connection fails
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit with failure
  }
};

// Export the connectDB function so it can be used in other files
module.exports = connectDB;
