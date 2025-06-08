const mongoose = require('mongoose');

// Define the schema for Incident documents in MongoDB
const IncidentSchema = new mongoose.Schema({
  // Title of the incident - required string
  title: { 
    type: String, 
    required: true 
  },

  // Detailed description of the incident - required string
  description: { 
    type: String, 
    required: true 
  },

  // Geographic location of the incident as latitude and longitude
  location: {
    lat: { 
      type: Number, 
      required: true // Latitude is required
    },
    lng: { 
      type: Number, 
      required: true // Longitude is required
    }
  },

  // Reference to the User who reported the incident (ObjectId from 'User' collection)
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  // Timestamp of when the incident was created; defaults to current date/time
  timestamp: { 
    type: Date, 
    default: Date.now 
  },

  // Priority level of the incident, limited to 'low', 'medium', or 'high'
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },

  // Current status of the incident, restricted to specific allowed values
  status: { 
    type: String, 
    enum: ['reported', 'assigned', 'in-progress', 'resolved', 'closed'], 
    default: 'reported' 
  },

  // Reference to the assigned commander (User) handling this incident; nullable
  assignedCommander: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },

  // Array of rescue steps associated with the incident
  rescueSteps: [{
    stepNumber: Number,           // The order number of this step
    instruction: String,          // Instruction text for the step
    isCompleted: {                // Flag to indicate if the step is done
      type: Boolean, 
      default: false 
    }
  }],

  // Optional field for official instructions related to the incident
  officialInstructions: { 
    type: String, 
    default: '' 
  },

  // Notes from the response team regarding the incident
  teamNotes: { 
    type: String, 
    default: '' 
  }
});

// Export the Incident model for use in other parts of the application
module.exports = mongoose.model('Incident', IncidentSchema);
