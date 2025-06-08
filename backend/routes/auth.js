const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for user registration
// Expects user details (e.g., username, password, role) in the request body
router.post('/register', authController.register);

// Route for user login/authentication
// Expects login credentials (e.g., username and password) in the request body
router.post('/login', authController.login);

// Export the router to be used in the main app
module.exports = router;
