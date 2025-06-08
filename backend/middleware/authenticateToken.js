// middleware/authenticateToken.js

const jwt = require('jsonwebtoken'); // Import JWT library to verify tokens

/**
 * Middleware to authenticate requests using JWT tokens.
 * Verifies the token provided in the Authorization header and attaches the decoded user object to the request.
 */
const authenticateToken = (req, res, next) => {
  // Retrieve the Authorization header (typically in the format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    // If the header is missing, deny access
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Extract the token part after "Bearer"
  const token = authHeader.split(' ')[1];
  if (!token) {
    // Token is missing in the Authorization header
    return res.status(401).json({ message: 'Token missing' });
  }

  // Verify the token using the secret key (stored securely in environment variable)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If token is invalid or expired, deny access
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Token is valid, attach decoded user payload to request object for further use
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = authenticateToken;
