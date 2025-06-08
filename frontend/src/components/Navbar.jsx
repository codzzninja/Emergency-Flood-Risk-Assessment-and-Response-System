import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode

const Navbar = () => {
  // Get current user and logout function from AuthContext
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle user logout: call logout function and redirect to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Extract user role from JWT token stored in user object
  const getUserRole = () => {
    if (user?.token) {
      try {
        // Decode JWT token to access role claim
        const decoded = jwtDecode(user.token);
        return decoded.role;
      } catch (error) {
        // If token decoding fails, return null
        return null;
      }
    }
    // No token present
    return null;
  };

  // Get role for conditional rendering
  const role = getUserRole();

  // Render navigation for unauthenticated users (no user)
  if (!user) {
    return (
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* App title */}
          <h1 className="text-xl font-bold">Emergency Flood Risk System</h1>
          {/* Links to login and registration pages */}
          <div className="space-x-4">
            <Link to="/login" className="hover:text-blue-200">Login</Link>
            <Link to="/register" className="hover:text-blue-200">Register</Link>
          </div>
        </div>
      </nav>
    );
  }

  // Render navigation for authenticated users with role-based links
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* App title */}
        <h1 className="text-xl font-bold">Emergency Flood Risk System</h1>
        
        <div className="flex items-center space-x-4">
          {/* Common link to dashboard */}
          <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
          
          {/* Show "Report Incident" link only for responders */}
          {role === 'responder' && (
            <Link to="/report" className="hover:text-blue-200">Report Incident</Link>
          )}
          
          {/* Link to view all incidents (available for all authenticated users) */}
          <Link to="/incidents" className="hover:text-blue-200">View Incidents</Link>
          
          {/* Links to manage incidents only for coordinators and officials */}
          {(role === 'coordinator' || role === 'official') && (
            <Link to="/manage-incidents" className="hover:text-blue-200">Manage Incidents</Link>
          )}
          
          {/* Link to map view, accessible to all logged-in users */}
          <Link to="/map" className="hover:text-blue-200">Map View</Link>
          
          {/* Display current user's role for context */}
          <span className="text-blue-200">({role})</span>
          
          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
