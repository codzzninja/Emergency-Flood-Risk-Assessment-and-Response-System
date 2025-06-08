import axios from 'axios'; // Import axios for HTTP requests
import { API_ENDPOINTS } from '../config/api'; // Import API endpoint URLs from config

// Helper function to get authorization headers with JWT token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  // Return Authorization header if token exists, otherwise empty object
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Report a new incident by sending incident data to backend API (POST request)
export const reportIncident = (incidentData) =>
  axios.post(API_ENDPOINTS.INCIDENTS.BASE, incidentData, {
    headers: getAuthHeaders(),
  });

// Get incidents list with optional filtering, pagination, and sorting parameters (GET request)
export const getIncidents = (params) =>
  axios.get(API_ENDPOINTS.INCIDENTS.BASE, {
    headers: getAuthHeaders(),
    params: params || {}, // Send params if provided, else empty object
  });

// Get details of a single incident by its ID (GET request)
export const getIncidentById = (id) =>
  axios.get(API_ENDPOINTS.INCIDENTS.BY_ID(id), {
    headers: getAuthHeaders(),
  });

// Update an existing incident by ID with new incident data (PUT request)
export const updateIncident = (id, incidentData) =>
  axios.put(API_ENDPOINTS.INCIDENTS.BY_ID(id), incidentData, {
    headers: getAuthHeaders(),
  });

// Delete an incident by its ID (DELETE request)
export const deleteIncident = (id) =>
  axios.delete(API_ENDPOINTS.INCIDENTS.BY_ID(id), {
    headers: getAuthHeaders(),
  });

// Add a rescue step to a specific incident
// Uses either configured API endpoint or defaults to REST convention
export const addRescueStep = (incidentId, stepData) => {
  const rescueStepsEndpoint = API_ENDPOINTS.INCIDENTS.RESCUE_STEPS
    ? API_ENDPOINTS.INCIDENTS.RESCUE_STEPS(incidentId)
    : `${API_ENDPOINTS.INCIDENTS.BASE}/${incidentId}/rescue-steps`;
  return axios.post(rescueStepsEndpoint, stepData, {
    headers: getAuthHeaders(),
  });
};

// Update a specific rescue step (by step number) for an incident
// Uses either configured API endpoint or defaults to REST convention
export const updateRescueStep = (incidentId, stepNumber, stepData) => {
  const rescueStepEndpoint = API_ENDPOINTS.INCIDENTS.RESCUE_STEP_BY_NUMBER
    ? API_ENDPOINTS.INCIDENTS.RESCUE_STEP_BY_NUMBER(incidentId, stepNumber)
    : `${API_ENDPOINTS.INCIDENTS.BASE}/${incidentId}/rescue-steps/${stepNumber}`;
  return axios.put(rescueStepEndpoint, stepData, {
    headers: getAuthHeaders(),
  });
};

// Fetch users filtered by their role (e.g., commander, responder, official)
// Sends GET request with role as query parameter
export const getUsersByRole = (role) => {
  return axios.get(`${API_ENDPOINTS.USERS.BASE}`, {
    headers: getAuthHeaders(),
    params: { role }
  });
};
