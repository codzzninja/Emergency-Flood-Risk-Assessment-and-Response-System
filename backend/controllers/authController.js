const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Retrieve JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

// Controller for registering a new user
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Basic input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if a user with the same username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create a new user instance and save it to the database
    const user = new User({ username, password, role });
    await user.save();

    // Return success response without sending password
    res.status(201).json({ 
      message: 'User registered successfully',
      user: { username: user.username, role: user.role }
    });
  } catch (err) {
    // Handle unexpected server errors
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Controller for logging in a user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = await User.findOne({ username });

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create a JWT token for the authenticated user
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '24h' } // Token validity
    );

    // Respond with token and user details (excluding password)
    res.json({ 
      token,
      user: { username: user.username, role: user.role }
    });
  } catch (err) {
    // Handle unexpected server errors
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};
