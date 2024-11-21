// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  carBrand: { type: String, required: true },
  carModel: { type: String, required: true },
  carYear: { type: Number, required: true },
  
});

module.exports = mongoose.model('User', userSchema);
