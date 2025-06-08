// Import the jsonwebtoken package to handle JWT token verification
const jwt = require('jsonwebtoken');

// Retrieve the secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure that the JWT secret is defined
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

/**
 * Middleware: auth
 * Purpose: Verifies the JWT token from the Authorization header and attaches the decoded user info to the request object.
 */
exports.auth = (req, res, next) => {
  // Retrieve the Authorization header
  const authHeader = req.headers.authorization;

  // If no header is present or the format is incorrect (doesn’t start with 'Bearer ')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded user info to request object
    req.user = decoded;

    // Proceed to the next middleware/route
    next();
  } catch (err) {
    // Log the error name to the server console for debugging (avoid detailed logs in production)
    console.error('Token verification error:', err.name);

    // Respond with unauthorized status and error details (can be hidden in production)
    res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
};

/**
 * Middleware: roleCheck
 * Purpose: Restricts access based on user roles.
 * @param {Array} roles - Array of roles allowed to access the route.
 */
exports.roleCheck = (roles) => (req, res, next) => {
  // If user is not attached to the request (i.e., not authenticated)
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if the user's role is included in the allowed roles
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // If authorized, continue to the next middleware/route
  next();
};
