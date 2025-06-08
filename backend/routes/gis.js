const express = require('express');
const router = express.Router();
const gisController = require('../controllers/gisController');

// Route: GET /risk
// Checks the risk level of a given location based on flood zones
// Expects query parameters for location (e.g., lat, lng)
router.get('/risk', gisController.checkLocationRisk);

// Route: POST /flood-zones
// Updates the flood zone data in the backend (e.g., replacing or adding new flood zones)
// Expects flood zone data in the request body (usually GeoJSON format)
router.post('/flood-zones', gisController.updateFloodZones);

// Route: GET /flood-zones
// Retrieves the current flood zone data stored in the backend
router.get('/flood-zones', gisController.getFloodZones);

// Export the router for use in the main Express app
module.exports = router;
