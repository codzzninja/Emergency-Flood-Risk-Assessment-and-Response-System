const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
// authMiddleware.js exports 'auth' for token protection and 'roleCheck' for authorization
const { auth: protect, roleCheck: authorize } = require('../middleware/authMiddleware');

// --- Incident Routes ---

// POST /api/incidents - Report a new incident (All authenticated users)
router.post(
    '/',
    protect, // All authenticated users can report
    incidentController.reportIncident
);

// GET /api/incidents - Get all incidents with filtering (All authenticated users)
router.get(
    '/',
    protect, // All authenticated users can view incidents
    incidentController.getIncidents
);

// GET /api/incidents/:id - Get a single incident by ID (All authenticated users)
router.get(
    '/:id',
    protect, // All authenticated users can view a specific incident
    incidentController.getIncidentById
);

// PUT /api/incidents/:id - Update an incident (Coordinators, Officials, Commanders)
router.put(
    '/:id',
    protect,
    authorize(['coordinator', 'official', 'commander']),
    incidentController.updateIncident
);

// DELETE /api/incidents/:id - Delete an incident (Officials, Commanders)
router.delete(
    '/:id',
    protect,
    authorize(['official', 'commander']),
    incidentController.deleteIncident
);

// --- Rescue Step Routes ---

// POST /api/incidents/:id/rescue-steps - Add a rescue step (Coordinators, Commanders)
router.post(
    '/:id/rescue-steps',
    protect,
    authorize(['coordinator', 'commander']),
    incidentController.addRescueStep
);

// PUT /api/incidents/:id/rescue-steps/:stepNumber - Update a rescue step (Coordinators, Commanders, Responders)
// Note: For responders, additional logic might be needed in the controller to ensure they only update steps assigned to them or their incident.
router.put(
    '/:id/rescue-steps/:stepNumber',
    protect,
    authorize(['coordinator', 'commander', 'responder']), // Responders might need more granular control
    incidentController.updateRescueStep
);

module.exports = router;