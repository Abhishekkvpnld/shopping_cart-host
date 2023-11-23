const mongoose = require('mongoose');
const collections=require('../../dbconfig/collections');
// Define the admin schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create a User model using the schema
const adminSignup = mongoose.model(collections.ADMIN_SIGNUP, adminSchema);

module.exports = adminSignup;