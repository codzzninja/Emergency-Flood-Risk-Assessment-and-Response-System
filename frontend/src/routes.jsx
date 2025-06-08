// React and routing imports
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import the AuthContext to check the logged-in user and their role
import { AuthContext } from './context/AuthContext';

// Import all the pages used in the application
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIncident from './pages/ReportIncident';
import ViewIncidents from './pages/ViewIncidents';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ManageIncidents from './pages/ManageIncidents';
import MapView from './pages/MapView';
import IncidentDetailPage from './pages/IncidentDetailPage';
import FloodMap from './components/FloodMap'; // Flood Map component for GIS view

const AppRoutes = () => {
  const { user } = useContext(AuthContext); // Get the authenticated user from context

  return (
    <Router>
      {/* Persistent navigation bar at the top of all routes */}
      <Navbar />
      <Routes>

        {/* Redirect root to dashboard or login depending on authentication */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />

        {/* Public login route: redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Public registration route: redirect if already logged in */}
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Unauthorized access route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected route: only users with roles can access */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={["responder", "coordinator", "official"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Only responders can report incidents */}
        <Route
          path="/report"
          element={
            <PrivateRoute roles={["responder"]}>
              <ReportIncident />
            </PrivateRoute>
          }
        />

        {/* All authorized users can view incidents */}
        <Route
          path="/incidents"
          element={
            <PrivateRoute roles={["coordinator", "official", "responder"]}>
              <ViewIncidents />
            </PrivateRoute>
          }
        />

        {/* Coordinators and officials can manage incident status or assignment */}
        <Route
          path="/manage-incidents"
          element={
            <PrivateRoute roles={["coordinator", "official"]}>
              <ManageIncidents />
            </PrivateRoute>
          }
        />

        {/* General map view of incidents for all authorized roles */}
        <Route
          path="/map"
          element={
            <PrivateRoute roles={["responder", "coordinator", "official"]}>
              <MapView />
            </PrivateRoute>
          }
        />

        {/* Incident detail view accessible to all roles including commanders */}
        <Route
          path="/incidents/:id"
          element={
            <PrivateRoute roles={["responder", "coordinator", "official", "commander"]}>
              <IncidentDetailPage />
            </PrivateRoute>
          }
        />

        {/* GIS Flood Map for visualization of high-risk areas */}
        <Route
          path="/flood-map"
          element={
            <PrivateRoute roles={["responder", "coordinator", "official", "commander"]}>
              <FloodMap />
            </PrivateRoute>
          }
        />

        {/* Fallback route for any unmatched paths (404 Not Found) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
