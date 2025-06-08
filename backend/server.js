require('dotenv').config(); 
// Load environment variables from the .env file into process.env
// This must be done at the very top before accessing any env variables

const app = require('./app'); 
// Import the Express app instance from app.js

const connectDB = require('./config/db'); 
// Import the function responsible for connecting to the database

const PORT = process.env.PORT || 5000; 
// Use the PORT defined in environment variables, fallback to 5000 if not set

// Connect to the database before starting the server
connectDB()
  .then(() => {
    // Once database connection is successful, start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    // If database connection fails, log the error and exit the process with failure code
    console.error('Failed to connect to database:', err);
    process.exit(1); // Exit the process with an error code to signal failure
  });
