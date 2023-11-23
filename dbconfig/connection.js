const mongoose = require('mongoose');
var dbname="shopping_cart"
const url = 'mongodb+srv://abhishekkvpnld:Abhishekkv1999@project1.hvvv7gk.mongodb.net/shopping_cart';
const object= { useNewUrlParser: true, useUnifiedTopology: true }
// Set up a connection to the MongoDB database
mongoose.connect(url,object);
const db = mongoose.connection;
// Handle connection events
db.once('open', () => {
    console.log('Connected to the database successfully');
});
// Export the database connection
module.exports = db;
