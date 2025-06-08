import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// jwtDecode is no longer needed here if AuthContext provides user.role

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, authLoading } = useContext(AuthContext);

  if (authLoading) {
    // You can return a loading spinner or null while auth state is being determined
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading authentication...</div>;
    // Or return null; to show nothing until check is complete
  }

  if (!user) {
    // If auth check is complete and there's no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, now check roles if specified
  // The user object from AuthContext should now have user.role directly
  if (roles.length > 0 && (!user.role || !roles.includes(user.role))) {
    // If roles are required and user doesn't have a matching role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role (if any)
  return children;
};

export default PrivateRoute;