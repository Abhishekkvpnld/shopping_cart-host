const mongoose = require('mongoose');
const collections=require('../../dbconfig/collections');
// Define the User schema
const userSchema = new mongoose.Schema({
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
const Userlogin = mongoose.model(collections.USER_LOGIN, userSchema);

module.exports = Userlogin;
