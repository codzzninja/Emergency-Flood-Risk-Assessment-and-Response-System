const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for User documents
const UserSchema = new mongoose.Schema({
  // Unique username for the user (required)
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Hashed password for authentication (required)
  password: { 
    type: String, 
    required: true 
  },

  // Role of the user within the system, restricted to predefined roles
  role: { 
    type: String, 
    enum: ['responder', 'coordinator', 'official', 'commander'], 
    default: 'responder' 
  }
});

// Pre-save middleware to hash password before saving user document
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();

  // Hash the password with a salt round of 10
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

// Instance method to compare given plaintext password with stored hashed password
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Export the User model for use in the app
module.exports = mongoose.model('User', UserSchema);
