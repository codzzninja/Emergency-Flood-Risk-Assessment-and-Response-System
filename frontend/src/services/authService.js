import axios from 'axios'; // Import axios for HTTP requests
import { API_ENDPOINTS } from '../config/api'; // Import API endpoint URLs from config

// Function to send login request to the backend
// Takes username and password as parameters and posts them to the login endpoint
export const login = (username, password) =>
  axios.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });

// Function to send registration request to the backend
// Takes a user object containing registration data and posts it to the register endpoint
export const register = (user) =>
  axios.post(API_ENDPOINTS.AUTH.REGISTER, user);
