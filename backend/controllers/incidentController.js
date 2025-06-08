const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const User = require('../models/User');

// Utility -----------------------------------------------------
/**
 * Accepts either a Mongo ObjectId string or a username and
 * returns a valid commander _id (or null if not found).
 */
async function resolveCommanderId(identifier) {
  if (!identifier) return null;

  // Identifier supplied could be an ObjectId or a username.
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const user = await User.findById(identifier);
    return user ? user._id : null;
  }

  // Fallback: treat it as username (case‑insensitive)
  const user = await User.findOne({ username: new RegExp(`^${identifier}$`, 'i') });
  return user ? user._id : null;
}

// ------------------------------------------------------------
// Report a new incident
// ------------------------------------------------------------
exports.reportIncident = async (req, res) => {
  try {
    // Populate reportedBy + (optionally) assignedCommander
    const incidentData = { ...req.body, reportedBy: req.user.id };

    if (incidentData.assignedCommander) {
      const commanderId = await resolveCommanderId(incidentData.assignedCommander);
      if (!commanderId) {
        return res.status(400).json({ message: 'Invalid commander identifier.' });
      }
      incidentData.assignedCommander = commanderId;
    }

    const incident = await Incident.create(incidentData);
    res.status(201).json({ message: 'Incident reported successfully', incident });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ------------------------------------------------------------
// Get a paginated, filterable, and searchable list of incidents
// ------------------------------------------------------------
exports.getIncidents = async (req, res) => {
  try {
    const {
      searchTerm, status, priority, assignedCommander,
      sortBy, order = 'asc', page = 1, limit = 10
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Optional commander filter (accepts username or id)
    if (assignedCommander) {
      const commanderId = await resolveCommanderId(assignedCommander);
      if (!commanderId) {
        return res.status(400).json({ message: 'Invalid commander identifier.' });
      }
      filter.assignedCommander = commanderId;
    }

    // Fuzzy search by title or description
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    // Sorting
    const sortOptions = {};
    if (sortBy) sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    else sortOptions.timestamp = -1; // newest first by default

    const pageNum = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);

    const [incidents, totalIncidents] = await Promise.all([
      Incident.find(filter)
        .populate('reportedBy', 'username role')
        .populate('assignedCommander', 'username role')
        .sort(sortOptions)
        .skip((pageNum - 1) * pageLimit)
        .limit(pageLimit),
      Incident.countDocuments(filter)
    ]);

    res.json({
      incidents,
      totalPages: Math.ceil(totalIncidents / pageLimit),
      currentPage: pageNum,
      totalIncidents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------------------------------------
// Get a specific incident by ID
// ------------------------------------------------------------
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'username role')
      .populate('assignedCommander', 'username role');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------------------------------------
// Update an existing incident (assign commander logic fixed)
// ------------------------------------------------------------
exports.updateIncident = async (req, res) => {
  console.log(`[updateIncident] Attempting to update incident ID: ${req.params.id}`);
  console.log(`[updateIncident] User details: ${JSON.stringify(req.user)}`);
  console.log(`[updateIncident] Incoming request body: ${JSON.stringify(req.body)}`);

  try {
    const updateData = {};

    // Generic fields (update only if explicitly provided)
    ['title', 'description', 'priority', 'status', 'officialInstructions', 'teamNotes'].forEach(key => {
      if (req.body.hasOwnProperty(key)) updateData[key] = req.body[key];
    });

    // Location validation
    if (req.body.hasOwnProperty('location')) {
      const { location } = req.body;
      if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
        updateData.location = { lat: location.lat, lng: location.lng };
      } else {
        return res.status(400).json({ message: 'Invalid location data. Must include numeric lat & lng.' });
      }
    }

    // Commander assignment (now supports username / id) – only certain roles allowed
    if (req.body.hasOwnProperty('assignedCommander')) {
      const allowedRoles = ['coordinator', 'official', 'administrator'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'You are not authorized to assign commanders.' });
      }

      const { assignedCommander } = req.body;
      if (assignedCommander) {
        const commanderId = await resolveCommanderId(assignedCommander);
        if (!commanderId) {
          return res.status(400).json({ message: 'Invalid commander identifier.' });
        }
        updateData.assignedCommander = commanderId;
      } else if (assignedCommander === null) {
        updateData.assignedCommander = null; // Explicit unassign
      }
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reportedBy', 'username role')
      .populate('assignedCommander', 'username role');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ message: 'Incident updated successfully', incident });
  } catch (err) {
    console.error(`[updateIncident] Error: ${err.message}`, err.stack);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }
    if (!res.headersSent) {
      res.status(400).json({ message: err.message || 'Unexpected error during update.' });
    }
  }
};

// ------------------------------------------------------------
// Add a rescue step
// ------------------------------------------------------------
exports.addRescueStep = async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json({ message: 'Instruction is required for a rescue step.' });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const newStepNumber = incident.rescueSteps.length > 0
      ? Math.max(...incident.rescueSteps.map(s => s.stepNumber)) + 1
      : 1;

    incident.rescueSteps.push({ stepNumber: newStepNumber, instruction, isCompleted: false });
    await incident.save();

    res.status(201).json({ message: 'Rescue step added', incident });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ------------------------------------------------------------
// Update an individual rescue step
// ------------------------------------------------------------
exports.updateRescueStep = async (req, res) => {
  try {
    const { stepNumber, instruction, isCompleted } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const step = incident.rescueSteps.find(s => s.stepNumber === Number(stepNumber));
    if (!step) {
      return res.status(404).json({ message: 'Rescue step not found' });
    }

    if (instruction !== undefined) step.instruction = instruction;
    if (isCompleted !== undefined) step.isCompleted = isCompleted;

    await incident.save();
    res.json({ message: 'Rescue step updated', incident });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ------------------------------------------------------------
// Delete an incident
// ------------------------------------------------------------
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ message: 'Incident deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
