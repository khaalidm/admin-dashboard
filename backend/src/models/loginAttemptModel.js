const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
    email: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    success: { type: Boolean, required: true }
});

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);