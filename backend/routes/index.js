const express = require('express');
const router = express.Router();

// Import route modules for different features
const authRoutes = require('./auth');               // Routes for user authentication (register, login)
const floodRoutes = require('./flood');             // Routes related to flood data (download, zones)
const gisRoutes = require('./gis');                 // Routes for GIS-related operations (risk analysis, flood zones)
const incidentRoutes = require('./incident');       // Routes for incident management (CRUD on incidents)
const authenticateToken = require('../middleware/authenticateToken'); // Middleware to protect routes via JWT auth

// Mount public routes without authentication
router.use('/auth', authRoutes);    // Public authentication endpoints
router.use('/flood', floodRoutes);  // Flood data endpoints accessible without auth
router.use('/gis', gisRoutes);      // GIS data endpoints accessible without auth

// Mount protected routes with authentication middleware
// All routes under /incidents require a valid JWT token
router.use('/incidents', authenticateToken, incidentRoutes);

// Export the router to be used in the main app.js or server.js
module.exports = router;
