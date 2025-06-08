import axios from 'axios'; // Import axios for HTTP requests
import { API_ENDPOINTS } from '../config/api'; // Import API endpoint URLs from config

// Function to fetch flood zones data from the backend
// Makes a GET request to the flood zones API endpoint
export const getFloodZones = () =>
  axios.get(API_ENDPOINTS.FLOOD.ZONES);

// Function to check flood risk at a specific geographic location (latitude, longitude)
// Makes a GET request to the GIS risk endpoint with lat and lng as query parameters
export const checkLocationRisk = (lat, lng) =>
  axios.get(`${API_ENDPOINTS.GIS.RISK}?lat=${lat}&lng=${lng}`);
