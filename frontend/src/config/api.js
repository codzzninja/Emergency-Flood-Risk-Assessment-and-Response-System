// Base URL for the API, set via environment variable or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Object containing all API endpoint URLs used throughout the frontend app
export const API_ENDPOINTS = {
  AUTH: {
    // Endpoint for user login
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    // Endpoint for user registration
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  INCIDENTS: {
    // Base endpoint for incidents-related requests
    BASE: `${API_BASE_URL}/api/incidents`,
    // Endpoint to fetch/update/delete a specific incident by ID
    BY_ID: (id) => `${API_BASE_URL}/api/incidents/${id}`,
    // Endpoint to manage rescue steps for a specific incident
    RESCUE_STEPS: (incidentId) => `${API_BASE_URL}/api/incidents/${incidentId}/rescue-steps`,
    // Endpoint to access or update a specific rescue step by step number
    RESCUE_STEP_BY_NUMBER: (incidentId, stepNumber) =>
      `${API_BASE_URL}/api/incidents/${incidentId}/rescue-steps/${stepNumber}`,
  },
  USERS: {
    // Base endpoint for user management (e.g., fetching user list, profiles)
    BASE: `${API_BASE_URL}/api/users`,
  },
  FLOOD: {
    // Endpoint to access flood zone data (may be used for quick flood zone info)
    ZONES: `${API_BASE_URL}/api/flood/zones`,
  },
  GIS: {
    // Endpoint to check flood risk at a specific location
    RISK: `${API_BASE_URL}/api/gis/risk`,
    // Endpoint to get or update detailed flood zone GIS data
    FLOOD_ZONES: `${API_BASE_URL}/api/gis/flood-zones`,
  }
};

// Export the base URL separately if needed elsewhere in the app
export default API_BASE_URL;
